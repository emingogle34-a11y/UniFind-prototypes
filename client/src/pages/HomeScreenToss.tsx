// 개선된 홈 화면 - Toss 스타일
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Bell, Search, Plus, MapPin, Clock, Zap } from "lucide-react";
import { MOCK_ITEMS, UNIFIND_LOGO } from "@/lib/data";
import { TossButton, TossCard, Badge, StatCard, GradientText } from "@/components/TossComponents";
import { BottomSheet, Toast } from "@/components/TossPopups";

export default function HomeScreenToss() {
  const { setScreen, userName, userUniversity, userPoints } = useApp();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const recentItems = MOCK_ITEMS.slice(0, 6);
  const urgentItems = MOCK_ITEMS.filter((i) => i.points >= 500);

  const handleContact = () => {
    setToastMessage("채팅방이 생성되었습니다!");
    setShowToast(true);
    setShowItemDetail(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 transition-colors duration-300"
      style={{ background: "var(--background)" }}>
      {/* ===== HEADER WITH GRADIENT ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 px-5 pt-4 pb-6 rounded-b-3xl shadow-lg"
        style={{
          background: "var(--uf-premium-gradient)",
          color: "white",
        }}
      >
        {/* Header top */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={UNIFIND_LOGO} alt="UniFind" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs font-medium opacity-80">{userUniversity}</p>
              <h1 className="text-lg font-extrabold">안녕, {userName}님 👋</h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-400" />
          </motion.button>
        </div>

        {/* Search bar */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setScreen("search")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="물품 검색..."
            disabled
            className="flex-1 bg-transparent outline-none text-white placeholder-white/60"
          />
        </motion.div>
      </motion.div>

      {/* ===== CONTENT ===== */}
      <div className="px-5 space-y-6 pt-6 flex-1">
        {/* Points card with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 relative overflow-hidden shadow-lg cursor-pointer"
          onClick={() => setScreen("points")}
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--uf-blue) 72%, #111827 28%) 0%, color-mix(in srgb, var(--background) 28%, #111827 72%) 100%)",
            color: "white",
          }}
        >
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80">내 포인트</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-black">{userPoints.toLocaleString()}</span>
              <span className="text-lg font-bold opacity-80 mb-1">P</span>
            </div>
            <div className="flex items-center gap-2 mt-3 opacity-80">
              <Zap size={14} />
              <span className="text-sm">이번 달 +350P 적립</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-14 w-24 h-24 rounded-full bg-white/10" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard label="분실 신고" value="24" change={{ value: 12, isPositive: true }} icon="📋" />
          <StatCard label="습득 신고" value="18" change={{ value: 5, isPositive: true }} icon="📦" />
          <StatCard label="해결율" value="92%" change={{ value: 8, isPositive: true }} icon="✅" />
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <TossButton
            onClick={() => { setScreen("register"); }}
            variant="primary"
            className="w-full"
          >
            📋 분실 신고
          </TossButton>
          <TossButton
            onClick={() => { setScreen("register"); }}
            variant="secondary"
            className="w-full"
          >
            📦 습득 신고
          </TossButton>
        </motion.div>

        {/* Urgent items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground">🚨 긴급 분실물</h3>
            <Badge variant="error">높은 사례금</Badge>
          </div>
          <div className="space-y-3">
            {urgentItems.slice(0, 3).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.05 }}
                onClick={() => {
                  setSelectedItem(item.id);
                  setShowItemDetail(true);
                }}
                className="flex gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:shadow-md"
                style={{ background: "var(--card)" }}
              >
                <img
                  src={item.imageUrl || "https://via.placeholder.com/60"}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
                    </div>
                    <Badge variant="warning">{item.points}P</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {item.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-foreground">최근 등록</h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setScreen("search")}
              className="text-sm font-bold"
              style={{ color: "var(--uf-blue)" }}
            >
              전체보기 →
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recentItems.slice(0, 4).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => {
                  setSelectedItem(item.id);
                  setShowItemDetail(true);
                }}
                className="rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/150"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div className="text-white">
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs opacity-80">{item.points}P</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowRegisterSheet(true)}
        className="fixed bottom-24 right-5 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl z-30"
        style={{
          background: "var(--uf-premium-gradient)",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <Plus size={28} />
      </motion.button>

      {/* ===== ITEM DETAIL BOTTOM SHEET ===== */}
      <BottomSheet
        isOpen={showItemDetail}
        onClose={() => setShowItemDetail(false)}
        height="70vh"
      >
        {selectedItem && MOCK_ITEMS.find((i) => i.id === selectedItem) && (
          <div className="space-y-4">
            {/* Item image */}
            <img
              src={MOCK_ITEMS.find((i) => i.id === selectedItem)?.imageUrl || "https://via.placeholder.com/300"}
              alt="item"
              className="w-full h-48 rounded-2xl object-cover"
            />

            {/* Item info */}
            <div>
              <h3 className="text-2xl font-black text-foreground mb-2">
                  {MOCK_ITEMS.find((i) => i.id === selectedItem)?.title}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary">
                  {MOCK_ITEMS.find((i) => i.id === selectedItem)?.category}
                </Badge>
                <Badge variant="success">
                  {MOCK_ITEMS.find((i) => i.id === selectedItem)?.points}P
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span>{MOCK_ITEMS.find((i) => i.id === selectedItem)?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} />
                  <span>{MOCK_ITEMS.find((i) => i.id === selectedItem)?.date}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">
                {MOCK_ITEMS.find((i) => i.id === selectedItem)?.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <TossButton
                onClick={handleContact}
                variant="primary"
                size="lg"
                className="w-full"
              >
                💬 연락하기
              </TossButton>
              <TossButton
                onClick={() => setShowItemDetail(false)}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                닫기
              </TossButton>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ===== REGISTER BOTTOM SHEET ===== */}
      <BottomSheet
        isOpen={showRegisterSheet}
        onClose={() => setShowRegisterSheet(false)}
        title="새 물건 등록"
        height="60vh"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">카테고리</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}>
              <option>전자기기</option>
              <option>지갑/카드</option>
              <option>의류</option>
              <option>가방</option>
              <option>기타</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">사진 업로드</label>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--muted)",
              }}
            >
              <p className="text-2xl mb-2">📸</p>
              <p className="text-sm font-semibold text-foreground">사진을 선택하세요</p>
              <p className="text-xs text-muted-foreground">또는 드래그하여 업로드</p>
            </motion.div>
          </div>

          <TossButton
            onClick={() => {
              setShowRegisterSheet(false);
              setScreen("register");
            }}
            variant="primary"
            size="lg"
            className="w-full"
          >
            계속하기
          </TossButton>
        </div>
      </BottomSheet>

      {/* ===== TOAST ===== */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
