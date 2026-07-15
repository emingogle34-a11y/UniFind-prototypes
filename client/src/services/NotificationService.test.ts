import { describe, it, expect, beforeEach, vi } from "vitest";
import { notificationService } from "./NotificationService";

// Mock Notification API
global.Notification = vi.fn() as any;
Object.defineProperty(global.Notification, "permission", {
  value: "granted",
  writable: true,
});

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isEnabled", () => {
    it("should return true when permission is granted", () => {
      Object.defineProperty(global.Notification, "permission", {
        value: "granted",
        writable: true,
      });
      expect(notificationService.isEnabled()).toBe(true);
    });

    it("should return false when permission is denied", () => {
      Object.defineProperty(global.Notification, "permission", {
        value: "denied",
        writable: true,
      });
      expect(notificationService.isEnabled()).toBe(false);
    });
  });

  describe("getPermissionStatus", () => {
    it("should return current permission status", () => {
      Object.defineProperty(global.Notification, "permission", {
        value: "granted",
        writable: true,
      });
      expect(notificationService.getPermissionStatus()).toBe("granted");
    });
  });

  describe("notification methods", () => {
    beforeEach(() => {
      Object.defineProperty(global.Notification, "permission", {
        value: "granted",
        writable: true,
      });
    });

    it("should call showNotification for item found", async () => {
      const showSpy = vi.spyOn(notificationService, "showNotification");
      await notificationService.notifyItemFound("지갑", "학생식당");
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("발견"),
          body: expect.stringContaining("지갑"),
        })
      );
    });

    it("should call showNotification for chat message", async () => {
      const showSpy = vi.spyOn(notificationService, "showNotification");
      await notificationService.notifyChatMessage("김철수", "안녕하세요");
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("메시지"),
          body: expect.stringContaining("안녕하세요"),
        })
      );
    });

    it("should call showNotification for points earned", async () => {
      const showSpy = vi.spyOn(notificationService, "showNotification");
      await notificationService.notifyPointsEarned(100, "분실물 도움");
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("포인트"),
          body: expect.stringContaining("100P"),
        })
      );
    });

    it("should call showNotification for item expiring", async () => {
      const showSpy = vi.spyOn(notificationService, "showNotification");
      await notificationService.notifyItemExpiring("열쇠", 3);
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("만료"),
          body: expect.stringContaining("3일"),
        })
      );
    });

    it("should call showNotification for trust score change", async () => {
      const showSpy = vi.spyOn(notificationService, "showNotification");
      await notificationService.notifyTrustScoreChanged(85, 5);
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("신뢰도"),
          body: expect.stringContaining("85점"),
        })
      );
    });
  });
});
