import { COOKIE_NAME } from "@shared/const";
import { validateNickname } from "@shared/nickname";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createLostItem, 
  getLostItems, 
  getLostItemById, 
  updateLostItemStatus,
  createChatRoom,
  getChatRoom,
  getChatRoomsByUserId,
  createChatMessage,
  getChatMessages,
  getUserByNickname,
  updateUserNickname
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";

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

    // 분실물 상세 조회
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const item = await getLostItemById(input);
        return item;
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
        const result = await createLostItem({
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
        });

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
