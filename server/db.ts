import { eq, desc, and, or, sql, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  lostItems,
  InsertLostItem,
  chatRooms,
  InsertChatRoom,
  chatMessages,
  InsertChatMessage,
  reports,
  adminAuditLogs,
  InsertAdminAuditLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByNickname(nickname: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by nickname: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.nickname, nickname)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserNickname(userId: number, nickname: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ nickname }).where(eq(users.id, userId));

  return { id: userId, nickname };
}

// 분실물 쿼리 헬퍼
export async function createLostItem(item: InsertLostItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lostItems).values(item);
  return result;
}

export async function createLostItemWithReward(item: InsertLostItem, rewardPoints: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const result = await tx.insert(lostItems).values(item);
    await tx
      .update(users)
      .set({ points: sql`${users.points} + ${rewardPoints}` })
      .where(eq(users.id, item.userId));

    return { result, rewardPoints };
  });
}

export async function getLostItems(filters?: { building?: string; type?: "lost" | "found"; status?: string; userId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [eq(lostItems.isHidden, false)];
  if (filters?.building) conditions.push(eq(lostItems.building, filters.building));
  if (filters?.type) conditions.push(eq(lostItems.type, filters.type as any));
  if (filters?.status) conditions.push(eq(lostItems.status, filters.status as any));
  if (filters?.userId) conditions.push(eq(lostItems.userId, filters.userId));
  
  const query = conditions.length > 0 
    ? db.select().from(lostItems).where(and(...conditions)).orderBy(desc(lostItems.createdAt))
    : db.select().from(lostItems).orderBy(desc(lostItems.createdAt));
  
  return query;
}

export async function getLostItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lostItems).where(eq(lostItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateLostItemStatus(id: number, status: "active" | "resolved" | "expired") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(lostItems).set({ status, resolvedAt: new Date() }).where(eq(lostItems.id, id));
}

// 채팅 쿼리 헬퍼
export async function createChatRoom(room: InsertChatRoom) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatRooms).values(room);
  return result;
}

export async function getChatRoom(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getChatRoomsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatRooms).where(or(eq(chatRooms.reporterId, userId), eq(chatRooms.respondentId, userId))).orderBy(desc(chatRooms.updatedAt));
}

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values(message);
}

export async function getChatMessages(roomId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.roomId, roomId)).orderBy(desc(chatMessages.createdAt));
}

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [[userCount], [itemCount], [chatRoomCount], [messageCount], [reportCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(lostItems),
    db.select({ count: sql<number>`count(*)` }).from(chatRooms),
    db.select({ count: sql<number>`count(*)` }).from(chatMessages),
    db.select({ count: sql<number>`count(*)` }).from(reports),
  ]);

  return {
    users: Number(userCount?.count ?? 0),
    items: Number(itemCount?.count ?? 0),
    chatRooms: Number(chatRoomCount?.count ?? 0),
    messages: Number(messageCount?.count ?? 0),
    reports: Number(reportCount?.count ?? 0),
  };
}

export async function listAdminUsers(input: { query?: string; page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = input.query?.trim();
  const search = query
    ? or(
        like(users.name, `%${query}%`),
        like(users.nickname, `%${query}%`),
        like(users.email, `%${query}%`),
      )
    : undefined;
  const offset = (input.page - 1) * input.pageSize;
  const rows = await db
    .select()
    .from(users)
    .where(search)
    .orderBy(desc(users.createdAt))
    .limit(input.pageSize)
    .offset(offset);
  const [totalRow] = await db.select({ count: sql<number>`count(*)` }).from(users).where(search);

  return { rows, total: Number(totalRow?.count ?? 0), page: input.page, pageSize: input.pageSize };
}

export async function updateAdminUser(
  id: number,
  values: {
    role?: "user" | "admin";
    suspendedAt?: Date | null;
    suspensionReason?: string | null;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(values).where(eq(users.id, id));
  return db.select().from(users).where(eq(users.id, id)).limit(1).then(rows => rows[0] ?? null);
}

export async function listAdminItems(input: {
  query?: string;
  type?: "lost" | "found";
  status?: "active" | "resolved" | "expired";
  hidden?: boolean;
  page: number;
  pageSize: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions: any[] = [];
  const query = input.query?.trim();
  if (query) {
    conditions.push(or(
      like(lostItems.title, `%${query}%`),
      like(lostItems.description, `%${query}%`),
      like(lostItems.location, `%${query}%`),
    ));
  }
  if (input.type) conditions.push(eq(lostItems.type, input.type));
  if (input.status) conditions.push(eq(lostItems.status, input.status));
  if (input.hidden !== undefined) conditions.push(eq(lostItems.isHidden, input.hidden));
  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.pageSize;

  const rows = await db
    .select({ item: lostItems, ownerName: users.name, ownerEmail: users.email })
    .from(lostItems)
    .leftJoin(users, eq(lostItems.userId, users.id))
    .where(where)
    .orderBy(desc(lostItems.createdAt))
    .limit(input.pageSize)
    .offset(offset);
  const [totalRow] = await db.select({ count: sql<number>`count(*)` }).from(lostItems).where(where);

  return { rows, total: Number(totalRow?.count ?? 0), page: input.page, pageSize: input.pageSize };
}

export async function updateAdminItem(
  id: number,
  values: {
    title?: string;
    description?: string | null;
    category?: string;
    location?: string;
    building?: string | null;
    status?: "active" | "resolved" | "expired";
    isHidden?: boolean;
    moderationNote?: string | null;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lostItems).set(values).where(eq(lostItems.id, id));
  return getLostItemById(id);
}

export async function deleteAdminItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async tx => {
    const rooms = await tx.select({ id: chatRooms.id }).from(chatRooms).where(eq(chatRooms.itemId, id));
    const roomIds = rooms.map(room => room.id);
    if (roomIds.length) {
      await tx.delete(chatMessages).where(inArray(chatMessages.roomId, roomIds));
      await tx.delete(chatRooms).where(inArray(chatRooms.id, roomIds));
    }
    await tx.delete(lostItems).where(eq(lostItems.id, id));
    return { success: true } as const;
  });
}

export async function listAdminReports(input: { status?: "pending" | "reviewing" | "resolved" | "dismissed"; page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const where = input.status ? eq(reports.status, input.status) : undefined;
  const offset = (input.page - 1) * input.pageSize;
  const rows = await db.select().from(reports).where(where).orderBy(desc(reports.createdAt)).limit(input.pageSize).offset(offset);
  const [totalRow] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(where);
  return { rows, total: Number(totalRow?.count ?? 0), page: input.page, pageSize: input.pageSize };
}

export async function updateAdminReport(
  id: number,
  values: { status: "pending" | "reviewing" | "resolved" | "dismissed"; handledBy: number; handledAt: Date },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reports).set(values).where(eq(reports.id, id));
  return db.select().from(reports).where(eq(reports.id, id)).limit(1).then(rows => rows[0] ?? null);
}

export async function writeAdminAuditLog(log: InsertAdminAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminAuditLogs).values(log);
}

export async function listAdminAuditLogs(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(limit);
}
