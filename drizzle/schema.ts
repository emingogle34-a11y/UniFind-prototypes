import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  nickname: varchar("nickname", { length: 20 }).unique(),
  email: varchar("email", { length: 320 }),
  points: int("points").default(0).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  suspendedAt: timestamp("suspendedAt"),
  suspensionReason: varchar("suspensionReason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 분실물 게시글 테이블
 */
export const lostItems = mysqlTable("lostItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["lost", "found"]).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 지갑, 전자기기, 열쇠, 가방, 이어폰 등
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(), // 건물명 + 상세 위치
  building: varchar("building", { length: 100 }), // 건물별 필터용
  imageUrl: varchar("imageUrl", { length: 500 }), // 사진 URL
  imageKey: varchar("imageKey", { length: 255 }), // 스토리지 키
  aiCategory: varchar("aiCategory", { length: 50 }), // AI가 인식한 카테고리
  aiConfidence: decimal("aiConfidence", { precision: 3, scale: 2 }), // AI 신뢰도 (0-1)
  status: mysqlEnum("status", ["active", "resolved", "expired"]).default("active").notNull(),
  points: int("points").default(0), // 보상 포인트
  isUrgent: boolean("isUrgent").default(false),
  isHidden: boolean("isHidden").default(false).notNull(),
  moderationNote: varchar("moderationNote", { length: 500 }),
  reportedAt: timestamp("reportedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LostItem = typeof lostItems.$inferSelect;
export type InsertLostItem = typeof lostItems.$inferInsert;

/**
 * 익명 채팅 방 테이블
 */
export const chatRooms = mysqlTable("chatRooms", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  reporterId: int("reporterId").notNull(), // 분실물 보고자
  respondentId: int("respondentId").notNull(), // 응답자 (습득자/분실자)
  reporterAnonymousId: varchar("reporterAnonymousId", { length: 64 }).notNull(), // 익명 ID
  respondentAnonymousId: varchar("respondentAnonymousId", { length: 64 }).notNull(),
  lastMessage: text("lastMessage"),
  lastMessageAt: timestamp("lastMessageAt"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = typeof chatRooms.$inferInsert;

/**
 * 채팅 메시지 테이블
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  senderId: int("senderId").notNull(),
  senderAnonymousId: varchar("senderAnonymousId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterUserId: int("reporterUserId"),
  targetType: mysqlEnum("targetType", ["user", "item", "chat"]).notNull(),
  targetId: int("targetId").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["pending", "reviewing", "resolved", "dismissed"])
    .default("pending")
    .notNull(),
  handledBy: int("handledBy"),
  handledAt: timestamp("handledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const adminAuditLogs = mysqlTable("adminAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }).notNull(),
  targetId: varchar("targetId", { length: 64 }),
  metadata: text("metadata"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;

/**
 * 관계 정의
 */
export const usersRelations = relations(users, ({ many }) => (
  {
    lostItems: many(lostItems),
    chatRooms: many(chatRooms),
  }
));

export const lostItemsRelations = relations(lostItems, ({ one, many }) => (
  {
    user: one(users, {
      fields: [lostItems.userId],
      references: [users.id],
    }),
    chatRooms: many(chatRooms),
  }
));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => (
  {
    item: one(lostItems, {
      fields: [chatRooms.itemId],
      references: [lostItems.id],
    }),
    messages: many(chatMessages),
  }
));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => (
  {
    room: one(chatRooms, {
      fields: [chatMessages.roomId],
      references: [chatRooms.id],
    }),
  }
));
