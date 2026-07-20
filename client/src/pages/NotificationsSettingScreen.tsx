// UniFind - 알림 설정 화면
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, ChevronRight, Bell, MessageCircle, Gift, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { notificationService } from "@/services/NotificationService";

export default function NotificationsSettingScreen() {
  const { goBack } = useApp();
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState({
    foundItems: true,
    chatMessages: true,
    pointsEarned: true,
    itemExpiring: true,
    trustScoreChanged: true,
  });

  useEffect(() => {
    // 알림 권한 확인 및 설정 불러오기
    const checkPermission = async () => {
      const enabled = notificationService.isEnabled();
      setIsEnabled(enabled);
      
      // 저장된 설정 불러오기
      const savedSettings = notificationService.loadSettings();
      if (savedSettings) {
        setSettings(savedSettings as typeof settings);
      }
    };
    checkPermission();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const success = await notificationService.initialize();
      if (success) {
        setIsEnabled(true);
        toast.success("알림이 활성화되었습니다");
      } else {
        toast.error("알림 권한을 허용해주세요");
      }
    } catch (error) {
      toast.error("알림 설정에 실패했습니다");
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    notificationService.saveSettings(newSettings);
    toast.success("설정이 저장되었습니다");
  };

  const notificationTypes = [
    {
      key: "foundItems" as const,
      icon: "🎉",
      label: "분실물 발견",
      description: "내 분실물이 발견되었을 때",
    },
    {
      key: "chatMessages" as const,
      icon: "💬",
      label: "채팅 메시지",
      description: "새로운 채팅 메시지가 올 때",
    },
    {
      key: "pointsEarned" as const,
      icon: "🪙",
      label: "포인트 적립",
      description: "포인트를 획득했을 때",
    },
    {
      key: "itemExpiring" as const,
      icon: "⏰",
      label: "보관 기간 만료",
      description: "분실물 보관 기간이 다할 때",
    },
    {
      key: "trustScoreChanged" as const,
      icon: "⭐",
      label: "신뢰도 변화",
      description: "신뢰도가 변경되었을 때",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="bg-background px-5 pt-14 pb-4 sticky top-0 z-40 transition-colors duration-300"
        style={{ boxShadow: "0 1px 0 var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="-ml-2 rounded-full p-2 transition-all active:scale-95" aria-label="이전 화면으로 돌아가기">
            <ArrowLeft size={21} className="text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">알림 설정</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 pb-24 space-y-4 uf-page-enter">
        {/* 알림 활성화 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="uf-card p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: "var(--uf-blue-light)" }}
            >
              <Bell size={20} style={{ color: "var(--uf-blue)" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-foreground">
                {isEnabled ? "알림이 활성화됨" : "알림이 비활성화됨"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEnabled
                  ? "모든 알림을 받을 수 있습니다"
                  : "알림을 받으려면 활성화해주세요"}
              </p>
            </div>
          </div>

          {!isEnabled && (
            <button
              onClick={handleEnableNotifications}
              className="w-full mt-3 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
              style={{
                background: "var(--uf-premium-gradient)",
                color: "white",
              }}
            >
              알림 활성화
            </button>
          )}
        </motion.div>

        {/* 알림 유형별 설정 */}
        <div>
          <p className="text-xs font-bold px-1 mb-2 text-muted-foreground">
            알림 유형
          </p>
          <div className="uf-card divide-y" style={{ borderColor: "var(--border)" }}>
            {notificationTypes.map((type, index) => (
              <motion.button
                key={type.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSetting(type.key)}
                disabled={!isEnabled}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-50"
                style={{
                  color: "var(--foreground)",
                }}
              >
                <span className="text-lg w-7 text-center">{type.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {type.description}
                  </div>
                </div>
                <div
                  className="w-10 h-6 rounded-full transition-all flex items-center px-1"
                  style={{
                    background: settings[type.key]
                      ? "var(--uf-blue)"
                      : "var(--muted)",
                  }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ background: settings[type.key] ? "var(--primary-foreground)" : "var(--card)" }}
                    animate={{
                      x: settings[type.key] ? 16 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 알림 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="uf-card p-4"
          style={{ background: "var(--muted)" }}
        >
          <div className="flex gap-3">
            <AlertCircle size={16} style={{ color: "var(--uf-blue)" }} />
            <div>
              <h4 className="text-xs font-bold text-foreground mb-1">
                알림 권한 안내
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                브라우저 설정에서 이 사이트의 알림 권한을 허용해야 알림을 받을 수
                있습니다. 권한을 거부한 경우 브라우저 설정에서 다시 허용해주세요.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 테스트 알림 */}
        {isEnabled && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={async () => {
              await notificationService.showNotification({
                title: "테스트 알림입니다 🎉",
                body: "UniFind 알림이 정상 작동합니다",
                tag: "test-notification",
              });
              toast.success("테스트 알림이 전송되었습니다");
            }}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{
              background: "var(--muted)",
              color: "var(--foreground)",
              border: "1.5px solid var(--border)",
            }}
          >
            테스트 알림 보내기
          </motion.button>
        )}
      </div>
    </div>
  );
}
