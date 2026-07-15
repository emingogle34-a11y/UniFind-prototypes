// UniFind - 하단 탭바 (토스 스타일)
import { useApp } from "@/contexts/AppContext";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { id: "home", label: "홈", icon: Home, screen: "home" as const, accent: "var(--uf-blue)" },
  { id: "search", label: "검색", icon: Search, screen: "search" as const, accent: "var(--uf-green)" },
  { id: "register", label: "등록", icon: PlusCircle, screen: "register" as const, accent: "var(--uf-blue)" },
  { id: "chat", label: "채팅", icon: MessageCircle, screen: "chat-list" as const, accent: "var(--uf-orange)" },
  { id: "mypage", label: "마이", icon: User, screen: "mypage" as const, accent: "var(--uf-amber)" },
];

export default function BottomTabBar() {
  const { activeTab, setActiveTab, setScreen } = useApp();

  return (
    <div className="uf-tab-bar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isRegister = tab.id === "register";

        return (
          <motion.button
            type="button"
            key={tab.id}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              setActiveTab(tab.id);
              setScreen(tab.screen);
            }}
            whileTap={{ scale: 0.92 }}
            className={`uf-tab-button ${isRegister ? "uf-tab-button-register" : ""}`}
          >
            {isRegister ? (
              <div
                className="uf-tab-register-core"
                style={{ background: "var(--uf-premium-gradient)" }}
              >
                <Icon size={22} color="white" />
              </div>
            ) : (
              <>
                <div
                  className="uf-tab-icon-wrap relative"
                  style={{
                    background: isActive ? `color-mix(in srgb, ${tab.accent} 13%, var(--card) 87%)` : "transparent",
                    color: isActive ? tab.accent : "var(--muted-foreground)",
                  }}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {tab.id === "chat" && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "var(--uf-orange)", boxShadow: "0 4px 10px rgba(249,115,76,0.32)" }}
                    >
                      3
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-0.5 h-1 w-4 rounded-full"
                    style={{ background: tab.accent }}
                  />
                )}
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
