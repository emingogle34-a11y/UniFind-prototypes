// UniFind - 메인 앱 라우터
// Design: Neo-Minimal Korean Fintech, Pretendard font
// Layout: Single scroll container in App.tsx, tabbar as absolute positioned element
import { useEffect, useRef } from "react";
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

// Screens that show bottom tab bar
const TAB_SCREENS = ["home", "search", "chat-list", "points", "mypage", "center", "trust"];
const AUTH_REQUIRED_SCREENS = ["register", "chat-list", "chat-room"];

function AppContent() {
  const { screen, isGuest, replaceScreen } = useApp();
  const showTabBar = TAB_SCREENS.includes(screen);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => {
    if (!isGuest || !AUTH_REQUIRED_SCREENS.includes(screen)) return;
    toast.info("로그인과 학교 인증 후 이용할 수 있는 기능이에요");
    replaceScreen("auth");
  }, [isGuest, replaceScreen, screen]);

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
