import { eq, desc, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lostItems, InsertLostItem, chatRooms, InsertChatRoom, chatMessages, InsertChatMessage } from "../drizzle/schema";
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

export async function getLostItems(filters?: { building?: string; type?: "lost" | "found"; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [];
  if (filters?.building) conditions.push(eq(lostItems.building, filters.building));
  if (filters?.type) conditions.push(eq(lostItems.type, filters.type as any));
  if (filters?.status) conditions.push(eq(lostItems.status, filters.status as any));
  
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
