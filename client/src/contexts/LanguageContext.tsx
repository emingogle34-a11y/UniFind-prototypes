import { createContext, useContext, useState, useEffect } from "react";

type Language = "ko" | "en";

const translations = {
  ko: {
    // 공통
    app_name: "UniFind",
    app_desc: "본실을 찾기의 새로운 방법",
    
    // 로그인
    login: "로그인",
    signup: "회원가입",
    email: "이메일",
    password: "비밀번호",
    name: "이름",
    start_with_email: "학교 이메일로 시작하기",
    create_account: "새 계정 만들기",
    already_have_account: "이미 계정이 있으신가요? 로그인",
    no_account: "계정이 없으신가요? 가입하기",
    
    // 기능
    safe_community: "안전한 커뮤니티",
    safe_community_desc: "학교 인증으로 신뢰 수 있음",
    school_friends: "같은 학교 친구들",
    school_friends_desc: "우리 학교 선생들과 소통해요",
    fast_find: "빠른 찾기",
    fast_find_desc: "실시간 알림으로 빠르게 찾아요",
    
    // 홈 화면
    home: "홈",
    search: "검색",
    chat: "채팅",
    mypage: "마이페이지",
    report_lost: "분실 신고",
    report_found: "습득 신고",
    ai_scan: "AI 스캔",
    view_all: "전체 보기",
    
    // 통계
    statistics: "통계",
    building_stats: "건물별 분실물",
    hourly_trends: "시간대별 추이",
    category_stats: "카테고리별",
    risk_areas: "위험 구역",
    
    // 포인트
    points: "포인트",
    earn_points: "포인트 적립",
    use_points: "포인트 사용",
    points_usage: "포인트 사용처",
    restaurant_discount: "학교 식당 할인",
    convenience_discount: "편의점 제휴",
    donation: "기부 전환",
    
    // 신뢰도
    trust_score: "신뢰도",
    verified_user: "인증된 사용자",
    verification_questions: "물건 확인 질문",
    
    // 상태
    found: "찾았어요",
    not_found: "못 찾음",
    expired: "보관 기간 만료",
    
    // 버튼
    confirm: "확인",
    cancel: "취소",
    next: "다음",
    back: "뒤로",
    logout: "로그아웃",
    settings: "설정",
    language: "언어",
  },
  en: {
    // Common
    app_name: "UniFind",
    app_desc: "A new way to find lost items",
    
    // Login
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    name: "Name",
    start_with_email: "Start with School Email",
    create_account: "Create New Account",
    already_have_account: "Already have an account? Login",
    no_account: "Don't have an account? Sign up",
    
    // Features
    safe_community: "Safe Community",
    safe_community_desc: "Trustworthy with school verification",
    school_friends: "School Friends",
    school_friends_desc: "Connect with your school community",
    fast_find: "Fast Find",
    fast_find_desc: "Get real-time notifications",
    
    // Home Screen
    home: "Home",
    search: "Search",
    chat: "Chat",
    mypage: "My Page",
    report_lost: "Report Lost",
    report_found: "Report Found",
    ai_scan: "AI Scan",
    view_all: "View All",
    
    // Statistics
    statistics: "Statistics",
    building_stats: "By Building",
    hourly_trends: "Hourly Trends",
    category_stats: "By Category",
    risk_areas: "Risk Areas",
    
    // Points
    points: "Points",
    earn_points: "Earn Points",
    use_points: "Use Points",
    points_usage: "Point Usage",
    restaurant_discount: "Restaurant Discount",
    convenience_discount: "Convenience Store",
    donation: "Donate",
    
    // Trust
    trust_score: "Trust Score",
    verified_user: "Verified User",
    verification_questions: "Verification Questions",
    
    // Status
    found: "Found",
    not_found: "Not Found",
    expired: "Expired",
    
    // Buttons
    confirm: "Confirm",
    cancel: "Cancel",
    next: "Next",
    back: "Back",
    logout: "Logout",
    settings: "Settings",
    language: "Language",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.ko) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ko";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: keyof typeof translations.ko): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
