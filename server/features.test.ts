import { describe, it, expect, beforeAll } from "vitest";
import { createLostItem, getLostItems, getLostItemById, updateLostItemStatus } from "./db";
import { createChatRoom, createChatMessage, getChatMessages } from "./db";

describe("Lost Items Feature", () => {
  let itemId: number;

  it("should create a lost item", async () => {
    const result = await createLostItem({
      userId: 1,
      type: "lost",
      category: "지갑/카드",
      title: "검은색 지갑",
      description: "신분증과 카드가 들어있어요",
      location: "중앙도서관",
      building: "중앙도서관",
      points: 100,
      status: "active",
      reportedAt: new Date(),
    });
    
    expect(result).toBeDefined();
    itemId = (result as any).insertId || 1;
  });

  it("should get lost items with filters", async () => {
    const items = await getLostItems({ building: "중앙도서관", type: "lost" });
    expect(Array.isArray(items)).toBe(true);
  });

  it("should get lost item by id", async () => {
    const item = await getLostItemById(itemId);
    expect(item).toBeDefined();
    if (item) {
      expect(item.type).toBe("lost");
      expect(item.category).toBe("지갑/카드");
    }
  });

  it("should update lost item status", async () => {
    const result = await updateLostItemStatus(itemId, "resolved");
    expect(result).toBeDefined();
  });
});

describe("Chat Feature", () => {
  let roomId: number;

  it("should create a chat room", async () => {
    const result = await createChatRoom({
      itemId: 1,
      reporterId: 1,
      respondentId: 2,
      reporterAnonymousId: "anon_1",
      respondentAnonymousId: "anon_2",
      lastMessage: "안녕하세요",
      lastMessageAt: new Date(),
    });
    
    expect(result).toBeDefined();
    roomId = (result as any).insertId || 1;
  });

  it("should create a chat message", async () => {
    const result = await createChatMessage({
      roomId: roomId,
      senderId: 1,
      senderAnonymousId: "anon_1",
      content: "이 물건을 찾았어요",
      createdAt: new Date(),
    });
    
    expect(result).toBeDefined();
  });

  it("should get chat messages", async () => {
    const messages = await getChatMessages(roomId);
    expect(Array.isArray(messages)).toBe(true);
  });
});
