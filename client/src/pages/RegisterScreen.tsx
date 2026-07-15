import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { CATEGORY_ICONS, ItemCategory } from "@/lib/data";
import { ArrowLeft, Camera, Sparkles, MapPin, CheckCircle2, Loader2, Map, ShieldCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const USE_API = import.meta.env.VITE_USE_API === "true";
const CATEGORIES: ItemCategory[] = ["지갑/카드", "전자기기", "가방", "의류", "열쇠", "이어폰", "우산", "기타"];
const LOCATIONS = ["중앙도서관", "공학관", "경영관", "학생회관", "체육관", "생활관", "강의동", "정문", "기타"];

export default function RegisterScreen() {
  const { setScreen, registerType, setRegisterType } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showMapModal, setShowMapModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState("0");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiResult, setAiResult] = useState<ItemCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepMeta = [
    { title: "사진과 종류", desc: "AI가 먼저 분류하고, 필요하면 직접 바꿀 수 있어요" },
    { title: "장소와 시간", desc: "필수 정보만 먼저 입력하고 나머지는 나중에 보완해요" },
    { title: registerType === "lost" ? "보상과 확인" : "인수 조건", desc: "안전한 연락을 위한 마지막 확인 단계예요" },
  ];
  const currentStepMeta = stepMeta[step - 1];

  // tRPC 뮤테이션
  const createItemMutation = trpc.items.create.useMutation();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 이하)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("5MB 이하의 이미지만 업로드 가능합니다");
      return;
    }

    // Base64로 변환
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      toast.success("사진이 선택되었어요!");
    };
    reader.readAsDataURL(file);
  };

  const handleAiScan = async () => {
    setAiScanning(true);
    try {
      if (!imageBase64) {
        toast.info("사진 없이 샘플 이미지로 AI 분석을 시연합니다");
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setAiScanning(false);
      setAiDone(true);
      setAiResult("전자기기");
      setCategory("전자기기");
      if (!title) {
        setTitle(registerType === "lost" ? "실버 태블릿 분실" : "실버 태블릿 습득");
      }
      if (!desc) {
        setDesc("AI가 전자기기로 분류했어요. 색상, 케이스, 보관 장소 같은 특징을 추가하면 매칭 정확도가 올라갑니다.");
      }
      toast.success("AI가 전자기기로 분류하고 초안을 만들었어요!");
    } catch (error) {
      setAiScanning(false);
      toast.error("AI 분류에 실패했습니다");
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !location) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    try {
      if (!USE_API) {
        toast.success("등록이 완료되었어요! +100P 적립");
        setTimeout(() => setScreen("home"), 900);
        return;
      }

      await createItemMutation.mutateAsync({
        type: registerType === "lost" ? "lost" : "found",
        category: category as ItemCategory,
        title,
        description: desc,
        location,
        building: location,
        imageBase64: imageBase64 || undefined,
        isUrgent: parseInt(points) >= 500,
        points: parseInt(points),
      });

      toast.success("등록이 완료되었어요! +100P 적립");
      setTimeout(() => setScreen("home"), 1200);
    } catch (error) {
      toast.error("등록에 실패했습니다");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 sticky top-0 z-40 transition-colors duration-300" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen("home")} className="p-1 -ml-1">
            <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>{registerType === "lost" ? "분실물 등록" : "습득물 등록"}</h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{currentStepMeta.title} · {currentStepMeta.desc}</p>
          </div>
        </div>
        {/* Type toggle */}
        <div className="flex gap-2 p-1 rounded-xl transition-colors duration-300" style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}>
          {(["lost", "found"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRegisterType(t)}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: registerType === t ? (t === "lost" ? "#FF6B35" : "#3182F6") : "transparent",
                color: registerType === t ? "white" : "var(--muted-foreground)"
              }}
            >
              {t === "lost" ? "🔍 분실 신고" : "📦 습득 신고"}
            </button>
          ))}
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: n <= step ? "#3182F6" : "var(--border)" }} />
          ))}
        </div>
      </div>

      <div className="px-5 py-4 uf-page-enter flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Photo & AI */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#3182F6" }}>1단계</p>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>사진을 등록하세요</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>사진이 있으면 더 정확하고, 없어도 시연 분석을 바로 볼 수 있어요</p>
              </div>

              {/* Photo upload area */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden transition-all active:scale-[0.98]"
                style={{
                  height: 200,
                  background: imageBase64 ? "var(--muted)" : "var(--card)",
                  border: `2px dashed ${imageBase64 ? "#22C55E" : "var(--border)"}`
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imageBase64 ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={imageBase64} alt="preview" className="w-24 h-24 rounded-lg object-cover" />
                    <span className="text-sm font-semibold" style={{ color: "#22C55E" }}>사진이 선택되었어요</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera size={32} style={{ color: "var(--muted-foreground)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>사진 선택</span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>선택하지 않아도 AI 데모 분석 가능</span>
                  </div>
                )}
              </button>

              {/* AI Scan button */}
              <button
                onClick={handleAiScan}
                disabled={aiScanning}
                className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-soft)" }}
              >
                {aiScanning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    분석 중...
                  </>
                ) : aiDone ? (
                  <>
                    <CheckCircle2 size={18} />
                    AI 분류 완료
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {imageBase64 ? "AI로 카테고리 분류" : "AI 데모 분석 시작"}
                  </>
                )}
              </button>

              {aiDone && aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl p-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(49,130,246,0.12), rgba(22,163,74,0.1))",
                    border: "1px solid rgba(49,130,246,0.16)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--card)" }}>
                      {CATEGORY_ICONS[aiResult]}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--uf-blue)" }}>AI 분석 결과</p>
                      <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>{aiResult} · 신뢰도 97%</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>제목과 설명 초안을 자동으로 채웠어요</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="uf-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>카테고리 선택</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>직접 수정 가능</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="rounded-2xl px-2 py-3 text-center transition-all active:scale-95"
                      style={{
                        background: category === cat ? "var(--foreground)" : "var(--muted)",
                        color: category === cat ? "var(--background)" : "var(--foreground)",
                      }}
                    >
                      <span className="block text-xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="mt-1 block truncate text-[10px] font-bold">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={() => setStep(2)}
                disabled={!category}
                className="w-full py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: category ? "#3182F6" : "var(--muted)",
                  color: category ? "white" : "var(--muted-foreground)"
                }}
              >
                다음 단계
              </button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#3182F6" }}>2단계</p>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>상세 정보를 입력하세요</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>종류, 장소, 시간만 먼저 정확하면 등록 후에도 보완할 수 있어요</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: CATEGORY_ICONS[(category || "기타") as ItemCategory], label: "종류", value: category || "선택 필요" },
                  { icon: "📍", label: "장소", value: location || "선택 전" },
                  { icon: "⏱️", label: "시간", value: "방금" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: "var(--muted)" }}>
                    <p className="text-lg">{item.icon}</p>
                    <p className="mt-1 text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
                    <p className="mt-0.5 truncate text-xs font-extrabold" style={{ color: "var(--foreground)" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Category display */}
              <div className="p-4 rounded-xl transition-colors duration-300" style={{ background: "var(--muted)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>카테고리</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: "var(--card)" }}>
                    {CATEGORY_ICONS[category as ItemCategory]}
                  </div>
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>{category}</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>제목 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={registerType === "lost" ? "예: 검은색 지갑 분실" : "예: 검은색 지갑 습득"}
                  className="w-full mt-2 px-4 py-3 rounded-xl border transition-colors duration-300"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)"
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>상세 설명</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="색상, 브랜드, 보관 위치, 본인 확인에 필요한 특징을 적어주세요"
                  className="w-full mt-2 px-4 py-3 rounded-xl border transition-colors duration-300 resize-none"
                  rows={3}
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)"
                  }}
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>위치 *</label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border transition-colors duration-300"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  >
                    <option value="">선택해주세요</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                      ))}
                  </select>
                  <button
                    className="px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    style={{
                      background: "#10B981",
                      color: "white"
                    }}
                    onClick={() => setShowMapModal(true)}
                  >
                    <Map size={18} />
                    지도
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!title || !location}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: "#3182F6" }}
                >
                  다음
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Reward */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#3182F6" }}>3단계</p>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{registerType === "lost" ? "보상 포인트를 설정하세요" : "인수 조건을 확인하세요"}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{registerType === "lost" ? "높을수록 더 많은 사람들이 찾아줄 거예요" : "주인이 나타나면 확인 질문으로 안전하게 연결돼요"}</p>
              </div>

              {registerType === "lost" ? (
                <div className="p-4 rounded-xl transition-colors duration-300" style={{ background: "var(--muted)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>보상 포인트</span>
                    <span className="text-2xl font-extrabold" style={{ color: "#FF6B35" }}>
                      {parseInt(points).toLocaleString()}P
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                    <span>0P</span>
                    <span>500P (긴급)</span>
                    <span>1000P</span>
                  </div>
                </div>
              ) : (
                <div className="uf-card p-4 space-y-3">
                  {[
                    { icon: ShieldCheck, title: "주인 확인 질문 사용", desc: "물건 특징과 분실 시간대를 확인해요" },
                    { icon: Clock, title: "보관 기간 안내", desc: "30일 후 센터 이관 또는 만료 상태로 전환돼요" },
                    { icon: MapPin, title: "전달 장소 보호", desc: "정확한 만남 장소는 익명 채팅 안에서만 공유해요" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="uf-icon-tile h-9 w-9 rounded-xl">
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{title}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-4 rounded-xl transition-colors duration-300" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>등록 요약</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>타입</span>
                    <span style={{ color: "var(--foreground)" }} className="font-semibold">{registerType === "lost" ? "분실 신고" : "습득 신고"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>카테고리</span>
                    <span style={{ color: "var(--foreground)" }} className="font-semibold">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>제목</span>
                    <span style={{ color: "var(--foreground)" }} className="font-semibold truncate">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>위치</span>
                    <span style={{ color: "var(--foreground)" }} className="font-semibold">{location}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createItemMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "#3182F6" }}
                >
                  {createItemMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      등록하기
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="rounded-3xl p-6 max-w-md w-full shadow-2xl transition-colors duration-300"
              style={{ background: "var(--card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>캠퍼스 지도</h3>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  ✕
                </button>
              </div>

              {/* Map placeholder */}
              <div
                className="w-full h-80 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                <div className="text-center text-white">
                  <MapPin size={48} className="mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">캠퍼스 지도</p>
                  <p className="text-sm opacity-80 mt-1">위치를 선택하세요</p>
                </div>
              </div>

              {/* Location buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {LOCATIONS.slice(0, 6).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setShowMapModal(false);
                      toast.success(`${loc}이(가) 선택되었어요!`);
                    }}
                    className="p-3 rounded-xl font-semibold transition-all active:scale-95"
                    style={{
                      background: location === loc ? "#3182F6" : "var(--muted)",
                      color: location === loc ? "white" : "var(--muted-foreground)"
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowMapModal(false)}
                className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{ background: "#3182F6" }}
              >
                완료
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
