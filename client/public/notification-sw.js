// Service Worker for Push Notifications
// 푸시 알림 처리 및 백그라운드 이벤트 관리

self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("[SW] Push event but no data");
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/badge-72x72.png",
      tag: data.tag || "default",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "알림", options)
    );
  } catch (error) {
    console.error("[SW] Error processing push event:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 창이 있으면 포커스
        for (let client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});

// 서비스 워커 설치
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installed");
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(clients.claim());
});
