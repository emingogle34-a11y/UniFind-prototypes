/**
 * Web Push Notification Service
 * 브라우저 기반 푸시 알림 관리
 */

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string; // 같은 태그의 알림은 중복 제거
  requireInteraction?: boolean;
}

class NotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  /**
   * 서비스 워커 등록 및 푸시 알림 권한 요청
   */
  async initialize(): Promise<boolean> {
    try {
      // 브라우저 지원 확인
      if (!("serviceWorker" in navigator) || !("Notification" in window)) {
        console.warn("[Notification] Browser does not support notifications");
        return false;
      }

      // 서비스 워커 등록
      if ("serviceWorker" in navigator) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(
          "/notification-sw.js",
          { scope: "/" }
        );
        console.log("[Notification] Service Worker registered");
      }

      // 권한 확인
      if (Notification.permission === "granted") {
        return true;
      }

      // 권한 요청
      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }

      return false;
    } catch (error) {
      console.error("[Notification] Initialization failed:", error);
      return false;
    }
  }

  /**
   * 로컬 알림 표시
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    try {
      if (Notification.permission !== "granted") {
        console.warn("[Notification] Permission not granted");
        return;
      }

      if (this.serviceWorkerRegistration) {
        // 서비스 워커를 통한 알림
        await this.serviceWorkerRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || "/icon-192x192.png",
          badge: options.badge || "/badge-72x72.png",
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
        } as any);
      } else {
        // 직접 알림 (서비스 워커 없을 때)
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/icon-192x192.png",
        });
      }
    } catch (error) {
      console.error("[Notification] Failed to show notification:", error);
    }
  }

  /**
   * 분실물 발견 알림
   */
  async notifyItemFound(itemTitle: string, building: string): Promise<void> {
    await this.showNotification({
      title: "분실물이 발견ub418었어요! 🎉",
      body: `${building}에서 "${itemTitle}"가 발견ub418었습니다.`,
      tag: `found-${itemTitle}`,
      requireInteraction: true,
    });
  }

  /**
   * 채팅 메시지 알림
   */
  async notifyChatMessage(senderName: string, message: string): Promise<void> {
    await this.showNotification({
      title: `${senderName}님의 메시지 💬`,
      body: message.substring(0, 100),
      tag: `chat-${senderName}`,
    });
  }

  /**
   * 포인트 적립 알림
   */
  async notifyPointsEarned(points: number, reason: string): Promise<void> {
    await this.showNotification({
      title: `포인트를 적립했어요! 🪙`,
      body: `${reason}로 ${points}P를 획듍했습니다.`,
      tag: "points-earned",
    });
  }

  /**
   * 분실물 만료 알림
   */
  async notifyItemExpiring(itemTitle: string, daysLeft: number): Promise<void> {
    await this.showNotification({
      title: "분실물 보관 기간이 얼마 남지 않았어요 ⏰",
      body: `"${itemTitle}"의 보관 기간이 ${daysLeft}일 남았습니다.`,
      tag: `expiring-${itemTitle}`,
      requireInteraction: true,
    });
  }

  /**
   * 신뢰도 변화 알림
   */
  async notifyTrustScoreChanged(newScore: number, change: number): Promise<void> {
    const emoji = change > 0 ? "📈" : "📉";
    await this.showNotification({
      title: `신뢰도가 변경되었어요 ${emoji}`,
      body: `신뢰도: ${newScore}점 (${change > 0 ? "+" : ""}${change})`,
      tag: "trust-score-changed",
    });
  }

  /**
   * 모든 알림 권한 확인
   */
  isEnabled(): boolean {
    return Notification.permission === "granted";
  }

  /**
   * 권한 상태 반환
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * 알림 설정 저장 (localStorage)
   */
  saveSettings(settings: Record<string, boolean>): void {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("[Notification] Failed to save settings:", error);
    }
  }

  /**
   * 알림 설정 불러오기 (localStorage)
   */
  loadSettings(): Record<string, boolean> | null {
    try {
      const settings = localStorage.getItem("notificationSettings");
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error("[Notification] Failed to load settings:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
