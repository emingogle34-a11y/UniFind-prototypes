// UniFind - 홈 화면
import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { MOCK_ITEMS, UNIFIND_LOGO, UNIVERSITIES, type ItemCategory, type LostItem } from "@/lib/data";
import {
  BarChart3,
  Bell,
  Building2,
  Camera,
  ChevronRight,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "@/components/TossPopups";
import { CategoryIcon, SchoolEmblem } from "@/components/TossComponents";
import { pageMotion, riseItem, softPop, staggerContainer, tapMotion, useCountUp } from "@/lib/motion";
import { toast } from "sonner";

const HOME_PROMO_POPUP_ID = "home-promo-welcome";

const ACTIONS = [
  {
    label: "AI 사진 분석",
    desc: "카테고리 자동 분류",
    icon: Sparkles,
    bg: "var(--uf-blue-light)",
    accent: "var(--uf-blue)",
    action: "ai-scan" as const,
  },
  {
    label: "분실물 센터",
    desc: "보관 물품 조회",
    icon: ShieldCheck,
    bg: "var(--uf-danger-soft)",
    accent: "var(--uf-orange)",
    action: "center" as const,
  },
  {
    label: "캠퍼스 검색",
    desc: "건물별 필터",
    icon: Search,
    bg: "var(--uf-success-soft)",
    accent: "var(--uf-green)",
    action: "search" as const,
  },
  {
    label: "분실 통계",
    desc: "위험 구역 확인",
    icon: BarChart3,
    bg: "var(--uf-warning-soft)",
    accent: "var(--uf-amber)",
    action: "statistics" as const,
  },
];

const QUICK_CATEGORIES: { category: ItemCategory; color: string; background: string }[] = [
  { category: "블루투스 기기", color: "var(--uf-purple)", background: "var(--uf-purple-soft)" },
  { category: "휴대폰/태블릿", color: "var(--uf-blue)", background: "var(--uf-blue-light)" },
  { category: "지갑/카드", color: "var(--uf-amber)", background: "var(--uf-warning-soft)" },
  { category: "열쇠", color: "var(--uf-green)", background: "var(--uf-success-soft)" },
];

const VISIT_CAMPUSES = UNIVERSITIES.filter((university) =>
  ["서울대학교", "연세대학교", "고려대학교", "성균관대학교"].includes(university)
);

const MATCH_REASONS = [
  { label: "카테고리", value: "지갑/카드 일치", color: "var(--uf-blue)" },
  { label: "위치", value: "중앙도서관 반경", color: "var(--uf-green)" },
  { label: "시간", value: "2시간 내 등록", color: "var(--uf-orange)" },
];

const SERVICE_FLOW = [
  { label: "AI 매칭", desc: "사진과 장소 비교", icon: Sparkles, color: "var(--uf-blue)" },
  { label: "익명 채팅", desc: "번호 없이 연락", icon: MessageCircle, color: "var(--uf-green)" },
  { label: "본인 확인", desc: "질문으로 검증", icon: ShieldCheck, color: "var(--uf-orange)" },
];

function getItemTone(item: LostItem) {
  if (item.type === "lost") {
    return {
      accent: "var(--uf-orange)",
      bg: "var(--uf-danger-soft)",
      label: "분실",
    };
  }

  return {
    accent: "var(--uf-blue)",
    bg: "var(--uf-blue-light)",
    label: "습득",
  };
}

function getAiSignals(item: LostItem) {
  const locationKeyword = item.location.split(" ")[0] || "캠퍼스";
  const recency = item.date.includes("분") || item.date.includes("시간") ? "최근 등록" : "보관 가능";

  return [`${item.category} 일치`, `${locationKeyword} 근처`, recency];
}

function CampusBackdrop() {
  return (
    <div className="uf-home-ambient pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="uf-home-grid-layer" />
      <div className="uf-home-light-sweep" />
      <svg className="uf-home-routes absolute left-0 top-0 h-[430px] w-full opacity-[0.62]" viewBox="0 0 390 430">
        <defs>
          <linearGradient id="homeLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F9734C" stopOpacity="0.13" />
          </linearGradient>
          <linearGradient id="homePulse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
            <stop offset="45%" stopColor="#2563EB" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#F9734C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="uf-route-drift">
          <path
            d="M-30 104 C58 62 122 118 190 82 C260 46 316 56 426 16"
            fill="none"
            stroke="url(#homeLine)"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            className="uf-route-pulse"
            d="M-30 104 C58 62 122 118 190 82 C260 46 316 56 426 16"
            fill="none"
            stroke="url(#homePulse)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M24 246 C88 194 146 222 210 184 C270 148 316 160 384 128"
            fill="none"
            stroke="#2563EB"
            strokeOpacity="0.09"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            className="uf-route-pulse uf-route-pulse-slow"
            d="M24 246 C88 194 146 222 210 184 C270 148 316 160 384 128"
            fill="none"
            stroke="url(#homePulse)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g className="uf-home-pin uf-home-pin-a">
            <rect x="268" y="88" width="78" height="28" rx="14" fill="#FFFFFF" opacity="0.46" />
            <circle cx="288" cy="102" r="4" fill="#2563EB" opacity="0.78" />
            <path d="M300 102h30" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </g>
          <g className="uf-home-pin uf-home-pin-b">
            <rect x="36" y="158" width="98" height="28" rx="14" fill="#FFFFFF" opacity="0.35" />
            <circle cx="56" cy="172" r="4" fill="#F9734C" opacity="0.78" />
            <path d="M68 172h42" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function UniFindPromoIllustration() {
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 280 180" className="h-[160px] w-full max-w-[280px]" role="img" aria-label="UniFind 3D 분실물 검색 일러스트">
        <defs>
          <linearGradient id="promo-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#EAF3FF" />
            <stop offset="100%" stopColor="#F8FBFF" />
          </linearGradient>
          <linearGradient id="promo-card" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DCEBFF" />
          </linearGradient>
          <linearGradient id="promo-phone" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#6BA8FF" />
            <stop offset="100%" stopColor="#3182F6" />
          </linearGradient>
          <linearGradient id="promo-lens" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#B9D8FF" stopOpacity="0.76" />
          </linearGradient>
          <radialGradient id="promo-highlight" cx="32%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="promo-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#3182F6" floodOpacity="0.2" />
          </filter>
        </defs>
        <rect x="18" y="12" width="244" height="142" rx="36" fill="url(#promo-bg)" />
        <ellipse cx="142" cy="154" rx="88" ry="14" fill="#C8DCF7" opacity="0.42" />
        <g filter="url(#promo-shadow)">
          <path d="M68 55c0-8 6-14 14-14h88c8 0 14 6 14 14v68c0 8-6 14-14 14H82c-8 0-14-6-14-14V55z" fill="url(#promo-card)" />
          <path d="M88 82h76v11H88zM88 101h56v9H88z" fill="#B7CEF2" />
          <path d="M92 67h22v22H92z" fill="#FF8B6A" />
          <path d="M123 67h36v8h-36z" fill="#3182F6" opacity="0.72" />
        </g>
        <g filter="url(#promo-shadow)" transform="rotate(-10 154 88)">
          <rect x="138" y="38" width="58" height="94" rx="18" fill="url(#promo-phone)" />
          <rect x="146" y="52" width="42" height="60" rx="13" fill="#FFFFFF" opacity="0.92" />
          <path d="M154 74h26v7h-26zM154 88h18v6h-18z" fill="#9DBBE8" />
          <circle cx="167" cy="120" r="4" fill="#EAF3FF" />
          <path d="M151 44c5-3 22-5 34 3" stroke="url(#promo-highlight)" strokeWidth="10" strokeLinecap="round" opacity="0.56" />
        </g>
        <g filter="url(#promo-shadow)">
          <circle cx="126" cy="82" r="34" fill="url(#promo-lens)" stroke="#FFFFFF" strokeWidth="8" />
          <circle cx="115" cy="71" r="14" fill="url(#promo-highlight)" />
          <path d="M149 106l31 31" stroke="#236BD9" strokeWidth="13" strokeLinecap="round" />
          <path d="M149 106l31 31" stroke="#68A7FF" strokeWidth="7" strokeLinecap="round" />
        </g>
        <rect x="186" y="20" width="54" height="32" rx="16" fill="#FFFFFF" filter="url(#promo-shadow)" />
        <text x="213" y="41" textAnchor="middle" fontSize="15" fontWeight="800" fill="#3182F6">AI</text>
      </svg>
    </div>
  );
}

function ItemRow({ item, index, onClick }: { item: LostItem; index: number; onClick: () => void }) {
  const tone = getItemTone(item);
  const aiSignals = getAiSignals(item);

  return (
    <motion.button
      variants={riseItem}
      custom={index}
      {...tapMotion}
      onClick={onClick}
      className="uf-card group relative w-full overflow-hidden p-4 text-left"
    >
      <span className="absolute bottom-4 left-0 top-4 w-1 rounded-r-full" style={{ background: tone.accent }} />
      <div className="flex items-start gap-3 pl-1">
        <div
          className="flex h-12 w-12 flex-shrink-0 self-center items-center justify-center overflow-hidden rounded-2xl text-2xl shadow-sm"
          style={{ background: tone.bg }}
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon category={item.category} size={22} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: tone.bg, color: tone.accent }}>
              {tone.label}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {item.category}
            </span>
            {item.aiConfidence && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
                AI {item.aiConfidence}%
              </span>
            )}
          </div>
          <p className="truncate text-[15px] font-extrabold leading-tight text-foreground">{item.title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {aiSignals.map((signal) => (
              <span key={signal} className="uf-signal-chip">
                {signal}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin size={11} />
            <span className="truncate">{item.location}</span>
            <span>·</span>
            <span>{item.date}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 self-stretch flex-col items-end justify-center gap-2">
          {item.points > 0 && (
            <span className="rounded-full px-2 py-1 text-xs font-extrabold" style={{ background: "var(--uf-danger-soft)", color: "var(--uf-orange)" }}>
              +{item.points}P
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle size={12} />
            {item.chatCount}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function HomeScreen() {
  const {
    setScreen,
    setSelectedItemId,
    setRegisterType,
    setFilterType,
    setFilterCategory,
    setSearchScope,
    userName,
    userUniversity,
    userPoints,
    activeUniversity,
    visitPassUniversity,
    activateVisitPass,
    clearVisitPass,
    isGuest,
  } = useApp();
  const [notifCount] = useState(3);
  const [showPromoPopup, setShowPromoPopup] = useState(true);
  const [feedType, setFeedType] = useState<"lost" | "found">("lost");
  const [showVisitPass, setShowVisitPass] = useState(false);
  const [selectedVisitUniversity, setSelectedVisitUniversity] = useState<string | null>(visitPassUniversity);
  const animatedPoints = useCountUp(userPoints);

  const browseItems = useMemo(() => MOCK_ITEMS.filter((item) => item.type === feedType).slice(0, 4), [feedType]);
  const urgentItems = useMemo(() => MOCK_ITEMS.filter((i) => i.points >= 500).slice(0, 2), []);

  const openItem = (id: string) => {
    setSelectedItemId(id);
    setScreen("item-detail");
  };

  const openCategory = (category: ItemCategory) => {
    setSearchScope("all");
    setFilterType("lost");
    setFilterCategory(category);
    setScreen("search");
  };

  const issueVisitPass = () => {
    if (!selectedVisitUniversity) return;
    activateVisitPass(selectedVisitUniversity);
    setFilterType("lost");
    setFilterCategory("전체");
    setShowVisitPass(false);
    toast.success(`${selectedVisitUniversity} 방문권이 24시간 활성화됐어요`);
  };

  return (
    <motion.div
      variants={pageMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      className="uf-screen relative flex h-full flex-col overflow-hidden"
    >
      <CampusBackdrop />

      {showPromoPopup && (
        <Modal
          isOpen={showPromoPopup}
          onClose={() => setShowPromoPopup(false)}
          popupId={HOME_PROMO_POPUP_ID}
          showDoNotShowToday
          subtitle="UniFind"
          title="분실물 찾기, 이제 더 가볍게"
          illustration={<UniFindPromoIllustration />}
          actions={[{ label: "시작하기", onClick: () => setShowPromoPopup(false) }]}
        >
          <p className="mb-4">학교 안에서 잃어버린 물건을 사진, 위치, 익명 채팅으로 빠르게 이어줘요.</p>
          <div className="space-y-3">
            {[
              { label: "사진 한 장으로 AI 자동 분류", color: "var(--uf-blue)" },
              { label: "번호 공개 없는 익명 채팅", color: "var(--uf-green)" },
              { label: "참여할수록 쌓이는 포인트", color: "var(--uf-orange)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: item.color, boxShadow: `0 0 0 5px ${item.color}18` }} />
                <span className="font-semibold text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showVisitPass && (
        <Modal
          isOpen={showVisitPass}
          onClose={() => setShowVisitPass(false)}
          subtitle="CAMPUS PASS"
          title="타 학교에서도 찾아보세요"
        >
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            방문한 학교를 선택하면 24시간 동안 해당 캠퍼스의 분실·습득 게시물만 모아볼 수 있어요.
          </p>
          <div className="space-y-2">
            {VISIT_CAMPUSES.filter((university) => university !== userUniversity).map((university) => {
              const isSelected = selectedVisitUniversity === university;
              return (
                <motion.button
                  key={university}
                  {...tapMotion}
                  type="button"
                  onClick={() => setSelectedVisitUniversity(university)}
                  className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
                  style={{
                    background: isSelected ? "var(--uf-blue-light)" : "var(--card)",
                    borderColor: isSelected ? "color-mix(in srgb, var(--uf-blue) 38%, var(--border))" : "var(--border)",
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "var(--muted)", color: isSelected ? "var(--uf-blue)" : "var(--muted-foreground)" }}>
                    <Building2 size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-foreground">{university}</span>
                    <span className="block text-[11px] font-semibold text-muted-foreground">방문 캠퍼스 게시물 보기</span>
                  </span>
                  {isSelected && <CheckCircle2 size={18} style={{ color: "var(--uf-blue)" }} />}
                </motion.button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={issueVisitPass}
            disabled={!selectedVisitUniversity}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-floating)" }}
          >
            <TicketCheck size={18} />
            24시간 방문권 받기
          </button>
          {visitPassUniversity && (
            <button
              type="button"
              onClick={() => {
                clearVisitPass();
                setSelectedVisitUniversity(null);
                setShowVisitPass(false);
                toast.success("내 학교 캠퍼스로 돌아왔어요");
              }}
              className="mt-2 w-full rounded-2xl py-3 text-xs font-bold text-muted-foreground"
            >
              방문 종료하고 내 학교로 돌아가기
            </button>
          )}
        </Modal>
      )}

      <motion.header variants={riseItem} className="relative z-10 px-5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5 pl-1">
              <SchoolEmblem
                name={activeUniversity}
                size="sm"
                className="!h-7 !w-7 !rounded-[9px] !shadow-[0_5px_12px_rgba(37,99,235,0.10)]"
              />
              <p className="truncate text-xs font-semibold text-muted-foreground">{isGuest ? "캠퍼스 미리보기" : activeUniversity}</p>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none"
                style={{
                  background: visitPassUniversity ? "var(--uf-purple-soft)" : "color-mix(in srgb, var(--uf-blue) 10%, transparent)",
                  color: visitPassUniversity ? "var(--uf-purple)" : "var(--uf-blue)",
                }}
              >
                {visitPassUniversity ? "방문 중" : isGuest ? "미인증" : "인증"}
              </span>
            </div>
            <div className="mt-1.5 flex min-w-0 items-center gap-2.5">
              <img
                src={UNIFIND_LOGO}
                alt="UniFind"
                className="h-[45px] w-[45px] flex-shrink-0 rounded-2xl object-cover shadow-[var(--uf-shadow-soft)]"
              />
              <h1 className="truncate text-[19px] font-extrabold leading-tight text-foreground">
                {userName}님, 찾아볼까요?
              </h1>
            </div>
          </div>
          <motion.button
            {...tapMotion}
            onClick={() => setScreen("notifications")}
            className="uf-glass relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
            aria-label="알림"
          >
            <Bell size={25} strokeWidth={1.8} />
            {notifCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.18)]" style={{ background: "var(--uf-orange)" }}>
                {notifCount}
              </span>
            )}
          </motion.button>
        </div>
      </motion.header>

      <motion.main
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="scrollbar-hide relative z-10 flex-1 space-y-5 overflow-y-auto px-5 pb-7 pt-4 break-keep"
      >
        <motion.section variants={softPop} className="uf-home-hero-panel relative overflow-hidden rounded-[30px] p-5">
          <div className="relative z-10">
            <div className="uf-ai-match-status mb-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1.5">
              <span className="uf-live-dot" />
              <span className="uf-ai-match-status-text relative z-10 text-xs font-extrabold" style={{ color: "var(--uf-blue)" }}>
                AI 매칭 3건 대기 중
              </span>
            </div>
            <h2 className="text-[25px] font-[650] leading-tight tracking-normal text-foreground">
              잃어버렸거나 주웠다면
              <br />
              바로 연결해드릴게요
            </h2>
            <p className="mt-2 max-w-[280px] text-sm font-semibold leading-relaxed text-muted-foreground">
              사진과 장소만 입력하면 비슷한 신고를 찾아 익명 채팅까지 이어줘요.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <motion.button
                {...tapMotion}
                onClick={() => {
                  setRegisterType("lost");
                  setScreen("register");
                }}
                className="uf-home-primary-cta flex min-h-[82px] flex-col items-start justify-between rounded-[22px] px-4 py-3 text-left text-white"
              >
                <Camera size={22} />
                <span>
                  <span className="block text-base font-black">분실했어요</span>
                  <span className="mt-0.5 block text-[11px] font-bold text-white/76">3개만 입력</span>
                </span>
              </motion.button>
              <motion.button
                {...tapMotion}
                onClick={() => {
                  setRegisterType("found");
                  setScreen("register");
                }}
                className="uf-home-secondary-cta flex min-h-[82px] flex-col items-start justify-between rounded-[22px] px-4 py-3 text-left"
              >
                <ShieldCheck size={22} />
                <span>
                  <span className="block text-base font-black text-foreground">주웠어요</span>
                  <span className="mt-0.5 block text-[11px] font-bold text-muted-foreground">주인 찾아주기</span>
                </span>
              </motion.button>
            </div>

            <motion.button
              {...tapMotion}
              onClick={() => {
                setFilterType("lost");
                setFilterCategory("전체");
                setSearchScope("all");
                setScreen("search");
              }}
              className="relative mt-4 flex w-full items-center justify-center px-7 text-center text-sm font-extrabold"
              style={{ color: "var(--uf-blue)" }}
            >
              <span>이미 등록된 물건 검색하기</span>
              <ChevronRight size={17} className="absolute right-0" />
            </motion.button>
          </div>
        </motion.section>

        <motion.section variants={riseItem}>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">무엇을 찾고 있나요?</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">종류를 고르면 분실 신고만 바로 보여드려요</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterType("lost");
                setFilterCategory("전체");
                setSearchScope("all");
                setScreen("search");
              }}
              className="text-xs font-bold"
              style={{ color: "var(--uf-blue)" }}
            >
              전체
            </button>
          </div>
          <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-2">
            {QUICK_CATEGORIES.map(({ category, color, background }) => (
              <motion.button
                key={category}
                variants={softPop}
                {...tapMotion}
                type="button"
                onClick={() => openCategory(category)}
                className="uf-card flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-2 px-1.5 py-3 text-center"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background, color }}>
                  <CategoryIcon category={category} size={19} strokeWidth={2.2} />
                </span>
                <span className="w-full break-keep text-[10px] font-extrabold leading-tight text-foreground">{category}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        <motion.button
          variants={softPop}
          {...tapMotion}
          type="button"
          onClick={() => {
            setSelectedVisitUniversity(visitPassUniversity);
            setShowVisitPass(true);
          }}
          className="uf-visit-pass-card relative flex w-full items-center gap-3 overflow-hidden rounded-[26px] p-4 text-left"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--uf-purple-soft)", color: "var(--uf-purple)" }}>
            <TicketCheck size={23} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold" style={{ color: "var(--uf-purple)" }}>
              {visitPassUniversity ? "방문권 사용 중" : "타 학교에서 잃어버렸나요?"}
            </span>
            <span className="mt-0.5 block truncate text-sm font-extrabold text-foreground">
              {visitPassUniversity ? `${activeUniversity} 게시물 보는 중` : "24시간 타 학교 방문권 받기"}
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold text-muted-foreground">
              {visitPassUniversity ? "누르면 학교를 변경하거나 방문을 종료할 수 있어요" : "방문 캠퍼스의 분실·습득 목록으로 전환해요"}
            </span>
          </span>
          <ChevronRight size={18} className="flex-shrink-0 text-muted-foreground" />
        </motion.button>

        <motion.section variants={riseItem} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "오늘 등록", value: "12건", icon: PlusCircle, color: "var(--uf-blue)" },
            { label: "AI 매칭", value: "3건", icon: Sparkles, color: "var(--uf-green)" },
            { label: "해결률", value: "92%", icon: TrendingUp, color: "var(--uf-orange)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} variants={softPop} className="uf-mini-stat relative flex min-h-[104px] flex-col items-center justify-center p-3 text-center">
              <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <Icon size={19} strokeWidth={1.9} style={{ color }} />
              <p className="mt-2 text-xl font-bold leading-none text-foreground">{value}</p>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={softPop}
          {...tapMotion}
          onClick={() => setScreen("points")}
          className="uf-home-reward-card relative overflow-hidden rounded-[32px] border border-white/20 p-5 text-white shadow-[var(--uf-shadow-floating)]"
          style={{ background: "var(--uf-premium-gradient)" }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 340 210" aria-hidden="true">
            <path d="M-30 136 C44 86 110 130 172 80 C234 30 278 52 372 14" fill="none" stroke="white" strokeOpacity="0.34" strokeWidth="24" strokeLinecap="round" />
            <path d="M190 206 C236 164 288 180 364 120" fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="18" strokeLinecap="round" />
          </svg>
          <div className="relative z-10">
            <div className="mb-6 text-center">
              <div>
                <p className="text-sm font-semibold text-white/78">내 리워드 포인트</p>
                <div className="mt-1 flex items-end justify-center gap-1">
                  <span className="text-[42px] font-black leading-none tracking-normal">{animatedPoints.toLocaleString()}</span>
                  <span className="mb-1.5 text-base font-extrabold text-white/80">P</span>
                </div>
              </div>
              <span className="mt-3 inline-flex rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                이번 달 +{isGuest ? 0 : 350}P
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/14 px-3 py-3 text-center backdrop-blur">
                <p className="text-[11px] font-semibold text-white/90">AI 매칭</p>
                <p className="mt-1 text-lg font-extrabold">3건 대기</p>
              </div>
              <div className="rounded-2xl bg-white/14 px-3 py-3 text-center backdrop-blur">
                <p className="text-[11px] font-semibold text-white/90">해결 기여</p>
                <p className="mt-1 text-lg font-extrabold">{isGuest ? "활동 전" : "상위 12%"}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={riseItem}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">바로 하기</h2>
              <p className="text-xs text-muted-foreground">자주 쓰는 캠퍼스 도구</p>
            </div>
          </div>
          <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3">
            {ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  variants={riseItem}
                  {...tapMotion}
                  onClick={() => setScreen(item.action)}
                  className="uf-card relative min-h-[96px] overflow-hidden p-4 text-left"
                >
                  <span className="absolute inset-x-4 top-0 h-1 rounded-b-full" style={{ background: item.accent }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-extrabold text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: item.bg, color: item.accent }}>
                      <Icon size={20} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section variants={riseItem} className="uf-card uf-ai-proof-card relative overflow-hidden p-4">
          <div className="relative flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}>
              <Sparkles size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: "var(--uf-green)" }} />
                <p className="text-xs font-extrabold" style={{ color: "var(--uf-green)" }}>추천 매칭 1순위</p>
              </div>
              <p className="mt-1 text-sm font-extrabold text-foreground">갈색 반지갑과 97% 유사해요</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
                장소, 카테고리, 등록 시간이 함께 맞아 먼저 확인할 만해요.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {MATCH_REASONS.map((reason) => (
                  <span key={reason.label} className="uf-match-reason" style={{ color: reason.color }}>
                    {reason.label} · {reason.value}
                  </span>
                ))}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.25 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--uf-premium-gradient)" }}
                />
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
        </motion.section>

        <motion.section variants={riseItem} className="uf-flow-card relative overflow-hidden rounded-[28px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">찾는 흐름이 명확해요</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">매칭부터 확인까지 안전하게</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-extrabold text-muted-foreground">4분 예상</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SERVICE_FLOW.map(({ label, desc, icon: Icon, color }, index) => (
              <div key={label} className="relative">
                {index < SERVICE_FLOW.length - 1 && <span className="uf-flow-line" />}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${color}18`, color }}>
                    <Icon size={18} />
                  </span>
                  <p className="mt-2 text-xs font-extrabold text-foreground">{label}</p>
                  <p className="mt-0.5 text-[10px] font-semibold leading-tight text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {urgentItems.length > 0 && (
          <motion.section variants={riseItem}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-foreground">긴급 분실물</h2>
                <p className="text-xs text-muted-foreground">보상 포인트가 높은 신고</p>
              </div>
              <motion.button
                {...tapMotion}
                onClick={() => {
                  setFilterType("lost");
                  setFilterCategory("전체");
                  setSearchScope("all");
                  setScreen("search");
                }}
                className="flex items-center gap-1 text-[15px] font-bold"
                style={{ color: "var(--uf-blue)" }}
              >
                전체보기 <ChevronRight size={16} />
              </motion.button>
            </div>
            <motion.div variants={staggerContainer} className="space-y-3">
              {urgentItems.map((item, index) => (
                <ItemRow key={item.id} item={item} index={index} onClick={() => openItem(item.id)} />
              ))}
            </motion.div>
          </motion.section>
        )}

        <motion.section variants={riseItem}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-foreground" />
                <h2 className="text-base font-extrabold text-foreground">캠퍼스 물건 목록</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">분실과 습득을 나눠서 확인하세요</p>
            </div>
            <motion.button
              {...tapMotion}
              onClick={() => {
                setFilterType(feedType);
                setFilterCategory("전체");
                setSearchScope("all");
                setScreen("search");
              }}
              className="flex items-center gap-1 text-[15px] font-bold"
              style={{ color: "var(--uf-blue)" }}
            >
              전체보기 <ChevronRight size={16} />
            </motion.button>
          </div>
          <div className="mb-3 grid grid-cols-2 rounded-[18px] bg-muted p-1">
            {(["lost", "found"] as const).map((type) => {
              const isActive = feedType === type;
              return (
                <motion.button
                  key={type}
                  {...tapMotion}
                  type="button"
                  onClick={() => setFeedType(type)}
                  className="rounded-[14px] px-3 py-2.5 text-xs font-extrabold"
                  style={{
                    background: isActive ? "var(--card)" : "transparent",
                    color: isActive ? (type === "lost" ? "var(--uf-orange)" : "var(--uf-blue)") : "var(--muted-foreground)",
                    boxShadow: isActive ? "var(--uf-shadow-soft)" : "none",
                  }}
                >
                  {type === "lost" ? "분실 신고" : "습득 등록"}
                </motion.button>
              );
            })}
          </div>
          <motion.div variants={staggerContainer} className="space-y-3">
            {browseItems.map((item, index) => (
              <ItemRow key={item.id} item={item} index={index} onClick={() => openItem(item.id)} />
            ))}
          </motion.div>
        </motion.section>
      </motion.main>
    </motion.div>
  );
}
