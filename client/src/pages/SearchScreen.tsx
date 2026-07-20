import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ItemCategory, MOCK_ITEMS } from "@/lib/data";
import { ArrowLeft, Building2, Eye, Loader2, LogIn, MapPin, MessageCircle, PackageSearch, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { CategoryIcon } from "@/components/TossComponents";

const USE_API = import.meta.env.VITE_USE_API === "true";

const CATEGORIES: (ItemCategory | "전체")[] = [
  "전체", "블루투스 기기", "휴대폰/태블릿", "지갑/카드", "가방", "의류", "열쇠", "우산", "기타"
];

const BUILDINGS = ["전체", "중앙도서관", "공학관", "경영관", "학생회관", "체육관", "생활관", "강의동", "정문"];

export default function SearchScreen() {
  const {
    setScreen,
    replaceScreen,
    goBack,
    setSelectedItemId,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    activeUniversity,
    visitPassUniversity,
    searchScope,
    isAuthenticated,
  } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [filterBuilding, setFilterBuilding] = useState("전체");
  const activeType: "lost" | "found" = filterType === "found" ? "found" : "lost";

  // tRPC 쿼리
  const listQuery = trpc.items.list.useQuery({
    building: filterBuilding === "전체" ? undefined : filterBuilding,
    type: activeType,
    status: "active",
  }, {
    enabled: USE_API && searchScope === "all",
    retry: false,
  });
  const mineQuery = trpc.items.mine.useQuery({
    building: filterBuilding === "전체" ? undefined : filterBuilding,
    type: activeType,
    status: "active",
  }, {
    enabled: USE_API && searchScope === "mine" && isAuthenticated,
    retry: false,
  });
  const activeQuery = searchScope === "mine" ? mineQuery : listQuery;
  const items = (USE_API
    ? activeQuery.data ?? []
    : searchScope === "mine"
      ? []
      : MOCK_ITEMS) as any[];
  const showLoading = activeQuery.isLoading && items.length === 0;

  const filtered = items.filter((item) => {
    const matchCat = filterCategory === "전체" || item.category === filterCategory;
    const matchType = item.type === activeType;
    const matchBuilding = filterBuilding === "전체" || item.location.includes(filterBuilding);
    const matchCampus = searchScope === "mine" || !visitPassUniversity || item.authorUniversity === activeUniversity;
    const matchQ = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchType && matchBuilding && matchCampus && matchQ;
  });

  const typeCounts = {
    lost: items.filter((item) => item.type === "lost" && (!visitPassUniversity || item.authorUniversity === activeUniversity)).length,
    found: items.filter((item) => item.type === "found" && (!visitPassUniversity || item.authorUniversity === activeUniversity)).length,
  };

  return (
    <div className="uf-screen flex flex-col h-full transition-colors duration-300">
      {/* Header */}
      <div className="uf-header px-4 pt-14 pb-3 sticky top-0 z-40 transition-colors duration-300">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <button onClick={goBack} className="-ml-1 mt-0.5 rounded-full p-1.5 active:scale-95" aria-label="이전 화면으로 돌아가기">
                <ArrowLeft size={21} style={{ color: "var(--foreground)" }} />
              </button>
              <div>
              <h1 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{searchScope === "mine" ? "내 게시글" : "캠퍼스 물건 찾기"}</h1>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {searchScope === "mine" ? "내가 등록한 분실·습득 게시물을 관리해요" : "분실과 습득 목록을 나눠서 빠르게 확인하세요"}
              </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5" style={{ background: visitPassUniversity ? "var(--uf-purple-soft)" : "var(--muted)", color: visitPassUniversity ? "var(--uf-purple)" : "var(--muted-foreground)" }}>
              <Building2 size={12} />
              <span className="max-w-[92px] truncate text-[10px] font-extrabold">{activeUniversity}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="uf-glass flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-colors duration-300">
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder={activeType === "lost" ? "잃어버린 물건 검색" : "주인을 찾는 물건 검색"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none transition-colors duration-300"
              style={{ color: "var(--foreground)" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            aria-label={showFilter ? "상세 필터 닫기" : "상세 필터 열기"}
            className="w-10 h-10 rounded-2xl flex items-center justify-center relative transition-all active:scale-95"
            style={{
              background: showFilter ? "var(--uf-blue-light)" : "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: showFilter ? "var(--uf-shadow-soft)" : "none",
            }}
          >
            <SlidersHorizontal size={16} style={{ color: showFilter ? "var(--uf-blue)" : "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Lost/found lists are deliberately separated. */}
        <div className="mt-3 grid grid-cols-2 rounded-[20px] bg-muted p-1">
          {(["lost", "found"] as const).map((t) => {
            const isActive = activeType === t;
            return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="rounded-2xl px-3 py-2.5 text-left transition-all active:scale-[0.98]"
              style={{
                background: isActive ? "var(--card)" : "transparent",
                boxShadow: isActive ? "var(--uf-shadow-soft)" : "none",
              }}
            >
              <span className="block text-xs font-extrabold" style={{ color: isActive ? (t === "lost" ? "var(--uf-orange)" : "var(--uf-blue)") : "var(--muted-foreground)" }}>
                {t === "lost" ? "분실 신고" : "습득 등록"}
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold text-muted-foreground">
                {t === "lost" ? "잃어버린 물건" : "주인을 찾는 물건"} · {typeCounts[t]}건
              </span>
            </button>
            );
          })}
        </div>

        {/* Category scroll */}
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1" aria-label="물건 카테고리">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${filterCategory === cat ? "uf-chip-active" : "uf-chip"}`}
              style={{
                background: filterCategory === cat ? "var(--foreground)" : undefined,
                color: filterCategory === cat ? "var(--background)" : undefined,
              }}
            >
              {cat !== "전체" && <CategoryIcon category={cat as ItemCategory} size={14} strokeWidth={2.2} />}
              {cat}
            </button>
          ))}
        </div>

        {/* Building filter (Advanced) */}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t transition-colors duration-300"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>건물별 필터</p>
            <div className="flex flex-wrap gap-2">
              {BUILDINGS.map((building) => (
                <button
                  key={building}
                  onClick={() => setFilterBuilding(building)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${filterBuilding === building ? "uf-chip-active" : "uf-chip"}`}
                  style={{
                    background: filterBuilding === building ? "var(--foreground)" : undefined,
                    color: filterBuilding === building ? "var(--background)" : undefined,
                  }}
                >
                  {building}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 pb-24 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 rounded-3xl p-4"
          style={{
            background: "linear-gradient(135deg, var(--uf-blue-light), color-mix(in srgb, var(--uf-blue) 8%, var(--card)))",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--uf-blue)" }}>AI 매칭 검색</p>
              <p className="mt-1 text-sm font-extrabold leading-snug" style={{ color: "var(--foreground)" }}>
                사진, 장소, 시간을 함께 보고 비슷한 게시물을 우선 보여줘요
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--card)", color: "var(--uf-blue)" }}>
              <Sparkles size={20} />
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="uf-header px-5 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {activeType === "lost" ? "분실 신고" : "습득 등록"} <span style={{ color: activeType === "lost" ? "var(--uf-orange)" : "var(--uf-blue)" }}>{filtered.length}</span>건
          </p>
          {(filterCategory !== "전체" || filterBuilding !== "전체" || searchQuery) && (
            <button
              onClick={() => { setFilterCategory("전체"); setFilterBuilding("전체"); setSearchQuery(""); }}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--uf-orange)" }}
            >
              <X size={12} /> 필터 초기화
            </button>
          )}
        </div>

        {/* List */}
        <div className="px-4 space-y-2.5 uf-stagger py-3">
          <AnimatePresence>
            {showLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="animate-spin mb-4" size={24} style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>로딩 중...</p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px]" style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}>
                  <PackageSearch size={28} />
                </span>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  {searchScope === "mine" ? "아직 등록한 게시물이 없어요" : activeType === "lost" ? "해당 분실 신고가 없어요" : "해당 습득 등록이 없어요"}
                </p>
                <p className="text-xs mt-1 text-center" style={{ color: "var(--muted-foreground)" }}>
                  {searchScope === "mine" && !isAuthenticated ? "로그인하면 내가 쓴 게시물을 확인할 수 있어요" : "다른 카테고리나 건물을 선택해보세요"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (searchScope === "mine" && !isAuthenticated) {
                      replaceScreen("auth");
                      return;
                    }
                    setFilterCategory("전체"); setFilterBuilding("전체"); setSearchQuery("");
                  }}
                  className="mt-5 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  {searchScope === "mine" && !isAuthenticated ? <span className="flex items-center gap-1.5"><LogIn size={14} /> 로그인하기</span> : "필터 초기화"}
                </button>
              </motion.div>
            ) : (
              filtered.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setSelectedItemId(item.id.toString()); setScreen("item-detail"); }}
                  className="uf-card w-full text-left p-4 flex items-start gap-3 transition-all active:opacity-80"
                >
                  {/* Image or Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden"
                    style={{ background: item.type === "lost" ? "var(--uf-danger-soft)" : "var(--uf-blue-light)" }}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryIcon category={item.category as ItemCategory} size={22} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: item.type === "lost" ? "var(--uf-danger-soft)" : "var(--uf-blue-light)",
                          color: item.type === "lost" ? "var(--uf-orange)" : "var(--uf-blue)"
                        }}
                      >
                        {item.type === "lost" ? "분실" : "습득"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {item.category}
                      </span>
                      {item.aiConfidence && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
                          AI {Math.round(Number(item.aiConfidence) <= 1 ? Number(item.aiConfidence) * 100 : Number(item.aiConfidence))}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{item.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{item.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <MapPin size={10} style={{ color: "var(--muted-foreground)" }} />
                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{item.location}</span>
                      </div>
                      <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        {item.reportedAt ? new Date(item.reportedAt).toLocaleDateString() : item.date}
                      </span>
                    </div>
                    {visitPassUniversity && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--uf-purple)" }}>
                        <Building2 size={10} />
                        {item.authorUniversity}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {(item.points ?? 0) > 0 && (
                      <span className="text-xs font-extrabold" style={{ color: "var(--uf-orange)" }}>+{item.points}P</span>
                    )}
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      <Eye size={11} />
                      <span>{item.views ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      <MessageCircle size={11} />
                      <span>{item.chatCount ?? 0}</span>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
