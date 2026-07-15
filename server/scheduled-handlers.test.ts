import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import { handleExpireItems, handleGenerateStatistics } from "./scheduled-handlers";

// Mock SDK
vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: vi.fn(),
  },
}));

// Mock DB
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Scheduled Handlers", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: any;
  let statusMock: any;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnValue({});
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {
      url: "/api/scheduled/test",
      headers: {},
    };
    
    mockRes = {
      json: jsonMock,
      status: statusMock,
    };
  });

  describe("handleExpireItems", () => {
    it("should reject non-cron requests", async () => {
      const { sdk } = await import("./_core/sdk");
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: false,
        user: { id: "user-1" },
      } as any);

      await handleExpireItems(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "cron-only" });
    });

    it("should handle database unavailability", async () => {
      const { sdk } = await import("./_core/sdk");
      const { getDb } = await import("./db");
      
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: true,
        taskUid: "task-123",
      } as any);
      
      vi.mocked(getDb).mockResolvedValue(null);

      await handleExpireItems(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Database not available" });
    });

    it("should return success response on valid cron request", async () => {
      const { sdk } = await import("./_core/sdk");
      const { getDb } = await import("./db");
      
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: true,
        taskUid: "task-123",
      } as any);
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await handleExpireItems(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          updatedCount: 0,
        })
      );
    });
  });

  describe("handleGenerateStatistics", () => {
    it("should reject non-cron requests", async () => {
      const { sdk } = await import("./_core/sdk");
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: false,
        user: { id: "user-1" },
      } as any);

      await handleGenerateStatistics(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: "cron-only" });
    });

    it("should handle database unavailability", async () => {
      const { sdk } = await import("./_core/sdk");
      const { getDb } = await import("./db");
      
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: true,
        taskUid: "task-123",
      } as any);
      
      vi.mocked(getDb).mockResolvedValue(null);

      await handleGenerateStatistics(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Database not available" });
    });

    it("should return statistics on valid cron request", async () => {
      const { sdk } = await import("./_core/sdk");
      const { getDb } = await import("./db");
      
      vi.mocked(sdk.authenticateRequest).mockResolvedValue({
        isCron: true,
        taskUid: "task-123",
      } as any);
      
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      await handleGenerateStatistics(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          riskAreas: expect.any(Array),
          totalItems: 0,
        })
      );
    });
  });
});
