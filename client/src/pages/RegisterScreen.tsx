import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { ItemCategory } from "@/lib/data";
import { ArrowLeft, Camera, Sparkles, MapPin, CheckCircle2, Loader2, Map, ShieldCheck, Clock, PackageCheck, Search, LockKeyhole, X } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CategoryIcon } from "@/components/TossComponents";

const USE_API = import.meta.env.VITE_USE_API === "true";
const CATEGORIES: ItemCategory[] = ["블루투스 기기", "휴대폰/태블릿", "지갑/카드", "가방", "의류", "열쇠", "우산", "기타"];
const LOCATIONS = ["중앙도서관", "공학관", "경영관", "학생회관", "체육관", "생활관", "강의동", "정문", "기타"];
const AI_DESCRIPTION_EXAMPLE = "AI가 전자기기로 분류했어요. 색상, 케이스, 보관 장소 같은 특징을 추가하면 매칭 정확도가 올라갑니다.";

function inferCampusLocation(x: number, y: number) {
  if (y < 30) return "중앙도서관 앞";
  if (x < 34) return "공학관 광장";
  if (x > 68) return "학생회관 앞";
  if (y > 72) return "정문 근처";
  return "중앙광장";
}

export default function RegisterScreen() {
  const {
    goBack,
    replaceScreen,
    setSearchScope,
    registerType,
    setRegisterType,
    userPoints,
    isAuthenticated,
  } = useApp();
  const utils = trpc.useUtils();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showMapModal, setShowMapModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [descFocused, setDescFocused] = useState(false);
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [mapPin, setMapPin] = useState({ x: 50, y: 52 });
  const [points, setPoints] = useState("0");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiResult, setAiResult] = useState<ItemCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const stepMeta = [
    { title: "사진과 종류", desc: "AI가 먼저 분류하고, 필요하면 직접 바꿀 수 있어요" },
    { title: "장소와 시간", desc: "필수 정보만 먼저 입력하고 나머지는 나중에 보완해요" },
    { title: registerType === "lost" ? "보상과 확인" : "안전한 전달", desc: "안전한 연락을 위한 마지막 확인 단계예요" },
  ];
  const currentStepMeta = stepMeta[step - 1];
  const maxRewardPoints = Math.max(0, Math.min(1000, Math.floor(userPoints / 50) * 50));
  const resolvedLocation = location === "기타" ? customLocation.trim() : location;

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
    if (!imageBase64) {
      toast.error("AI 분류에 사용할 사진을 먼저 선택해주세요");
      return;
    }

    if (!USE_API) {
      toast.info("실제 AI 분석은 서버가 연결된 배포 환경에서 사용할 수 있어요");
      return;
    }

    setAiScanning(true);
    try {
      setAiScanning(false);
      toast.info("사진은 등록과 동시에 서버 AI가 실제로 분류해요");
    } catch (error) {
      setAiScanning(false);
      toast.error("AI 분류에 실패했습니다");
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !resolvedLocation) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    if (!isAuthenticated) {
      toast.info("게시물을 등록하려면 로그인과 학교 인증이 필요해요");
      replaceScreen("auth");
      return;
    }

    if (!USE_API) {
      toast.error("현재 미리보기에서는 서버 저장이 꺼져 있어 등록할 수 없어요");
      return;
    }

    try {
      const result = await createItemMutation.mutateAsync({
        type: registerType === "lost" ? "lost" : "found",
        category: category as ItemCategory,
        title,
        description: desc,
        location: resolvedLocation,
        building: resolvedLocation,
        imageBase64: imageBase64?.split(",")[1] || undefined,
        isUrgent: parseInt(points) >= 500,
        points: parseInt(points),
      });

      await utils.auth.me.invalidate();
      const earnedPoints = result.rewardPoints;
      toast.success(`등록이 완료되었어요! +${earnedPoints}P 적립`);
      setSearchScope("mine");
      replaceScreen("search");
    } catch (error) {
      toast.error("등록에 실패했습니다");
      console.error(error);
    }
  };

  const updateMapLocation = (clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.min(93, Math.max(7, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(88, Math.max(12, ((clientY - rect.top) / rect.height) * 100));
    const nextLocation = inferCampusLocation(x, y);

    setMapPin({ x, y });
    setLocation(nextLocation);
    setCustomLocation("");
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    updateMapLocation(event.clientX, event.clientY);
  };

  const handleMapDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    updateMapLocation(info.point.x, info.point.y);
  };

  return (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-4 pt-14 pb-4 sticky top-0 z-40 transition-colors duration-300" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="p-1 -ml-1" aria-label="이전 화면으로 돌아가기">
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
              <span className="flex items-center justify-center gap-1.5">
                {t === "lost" ? <Search size={15} /> : <PackageCheck size={15} />}
                {t === "lost" ? "분실 신고" : "습득 신고"}
              </span>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--card)", color: "var(--uf-blue)" }}>
                      <CategoryIcon category={aiResult} size={23} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--uf-blue)" }}>AI 분석 결과</p>
                      <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>{aiResult} · 신뢰도 97%</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>제목 초안과 설명 예시를 준비했어요</p>
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
                      <span className="flex h-6 items-center justify-center"><CategoryIcon category={cat} size={19} strokeWidth={2.15} /></span>
                      <span className="mt-1 flex min-h-[22px] items-center justify-center break-keep text-[9px] font-bold leading-[1.15]">{cat}</span>
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
                  { icon: <CategoryIcon category={(category || "기타") as ItemCategory} size={18} />, label: "종류", value: category || "선택 필요" },
                  { icon: <MapPin size={18} />, label: "장소", value: resolvedLocation || (location === "기타" ? "직접 입력 필요" : "선택 전") },
                  { icon: <Clock size={18} />, label: "시간", value: "방금" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: "var(--muted)" }}>
                    <span className="flex h-5 items-center justify-center text-muted-foreground">{item.icon}</span>
                    <p className="mt-1 text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
                    <p className="mt-0.5 truncate text-xs font-extrabold" style={{ color: "var(--foreground)" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Category display */}
              <div className="p-4 rounded-xl transition-colors duration-300" style={{ background: "var(--muted)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>카테고리</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "var(--card)", color: "var(--uf-blue)" }}>
                    <CategoryIcon category={category as ItemCategory} size={23} />
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
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  placeholder={descFocused ? "" : aiDone ? AI_DESCRIPTION_EXAMPLE : "색상, 브랜드, 보관 위치, 본인 확인에 필요한 특징을 적어주세요"}
                  className="mt-2 w-full resize-none rounded-xl border px-4 py-3 transition-colors duration-300 placeholder:text-muted-foreground/70"
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
                    onChange={(e) => {
                      const nextLocation = e.target.value;
                      setLocation(nextLocation);
                      if (nextLocation !== "기타") setCustomLocation("");
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border transition-colors duration-300"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  >
                    <option value="">선택해주세요</option>
                    {location && !LOCATIONS.includes(location) && (
                      <option value={location}>지도 지정 · {location}</option>
                    )}
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                      ))}
                  </select>
                  <button
                    className="px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    style={{
                      background: "var(--uf-blue)",
                      color: "white"
                    }}
                    onClick={() => setShowMapModal(true)}
                  >
                    <Map size={18} />
                    지도
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {location === "기타" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      className="overflow-hidden"
                    >
                      <label htmlFor="custom-location" className="mt-3 block text-xs font-semibold text-muted-foreground">
                        위치 직접 입력
                      </label>
                      <input
                        id="custom-location"
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="예: 경영관 3층 세미나실 앞"
                        autoFocus
                        className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  disabled={!title || !resolvedLocation}
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
                <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{registerType === "lost" ? "보상 포인트를 설정하세요" : "안전하게 전달할 방법을 확인하세요"}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{registerType === "lost" ? "물건을 돌려준 습득자에게 지급할 포인트예요" : "주인이 나타나면 확인 질문으로 안전하게 연결돼요"}</p>
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
                    max={maxRewardPoints}
                    step="50"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                    <span>0P</span>
                    <span>500P (긴급)</span>
                    <span>{maxRewardPoints.toLocaleString()}P</span>
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-2xl px-3 py-3" style={{ background: "var(--card)" }}>
                    <LockKeyhole size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--uf-blue)" }} />
                    <p className="text-[11px] font-semibold leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      선택한 포인트는 등록과 함께 보상 대기로 보관돼요. 분실자가 <strong className="text-foreground">물건을 받았어요</strong>를 누르면 습득자에게 자동 지급됩니다.
                    </p>
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
                    <span style={{ color: "var(--foreground)" }} className="max-w-[68%] text-right font-semibold">{resolvedLocation}</span>
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
            className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] p-5 shadow-2xl transition-colors duration-300 sm:rounded-3xl sm:p-6"
              style={{ background: "var(--card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>캠퍼스 지도에서 지정</h3>
                  <p className="mt-1 text-xs text-muted-foreground">지도를 누르거나 핀을 끌어 위치를 선택하세요</p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                  aria-label="지도 닫기"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive campus map prototype */}
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className="relative mb-4 h-72 w-full cursor-crosshair overflow-hidden rounded-2xl border border-border bg-[color:var(--uf-blue-light)]"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in srgb, var(--uf-blue) 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--uf-blue) 8%, transparent) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="absolute left-[10%] top-[12%] rounded-lg bg-card/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">중앙도서관</div>
                <div className="absolute left-[8%] top-[52%] rounded-lg bg-card/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">공학관</div>
                <div className="absolute right-[7%] top-[42%] rounded-lg bg-card/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">학생회관</div>
                <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 rounded-lg bg-card/90 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">정문</div>
                <div className="absolute left-[18%] right-[18%] top-1/2 h-3 -translate-y-1/2 rounded-full bg-card/55" />
                <div className="absolute bottom-[18%] left-1/2 top-[22%] w-3 -translate-x-1/2 rounded-full bg-card/55" />

                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-full"
                  style={{ left: `${mapPin.x}%`, top: `${mapPin.y}%` }}
                >
                  <motion.button
                    type="button"
                    drag
                    dragConstraints={mapRef}
                    dragElastic={0.04}
                    dragMomentum={false}
                    dragSnapToOrigin
                    onDragEnd={handleMapDragEnd}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    className="flex flex-col items-center text-[color:var(--uf-blue)] drop-shadow-lg active:cursor-grabbing"
                    aria-label="위치 핀 이동"
                  >
                    <MapPin size={38} fill="currentColor" strokeWidth={1.8} />
                    <span className="mt-0.5 h-2 w-5 rounded-full bg-black/15 blur-[1px]" />
                  </motion.button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-card/90 px-3 py-2 text-center text-xs shadow-sm backdrop-blur">
                  <span className="text-muted-foreground">선택 위치 · </span>
                  <strong className="text-foreground">{resolvedLocation || "핀을 움직여 지정"}</strong>
                </div>
              </div>

              {/* Location buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {LOCATIONS.slice(0, 6).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setCustomLocation("");
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
                disabled={!resolvedLocation}
                className="w-full rounded-xl py-3 font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                style={{ background: "var(--uf-blue)" }}
              >
                이 위치로 선택
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
