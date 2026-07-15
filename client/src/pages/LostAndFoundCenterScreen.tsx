import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Clock, Package, CheckCircle2, AlertCircle, Search, Building2, ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface CenterItem {
  id: string;
  name: string;
  category: string;
  description: string;
  dateReceived: string;
  location: string;
  storageUntil: string;
  status: "available" | "claimed" | "discarded";
}

const centerItems: CenterItem[] = [
  {
    id: "1",
    name: "검은색 지갑",
    category: "지갑",
    description: "명지대 학생증 포함, 갈색 카드지갑",
    dateReceived: "2026-05-28",
    location: "중앙도서관 1층",
    storageUntil: "2026-06-27",
    status: "available",
  },
  {
    id: "2",
    name: "AirPods Pro",
    category: "전자기기",
    description: "흰색 케이스, 오른쪽 유닛 배터리 낮음",
    dateReceived: "2026-05-25",
    location: "학생회관",
    storageUntil: "2026-06-24",
    status: "available",
  },
  {
    id: "3",
    name: "학생증",
    category: "증명서",
    description: "김** 학생증, 경영학과",
    dateReceived: "2026-05-20",
    location: "도서관 열람실",
    storageUntil: "2026-06-19",
    status: "claimed",
  },
  {
    id: "4",
    name: "검은색 우산",
    category: "의류/잡화",
    description: "나무 손잡이 자동 우산",
    dateReceived: "2026-05-15",
    location: "학생식당",
    storageUntil: "2026-06-14",
    status: "available",
  },
  {
    id: "5",
    name: "MacBook Air 13",
    category: "전자기기",
    description: "스페이스 그레이, 학교 스티커 부착",
    dateReceived: "2026-05-10",
    location: "강의실 A201",
    storageUntil: "2026-06-09",
    status: "discarded",
  },
];

const categories = ["all", "지갑", "전자기기", "증명서", "의류/잡화"];

function getStatusMeta(status: CenterItem["status"]) {
  if (status === "available") {
    return { label: "보관 중", icon: CheckCircle2, bg: "rgba(22, 163, 74, 0.12)", color: "var(--uf-green)" };
  }
  if (status === "claimed") {
    return { label: "인수 완료", icon: ShieldCheck, bg: "var(--uf-blue-light)", color: "var(--uf-blue)" };
  }
  return { label: "보관 만료", icon: AlertCircle, bg: "var(--muted)", color: "var(--muted-foreground)" };
}

export default function LostAndFoundCenterScreen() {
  const { setScreen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filteredItems = centerItems.filter((item) => {
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  const availableCount = centerItems.filter((item) => item.status === "available").length;
  const claimedCount = centerItems.filter((item) => item.status === "claimed").length;

  return (
    <div className="uf-screen flex h-full flex-col">
      <div className="uf-header sticky top-0 z-40 px-4 pb-4 pt-14">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("mypage")} className="p-1 -ml-1">
            <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">분실물 센터</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">학교에 맡겨진 물건을 앱에서 먼저 확인하세요</p>
          </div>
        </div>
      </div>

      <div className="uf-page-enter flex-1 space-y-5 overflow-y-auto px-5 py-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl text-white"
          style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-floating)" }}
        >
          <div className="p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/75">캠퍼스 공식 보관소</p>
                <h2 className="mt-1 text-2xl font-extrabold">학생회관 1층</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 p-3">
                <Building2 size={28} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "보관 중", value: `${availableCount}건` },
                { label: "인수 완료", value: `${claimedCount}건` },
                { label: "운영", value: "09-18시" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/12 p-3">
                  <p className="text-lg font-extrabold">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="uf-card p-4"
        >
          <div className="grid gap-3">
            {[
              { icon: MapPin, label: "위치", value: "학생회관 1층 학생지원팀 옆" },
              { icon: Phone, label: "연락처", value: "02-1234-5678" },
              { icon: Clock, label: "운영시간", value: "월-금 09:00-18:00, 점심 12:00-13:00 제외" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="uf-icon-tile h-9 w-9 rounded-xl">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-3"
        >
          <div className="uf-glass flex items-center gap-2 rounded-2xl px-3 py-2.5">
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="물건, 장소, 특징 검색"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${selectedCategory === cat ? "uf-chip-active" : "uf-chip"}`}
                style={{
                  background: selectedCategory === cat ? "var(--foreground)" : undefined,
                  color: selectedCategory === cat ? "var(--background)" : undefined,
                }}
              >
                {cat === "all" ? "전체" : cat}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">센터 보관 목록</h3>
            <p className="text-xs font-semibold text-muted-foreground">총 {filteredItems.length}건</p>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const status = getStatusMeta(item.status);
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 + index * 0.04 }}
                  className="uf-card p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-extrabold text-foreground">{item.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div
                      className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: status.bg, color: status.color }}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl p-3" style={{ background: "var(--muted)" }}>
                      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <Package size={13} />
                        <span>분류</span>
                      </div>
                      <p className="font-bold text-foreground">{item.category}</p>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: "var(--muted)" }}>
                      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <MapPin size={13} />
                        <span>습득 위치</span>
                      </div>
                      <p className="truncate font-bold text-foreground">{item.location}</p>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: "var(--muted)" }}>
                      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={13} />
                        <span>접수일</span>
                      </div>
                      <p className="font-bold text-foreground">{item.dateReceived}</p>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: "var(--muted)" }}>
                      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                        <AlertCircle size={13} />
                        <span>보관 만료</span>
                      </div>
                      <p className="font-bold text-foreground">{item.storageUntil}</p>
                    </div>
                  </div>

                  {item.status === "available" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        className="uf-btn-primary flex-1 rounded-2xl py-3 text-sm font-bold"
                        onClick={() => toast.success("센터 방문 시 학생증과 본인 확인 답변을 준비해주세요.")}
                      >
                        인수 요청
                      </button>
                      <button
                        className="rounded-2xl px-4 py-3 text-sm font-bold transition-all active:scale-95"
                        style={{ background: "var(--muted)", color: "var(--foreground)" }}
                        onClick={() => toast.info(`${item.location}에서 접수된 물건이에요.`)}
                      >
                        위치
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="uf-card flex flex-col items-center justify-center px-6 py-14 text-center"
            >
              <AlertCircle size={36} style={{ color: "var(--muted-foreground)" }} />
              <p className="mt-3 text-sm font-extrabold text-foreground">조건에 맞는 물건이 없어요</p>
              <p className="mt-1 text-xs text-muted-foreground">검색어를 줄이거나 전체 카테고리로 다시 확인해보세요.</p>
              <button
                className="mt-5 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                }}
              >
                전체 목록 보기
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
