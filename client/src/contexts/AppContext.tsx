// UniFind - global app state
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

const USE_API = import.meta.env.VITE_USE_API === "true";
const VISIT_PASS_STORAGE_KEY = "unifind-visit-pass";
const VISIT_PASS_DURATION_MS = 24 * 60 * 60 * 1000;

interface VisitPassState {
  university: string;
  expiresAt: number;
}

function readVisitPass(): VisitPassState | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(VISIT_PASS_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as VisitPassState;
    if (!parsed.university || parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(VISIT_PASS_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(VISIT_PASS_STORAGE_KEY);
    return null;
  }
}

export type Screen =
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
  replaceScreen: (screen: Screen) => void;
  goBack: () => void;
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
  isGuest: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: "all" | "lost" | "found";
  setFilterType: (v: "all" | "lost" | "found") => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  searchScope: "all" | "mine";
  setSearchScope: (v: "all" | "mine") => void;
  registerType: "lost" | "found";
  setRegisterType: (v: "lost" | "found") => void;
  activeUniversity: string;
  visitPassUniversity: string | null;
  visitPassExpiresAt: number | null;
  activateVisitPass: (university: string) => void;
  clearVisitPass: () => void;
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

  const [screen, setScreenState] = useState<Screen>("splash");
  const screenRef = useRef<Screen>("splash");
  const navigationHistoryRef = useRef<Screen[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localUserPoints, setUserPoints] = useState(1250);
  const [userUniversity, setUserUniversity] = useState("한국대학교");
  const [localUserName, setUserName] = useState("김민준");
  const [localUserNickname, setUserNickname] = useState<string | null>("캠퍼스탐정");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("lost");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [searchScope, setSearchScope] = useState<"all" | "mine">("all");
  const [registerType, setRegisterType] = useState<"lost" | "found">("lost");
  const [visitPass, setVisitPass] = useState<VisitPassState | null>(readVisitPass);
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

  const setScreen = useCallback((nextScreen: Screen) => {
    const currentScreen = screenRef.current;
    if (currentScreen === nextScreen) return;

    navigationHistoryRef.current = [...navigationHistoryRef.current, currentScreen].slice(-40);
    screenRef.current = nextScreen;
    setScreenState(nextScreen);
  }, []);

  const replaceScreen = useCallback((nextScreen: Screen) => {
    if (screenRef.current === nextScreen) return;
    screenRef.current = nextScreen;
    setScreenState(nextScreen);
  }, []);

  const goBack = useCallback(() => {
    const history = navigationHistoryRef.current;
    const previousScreen = history.at(-1) ?? "home";
    navigationHistoryRef.current = history.slice(0, -1);
    screenRef.current = previousScreen;
    setScreenState(previousScreen);
  }, []);

  const hasServerUser = Boolean(serverUser);
  const isGuest = !isAuthenticated && !hasServerUser;
  const userRealName = serverUser?.name ?? localUserName;
  const userNickname = serverUser ? serverUser.nickname : localUserNickname;
  const userName = isGuest ? "게스트" : userNickname ?? userRealName ?? "UniFind";
  const userPoints = isGuest ? 0 : serverUser?.points ?? localUserPoints;
  const activeUniversity = visitPass?.university ?? userUniversity;

  const activateVisitPass = (university: string) => {
    const nextPass = { university, expiresAt: Date.now() + VISIT_PASS_DURATION_MS };
    setVisitPass(nextPass);
    if (typeof window !== "undefined") {
      localStorage.setItem(VISIT_PASS_STORAGE_KEY, JSON.stringify(nextPass));
    }
  };

  const clearVisitPass = () => {
    setVisitPass(null);
    if (typeof window !== "undefined") localStorage.removeItem(VISIT_PASS_STORAGE_KEY);
  };

  useEffect(() => {
    if (!USE_API || authMeQuery.isLoading) return;
    setIsAuthenticated(Boolean(serverUser));
  }, [authMeQuery.isLoading, serverUser]);

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

  useEffect(() => {
    if (!visitPass || typeof window === "undefined") return;
    const remaining = visitPass.expiresAt - Date.now();
    if (remaining <= 0) {
      clearVisitPass();
      return;
    }
    const timer = window.setTimeout(clearVisitPass, remaining);
    return () => window.clearTimeout(timer);
  }, [visitPass]);

  return (
    <AppContext.Provider
      value={{
        screen, setScreen, replaceScreen, goBack,
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
        isGuest,
        searchQuery, setSearchQuery,
        filterType, setFilterType,
        filterCategory, setFilterCategory,
        searchScope, setSearchScope,
        registerType, setRegisterType,
        activeUniversity,
        visitPassUniversity: visitPass?.university ?? null,
        visitPassExpiresAt: visitPass?.expiresAt ?? null,
        activateVisitPass,
        clearVisitPass,
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
