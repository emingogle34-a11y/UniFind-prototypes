// UniFind - global app state
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const USE_API = import.meta.env.VITE_USE_API === "true";

type Screen =
  | "splash"
  | "onboarding"
  | "auth"
  | "verify-email"
  | "verify-university"
  | "home"
  | "search"
  | "item-detail"
  | "register"
  | "ai-scan"
  | "chat-list"
  | "chat-room"
  | "points"
  | "mypage"
  | "notifications"
  | "notifications-setting"
  | "statistics"
  | "center"
  | "trust";

interface AppContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  userPoints: number;
  setUserPoints: (v: number) => void;
  userUniversity: string;
  setUserUniversity: (v: string) => void;
  userName: string;
  setUserName: (v: string) => void;
  userNickname: string | null;
  setUserNickname: (v: string | null) => void;
  userRealName: string | null;
  hasServerUser: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: "all" | "lost" | "found";
  setFilterType: (v: "all" | "lost" | "found") => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  registerType: "lost" | "found";
  setRegisterType: (v: "lost" | "found") => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const authMeQuery = trpc.auth.me.useQuery(undefined, {
    enabled: USE_API,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const serverUser = authMeQuery.data ?? null;

  const [systemDarkMode, setSystemDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPoints, setUserPoints] = useState(1250);
  const [userUniversity, setUserUniversity] = useState("한국대학교");
  const [localUserName, setUserName] = useState("김민준");
  const [localUserNickname, setUserNickname] = useState<string | null>("캠퍼스탐정");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [registerType, setRegisterType] = useState<"lost" | "found">("lost");
  const [isDarkModeState, setIsDarkModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("unifind-dark-mode");
        return saved !== null ? JSON.parse(saved) : systemDarkMode;
      } catch (e) {
        console.warn("[UniFind] Failed to parse dark mode from localStorage:", e);
        return systemDarkMode;
      }
    }
    return false;
  });

  const setIsDarkMode = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsDarkModeState((prev: boolean) => {
      const newValue = typeof value === "function" ? value(prev) : value;
      if (typeof window !== "undefined") {
        localStorage.setItem("unifind-dark-mode", JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  const userRealName = serverUser?.name ?? localUserName;
  const userNickname = serverUser ? serverUser.nickname : localUserNickname;
  const userName = userNickname ?? userRealName ?? "UniFind";
  const hasServerUser = Boolean(serverUser);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("unifind-dark-mode");
      if (saved === null) {
        setSystemDarkMode(e.matches);
        setIsDarkModeState(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AppContext.Provider
      value={{
        screen, setScreen,
        selectedItemId, setSelectedItemId,
        selectedChatId, setSelectedChatId,
        activeTab, setActiveTab,
        isAuthenticated, setIsAuthenticated,
        userPoints, setUserPoints,
        userUniversity, setUserUniversity,
        userName, setUserName,
        userNickname, setUserNickname,
        userRealName,
        hasServerUser,
        searchQuery, setSearchQuery,
        filterType, setFilterType,
        filterCategory, setFilterCategory,
        registerType, setRegisterType,
        isDarkMode: isDarkModeState, setIsDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
