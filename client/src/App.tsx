// UniFind - 메인 앱 라우터
// Design: Neo-Minimal Korean Fintech, Pretendard font
// Layout: Single scroll container in App.tsx, tabbar as absolute positioned element
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Menu, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import BottomTabBar from "./components/BottomTabBar";

// Screens
import SplashScreen from "./pages/SplashScreen";
import AuthScreenToss from "./pages/AuthScreenToss";
import HomeScreen from "./pages/HomeScreen";
import SearchScreen from "./pages/SearchScreen";
import ItemDetailScreen from "./pages/ItemDetailScreen";
import RegisterScreen from "./pages/RegisterScreen";
import AiScanScreen from "./pages/AiScanScreen";
import { ChatListScreen, ChatRoomScreen } from "./pages/ChatScreen";
import PointsScreen from "./pages/PointsScreen";
import MyPageScreen from "./pages/MyPageScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import StatisticsScreen from "./pages/StatisticsScreen";
import LostAndFoundCenterScreen from "./pages/LostAndFoundCenterScreen";
import TrustScoreScreen from "./pages/TrustScoreScreen";
import NotificationsSettingScreen from "./pages/NotificationsSettingScreen";
import AdminScreen from "./pages/AdminScreen";

// Screens that show bottom tab bar
const TAB_SCREENS = ["home", "search", "chat-list", "points", "mypage", "center", "trust"];
const AUTH_REQUIRED_SCREENS = ["register", "chat-list", "chat-room"];

const ADMIN_SCREEN_LINKS = [
  ["home", "홈"],
  ["search", "검색"],
  ["item-detail", "게시물 상세"],
  ["register", "게시물 등록"],
  ["ai-scan", "AI 스캔"],
  ["chat-list", "채팅 목록"],
  ["chat-room", "채팅방"],
  ["points", "포인트"],
  ["mypage", "마이페이지"],
  ["notifications", "알림"],
  ["notifications-setting", "알림 설정"],
  ["statistics", "통계"],
  ["center", "분실물 센터"],
  ["trust", "신뢰도"],
] as const;

function AdminNavigator() {
  const { isAdmin, screen, setScreen, setSelectedItemId, setSelectedChatId } = useApp();
  const [open, setOpen] = useState(false);
  if (!isAdmin) return null;

  const navigate = (nextScreen: (typeof ADMIN_SCREEN_LINKS)[number][0]) => {
    if (nextScreen === "item-detail") setSelectedItemId("1");
    if (nextScreen === "chat-room") setSelectedChatId("1");
    setScreen(nextScreen);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="관리자 화면 이동 열기"
        onClick={() => setOpen(true)}
        className="absolute right-3 top-1/2 z-[3000] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-2xl transition active:scale-95 dark:bg-white dark:text-neutral-950"
      >
        <Menu size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="관리자 화면 이동 닫기"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 z-[3100] bg-black/35 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              className="absolute bottom-3 right-3 top-3 z-[3200] flex w-[calc(100%-24px)] flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck size={18} /></span><div><p className="text-sm font-bold">관리자 빠른 이동</p><p className="text-xs text-muted-foreground">인증 흐름을 건너뛰고 점검합니다.</p></div></div>
                <button aria-label="닫기" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X size={18} /></button>
              </div>
              <div className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-4">
                {ADMIN_SCREEN_LINKS.map(([id, label]) => (
                  <button key={id} onClick={() => navigate(id)} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] ${screen === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-4">
                <button onClick={() => window.location.assign("/admin")} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-bold text-white dark:bg-white dark:text-neutral-950">관리자 콘솔 열기<ExternalLink size={16} /></button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function AppContent() {
  const { screen, isGuest, isAdmin, isAuthLoading, replaceScreen } = useApp();
  const isAdminRoute = window.location.pathname === "/admin";
  const showTabBar = TAB_SCREENS.includes(screen);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => {
    if (isAdminRoute || isAuthLoading || isAdmin || !isGuest || !AUTH_REQUIRED_SCREENS.includes(screen)) return;
    toast.info("로그인과 학교 인증 후 이용할 수 있는 기능이에요");
    replaceScreen("auth");
  }, [isAdmin, isAdminRoute, isAuthLoading, isGuest, replaceScreen, screen]);

  useEffect(() => {
    if (!isAdmin || !new URLSearchParams(window.location.search).has("admin-preview")) return;
    replaceScreen("home");
    window.history.replaceState({}, "", "/");
  }, [isAdmin, replaceScreen]);

  if (isAdminRoute) return <AdminScreen />;

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen />;
      case "auth":
      case "verify-email":
      case "verify-university":
        return <AuthScreenToss />;
      case "home":
        return <HomeScreen />;
      case "search":
        return <SearchScreen />;
      case "item-detail":
        return <ItemDetailScreen />;
      case "register":
        return <RegisterScreen />;
      case "ai-scan":
        return <AiScanScreen />;
      case "chat-list":
        return <ChatListScreen />;
      case "chat-room":
        return <ChatRoomScreen />;
      case "points":
        return <PointsScreen />;
      case "mypage":
        return <MyPageScreen />;
      case "notifications":
        return <NotificationsScreen />;
      case "statistics":
        return <StatisticsScreen />;
      case "center":
        return <LostAndFoundCenterScreen />;
      case "trust":
        return <TrustScoreScreen />;
      case "notifications-setting":
        return <NotificationsSettingScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // make sure to consider if you need authentication for certain routes
  return (
    <div
      className="uf-app-shell flex items-start justify-center transition-colors duration-300"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* Mobile frame - position:relative so absolute children are contained */}
      <div
        className="uf-device-frame transition-colors duration-300"
        style={{
          width: "100%",
          maxWidth: "390px",
          height: "100dvh",
          background: "var(--background)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Single scroll container - bottom inset for tabbar */}
        <div
          ref={scrollContainerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: showTabBar ? "65px" : "0px",
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            zIndex: 1,
          }}
        >
          {renderScreen()}
        </div>

        {/* Bottom Tab Bar - absolutely positioned at bottom, above scroll area */}
        {showTabBar && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              flexShrink: 0,
            }}
          >
            <BottomTabBar />
          </div>
        )}
        <AdminNavigator />
      </div>
    </div>
  );
}

// Wrapper to apply dark mode class to document
function AppContentWithDarkMode() {
  const { isDarkMode } = useApp();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <AppContent />;
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <AppProvider>
              <AppContentWithDarkMode />
              <Toaster position="top-center" />
            </AppProvider>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
