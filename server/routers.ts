import { COOKIE_NAME } from "@shared/const";
import { validateNickname } from "@shared/nickname";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createLostItemWithReward,
  getLostItems, 
  getLostItemById, 
  updateLostItemStatus,
  createChatRoom,
  getChatRoom,
  getChatRoomsByUserId,
  createChatMessage,
  getChatMessages,
  getUserByNickname,
  updateUserNickname,
  upsertUser,
  getUserByOpenId,
  getAdminDashboardStats,
  listAdminUsers,
  updateAdminUser,
  listAdminItems,
  updateAdminItem,
  deleteAdminItem,
  listAdminReports,
  updateAdminReport,
  writeAdminAuditLog,
  listAdminAuditLogs,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import {
  clearMasterKeyFailures,
  getClientIp,
  getMasterKeyLockSeconds,
  recordMasterKeyFailure,
  verifyMasterKey,
} from "./admin-auth";

const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const MASTER_ADMIN_OPEN_ID = "unifind_master_admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    checkNicknameAvailable: publicProcedure
      .input(z.object({ nickname: z.string() }))
      .query(async ({ input }) => {
        const validation = validateNickname(input.nickname);

        if (!validation.valid) {
          return {
            available: false,
            nickname: validation.nickname,
            message: validation.message,
          };
        }

        const existingUser = await getUserByNickname(validation.nickname);

        if (existingUser) {
          return {
            available: false,
            nickname: validation.nickname,
            message: "이미 사용 중인 닉네임이에요.",
          };
        }

        return {
          available: true,
          nickname: validation.nickname,
          message: "사용 가능한 닉네임입니다.",
        };
      }),
    updateNickname: protectedProcedure
      .input(z.object({ nickname: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const validation = validateNickname(input.nickname);

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.message,
          });
        }

        const existingUser = await getUserByNickname(validation.nickname);

        if (existingUser && existingUser.id !== ctx.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "이미 사용 중인 닉네임이에요.",
          });
        }

        await updateUserNickname(ctx.user.id, validation.nickname);

        return {
          success: true,
          nickname: validation.nickname,
        } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    masterKeyLogin: publicProcedure
      .input(z.object({ masterKey: z.string().min(8).max(256) }))
      .mutation(async ({ ctx, input }) => {
        const ipAddress = getClientIp(ctx.req);
        const lockSeconds = getMasterKeyLockSeconds(ipAddress);

        if (lockSeconds > 0) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `로그인 시도가 잠겼습니다. ${Math.ceil(lockSeconds / 60)}분 후 다시 시도해주세요.`,
          });
        }

        if (!ENV.adminMasterKeyHash) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "서버에 ADMIN_MASTER_KEY_HASH가 설정되지 않았습니다.",
          });
        }

        let isValid = false;
        try {
          isValid = await verifyMasterKey(input.masterKey, ENV.adminMasterKeyHash);
        } catch (error) {
          console.error("[Admin Auth] Invalid master key hash configuration", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "관리자 인증 설정을 확인해주세요.",
          });
        }

        if (!isValid) {
          const attempt = recordMasterKeyFailure(ipAddress);
          console.warn("[Admin Auth] Failed master key attempt", { ipAddress, failures: attempt.failures });
          throw new TRPCError({
            code: attempt.lockedUntil ? "TOO_MANY_REQUESTS" : "UNAUTHORIZED",
            message: attempt.lockedUntil
              ? "5회 실패하여 15분 동안 로그인이 잠겼습니다."
              : `마스터키가 올바르지 않습니다. ${attempt.attemptsRemaining}회 남았습니다.`,
          });
        }

        clearMasterKeyFailures(ipAddress);
        await upsertUser({
          openId: MASTER_ADMIN_OPEN_ID,
          name: "UniFind 운영자",
          email: null,
          loginMethod: "master-key",
          role: "admin",
          lastSignedIn: new Date(),
        });
        const adminUser = await getUserByOpenId(MASTER_ADMIN_OPEN_ID);
        if (!adminUser) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "관리자 계정을 저장할 데이터베이스 연결이 필요합니다.",
          });
        }

        const sessionToken = await sdk.createSessionToken(adminUser.openId, {
          name: adminUser.name ?? "UniFind 운영자",
          role: "admin",
          expiresInMs: ADMIN_SESSION_DURATION_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ADMIN_SESSION_DURATION_MS });
        await writeAdminAuditLog({
          adminUserId: adminUser.id,
          action: "admin.login",
          targetType: "session",
          targetId: adminUser.id.toString(),
          ipAddress,
          metadata: JSON.stringify({ method: "master-key" }),
        });

        return { success: true, role: "admin" as const, expiresInMs: ADMIN_SESSION_DURATION_MS };
      }),

    dashboard: adminProcedure.query(() => getAdminDashboardStats()),

    users: adminProcedure
      .input(z.object({
        query: z.string().max(100).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(5).max(100).default(20),
      }))
      .query(({ input }) => listAdminUsers(input)),

    updateUser: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        role: z.enum(["user", "admin"]).optional(),
        suspended: z.boolean().optional(),
        suspensionReason: z.string().max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.id === ctx.user.id && (input.role === "user" || input.suspended === true)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "현재 관리자 계정의 권한을 직접 해제하거나 정지할 수 없습니다." });
        }
        const updated = await updateAdminUser(input.id, {
          role: input.role,
          suspendedAt: input.suspended === undefined ? undefined : input.suspended ? new Date() : null,
          suspensionReason: input.suspended === undefined ? undefined : input.suspended ? input.suspensionReason?.trim() || "관리자 조치" : null,
        });
        await writeAdminAuditLog({
          adminUserId: ctx.user.id,
          action: "user.update",
          targetType: "user",
          targetId: input.id.toString(),
          ipAddress: getClientIp(ctx.req),
          metadata: JSON.stringify({ role: input.role, suspended: input.suspended, suspensionReason: input.suspensionReason }),
        });
        return updated;
      }),

    items: adminProcedure
      .input(z.object({
        query: z.string().max(100).optional(),
        type: z.enum(["lost", "found"]).optional(),
        status: z.enum(["active", "resolved", "expired"]).optional(),
        hidden: z.boolean().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(5).max(100).default(20),
      }))
      .query(({ input }) => listAdminItems(input)),

    updateItem: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).nullable().optional(),
        category: z.string().min(1).max(50).optional(),
        location: z.string().min(1).max(255).optional(),
        building: z.string().max(100).nullable().optional(),
        status: z.enum(["active", "resolved", "expired"]).optional(),
        isHidden: z.boolean().optional(),
        moderationNote: z.string().max(500).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...values } = input;
        const updated = await updateAdminItem(id, values);
        await writeAdminAuditLog({
          adminUserId: ctx.user.id,
          action: "item.update",
          targetType: "item",
          targetId: id.toString(),
          ipAddress: getClientIp(ctx.req),
          metadata: JSON.stringify(values),
        });
        return updated;
      }),

    deleteItem: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const result = await deleteAdminItem(input.id);
        await writeAdminAuditLog({
          adminUserId: ctx.user.id,
          action: "item.delete",
          targetType: "item",
          targetId: input.id.toString(),
          ipAddress: getClientIp(ctx.req),
        });
        return result;
      }),

    reports: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "reviewing", "resolved", "dismissed"]).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(5).max(100).default(20),
      }))
      .query(({ input }) => listAdminReports(input)),

    updateReport: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["pending", "reviewing", "resolved", "dismissed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const updated = await updateAdminReport(input.id, {
          status: input.status,
          handledBy: ctx.user.id,
          handledAt: new Date(),
        });
        await writeAdminAuditLog({
          adminUserId: ctx.user.id,
          action: "report.update",
          targetType: "report",
          targetId: input.id.toString(),
          ipAddress: getClientIp(ctx.req),
          metadata: JSON.stringify({ status: input.status }),
        });
        return updated;
      }),

    auditLogs: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }))
      .query(({ input }) => listAdminAuditLogs(input.limit)),
  }),

  // 분실물 라우터
  items: router({
    // 분실물 목록 조회
    list: publicProcedure
      .input(z.object({
        building: z.string().optional(),
        type: z.enum(["lost", "found"]).optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const items = await getLostItems(input);
        return items;
      }),

    mine: protectedProcedure
      .input(z.object({
        building: z.string().optional(),
        type: z.enum(["lost", "found"]).optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getLostItems({ ...input, userId: ctx.user.id });
      }),

    // 분실물 상세 조회
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const item = await getLostItemById(input);
        return item?.isHidden ? null : item;
      }),

    // 분실물 등록 (사진 업로드 포함)
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["lost", "found"]),
        category: z.string(),
        title: z.string(),
        description: z.string().optional(),
        location: z.string(),
        building: z.string().optional(),
        imageBase64: z.string().optional(), // Base64 인코딩된 이미지
        isUrgent: z.boolean().optional(),
        points: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let imageUrl = null;
        let imageKey = null;
        let aiCategory = null;
        let aiConfidence = null;

        // 이미지 업로드 및 AI 분류
        if (input.imageBase64) {
          try {
            // Base64를 Buffer로 변환
            const buffer = Buffer.from(input.imageBase64, "base64");
            
            // S3에 업로드
            const fileName = `lost-items/${nanoid()}.jpg`;
            const { key, url } = await storagePut(fileName, buffer, "image/jpeg");
            imageUrl = url;
            imageKey = key;

            // AI 이미지 분류
            try {
              const response = await invokeLLM({
                messages: [
                  {
                    role: "system",
                    content: "당신은 분실물 분류 전문가입니다. 이미지를 분석하여 물건의 카테고리를 정확히 분류하세요. 응답은 JSON 형식으로 { category: string, confidence: number (0-1) } 형태로 반환하세요.",
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text" as const,
                        text: "이 이미지의 물건을 분류해주세요. 가능한 카테고리: 지갑, 전자기기, 열쇠, 가방, 이어폰, 의류, 책, 기타",
                      },
                      {
                        type: "image_url" as const,
                        image_url: { url: imageUrl },
                      },
                    ] as any,
                  },
                ],
                response_format: {
                  type: "json_schema",
                  json_schema: {
                    name: "item_classification",
                    strict: true,
                    schema: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        confidence: { type: "number" },
                      },
                      required: ["category", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
              });

              const content = response.choices[0]?.message.content;
              if (content && typeof content === 'string') {
                const parsed = JSON.parse(content);
                aiCategory = parsed.category;
                aiConfidence = parseFloat(parsed.confidence);
              }
            } catch (error) {
              console.error("AI 분류 실패:", error);
            }
          } catch (error) {
            console.error("이미지 업로드 실패:", error);
          }
        }

        // 분실물 생성
        const rewardPoints = input.type === "found" ? 200 : 100;
        const result = await createLostItemWithReward({
          userId: ctx.user.id,
          type: input.type,
          category: input.category,
          title: input.title,
          description: input.description,
          location: input.location,
          building: input.building,
          imageUrl,
          imageKey,
          aiCategory,
          aiConfidence: aiConfidence ? aiConfidence.toString() : null,
          status: "active",
          points: input.points || 0,
          isUrgent: input.isUrgent || false,
        }, rewardPoints);

        return result;
      }),

    // 분실물 상태 업데이트
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "resolved", "expired"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const item = await getLostItemById(input.id);
        if (!item || item.userId !== ctx.user.id) {
          throw new Error("권한이 없습니다");
        }
        return updateLostItemStatus(input.id, input.status);
      }),
  }),

  // 채팅 라우터
  chat: router({
    // 채팅 방 목록
    rooms: protectedProcedure.query(async ({ ctx }) => {
      return getChatRoomsByUserId(ctx.user.id);
    }),

    // 채팅 방 생성
    createRoom: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        respondentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const anonymousId = nanoid();
        const respondentAnonymousId = nanoid();

        return createChatRoom({
          itemId: input.itemId,
          reporterId: ctx.user.id,
          respondentId: input.respondentId,
          reporterAnonymousId: anonymousId,
          respondentAnonymousId: respondentAnonymousId,
        });
      }),

    // 채팅 메시지 조회
    messages: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getChatMessages(input);
      }),

    // 메시지 전송
    sendMessage: protectedProcedure
      .input(z.object({
        roomId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const room = await getChatRoom(input.roomId);
        if (!room) throw new Error("채팅 방을 찾을 수 없습니다");

        const isReporter = room.reporterId === ctx.user.id;
        const senderAnonymousId = isReporter ? room.reporterAnonymousId : room.respondentAnonymousId;

        return createChatMessage({
          roomId: input.roomId,
          senderId: ctx.user.id,
          senderAnonymousId,
          content: input.content,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
