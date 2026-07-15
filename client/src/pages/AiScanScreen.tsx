import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Sparkles, Camera, CheckCircle2, ChevronRight, FileText, MapPin, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_ICONS, ItemCategory } from "@/lib/data";
import { motionTransition, riseItem, staggerContainer, tapMotion } from "@/lib/motion";
import { toast } from "sonner";

type ScanState = "idle" | "scanning" | "done";

const AI_CATEGORY = "전자기기" as ItemCategory;

const pipelineSteps = [
  { icon: Camera, label: "사진 인식", desc: "물체 윤곽과 색상 추출" },
  { icon: Sparkles, label: "카테고리 예측", desc: "전자기기 가능성 분석" },
  { icon: FileText, label: "등록값 추천", desc: "제목, 장소, 알림 후보 생성" },
];

export default function AiScanScreen() {
  const { setScreen } = useApp();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<{ category: ItemCategory; confidence: number } | null>(null);

  const resultDetails = result
    ? [
        { icon: FileText, label: "추천 제목", value: "실버 태블릿 또는 아이패드" },
        { icon: MapPin, label: "입력 추천", value: "경영관 세미나실 주변" },
        { icon: Bell, label: "유사 게시물", value: "습득물 2건 알림 후보" },
      ]
    : [];

  const activeStep = scanState === "idle" ? -1 : scanState === "scanning" ? 1 : 2;
  const progressValue = scanState === "idle" ? 8 : scanState === "scanning" ? 64 : 100;

  const handleScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("done");
      setResult({ category: AI_CATEGORY, confidence: 97 });
    }, 1600);
  };

  const handleRegister = () => {
    setScreen("register");
    toast.success("AI 분류 결과가 등록 화면에 적용됩니다");
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #0b111d 0%, #101827 52%, #111827 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(180deg, black 0%, transparent 82%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-3 px-4 pb-4 pt-14">
        <motion.button {...tapMotion} onClick={() => setScreen("home")} className="-ml-1 rounded-full p-2">
          <ArrowLeft size={22} color="white" />
        </motion.button>
        <div>
          <h1 className="text-lg font-extrabold text-white">AI 자동 분류</h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.58)" }}>
            사진 한 장으로 분실물 등록을 빠르게 시작해요
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "rgba(122,167,255,0.16)", border: "1px solid rgba(122,167,255,0.32)" }}
        >
          <Sparkles size={12} style={{ color: "#9bbcff" }} />
          <span className="text-xs font-semibold" style={{ color: "#9bbcff" }}>
            AI
          </span>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-center gap-5 px-5 py-5">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={motionTransition.normal}
          className="relative w-full"
          style={{ maxWidth: scanState === "done" ? 260 : 306, aspectRatio: "1/1" }}
        >
          <div className="absolute inset-0 rounded-[30px] bg-white/10 p-1 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
            <div className="relative h-full overflow-hidden rounded-[26px]">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/unifind-ai-scan-ADDKh8MpcZg5zpR6kZpfAq.webp"
                alt="AI 스캔 예시"
                className="h-full w-full object-cover"
                style={{ opacity: scanState === "idle" ? 0.34 : 0.84 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
            </div>
          </div>

          {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
            <div key={pos} className={`absolute ${pos} h-9 w-9`}>
              <div
                className="absolute inset-0"
                style={{
                  borderTop: i < 2 ? "3px solid var(--uf-blue)" : "none",
                  borderBottom: i >= 2 ? "3px solid var(--uf-blue)" : "none",
                  borderLeft: i % 2 === 0 ? "3px solid var(--uf-blue)" : "none",
                  borderRight: i % 2 === 1 ? "3px solid var(--uf-blue)" : "none",
                  borderRadius: i === 0 ? "10px 0 0 0" : i === 1 ? "0 10px 0 0" : i === 2 ? "0 0 0 10px" : "0 0 10px 0",
                }}
              />
            </div>
          ))}

          {scanState === "scanning" && (
            <div className="absolute inset-1 overflow-hidden rounded-[26px]">
              <div className="uf-scan-line" />
            </div>
          )}

          <AnimatePresence>
            {scanState === "done" && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={motionTransition.normal}
                className="absolute inset-1 flex flex-col items-center justify-center rounded-[26px]"
                style={{ background: "rgba(10,15,30,0.88)", backdropFilter: "blur(10px)" }}
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-3 text-6xl"
                >
                  {CATEGORY_ICONS[result.category] ?? "📱"}
                </motion.div>
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} style={{ color: "var(--uf-green)" }} />
                    <span className="text-sm font-bold text-white">분류 완료</span>
                  </div>
                  <p className="text-xl font-extrabold text-white">{result.category}</p>
                  <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.64)" }}>
                    신뢰도 {result.confidence}%
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {scanState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[30px]">
              <Camera size={42} style={{ color: "rgba(255,255,255,0.34)" }} />
              <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>
                아래 버튼을 눌러 스캔 흐름을 확인하세요
              </p>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {scanState === "idle" && (
            <motion.p key="idle" variants={riseItem} initial="initial" animate="animate" exit={{ opacity: 0 }} className="max-w-xs text-center text-sm" style={{ color: "rgba(255,255,255,0.66)" }}>
              카테고리, 제목, 위치 힌트를 AI가 먼저 채워줘서 등록 시간을 줄여요.
            </motion.p>
          )}
          {scanState === "scanning" && (
            <motion.p key="scanning" variants={riseItem} initial="initial" animate="animate" exit={{ opacity: 0 }} className="text-sm font-semibold" style={{ color: "#9bbcff" }}>
              사진 특징과 캠퍼스 데이터를 함께 분석 중이에요...
            </motion.p>
          )}
          {scanState === "done" && result && (
            <motion.div key="done" variants={riseItem} initial="initial" animate="animate" exit={{ opacity: 0 }} className="space-y-1 text-center">
              <p className="text-sm font-bold text-white">
                <span style={{ color: "#9bbcff" }}>{result.category}</span>로 분류했어요
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.58)" }}>
                추천값을 확인한 뒤 바로 등록할 수 있어요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-sm rounded-[28px] p-3"
          style={{
            background: "rgba(255,255,255,0.075)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 22px 58px rgba(0,0,0,0.22)",
          }}
        >
          <div className="mb-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #77a7ff, #8cf1c5)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={motionTransition.slow}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pipelineSteps.map(({ icon: Icon, label, desc }, index) => {
              const isActive = index <= activeStep;
              return (
                <motion.div
                  key={label}
                  variants={riseItem}
                  className="rounded-2xl p-2.5"
                  style={{
                    background: isActive ? "rgba(122,167,255,0.16)" : "rgba(255,255,255,0.055)",
                    border: isActive ? "1px solid rgba(122,167,255,0.28)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? "#9bbcff" : "rgba(255,255,255,0.45)" }} />
                  <p className="mt-2 text-[11px] font-extrabold text-white">{label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.52)" }}>
                    {desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {scanState === "done" && result && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={motionTransition.normal}
              className="w-full max-w-sm rounded-[28px] p-4"
              style={{
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.58)" }}>
                    자동 입력 미리보기
                  </p>
                  <p className="text-sm font-extrabold text-white">필수 정보가 먼저 채워져요</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "rgba(34,197,94,0.16)", color: "#86efac" }}>
                  {result.confidence}%
                </span>
              </div>
              <div className="space-y-2">
                {resultDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <Icon size={15} style={{ color: "#9bbcff" }} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.48)" }}>
                        {label}
                      </p>
                      <p className="truncate text-xs font-bold text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 shrink-0 space-y-3 px-5 pb-12 pt-1">
        {scanState !== "done" ? (
          <motion.button
            {...tapMotion}
            onClick={handleScan}
            disabled={scanState === "scanning"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition-all disabled:cursor-not-allowed"
            style={{
              background: scanState === "scanning" ? "rgba(122,167,255,0.38)" : "var(--uf-premium-gradient)",
              boxShadow: "0 20px 56px rgba(49, 99, 235, 0.26)",
            }}
          >
            {scanState === "scanning" ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                AI 스캔 시작
              </>
            )}
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionTransition.normal} className="space-y-2">
            <motion.button
              {...tapMotion}
              onClick={handleRegister}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white"
              style={{ background: "var(--uf-premium-gradient)", boxShadow: "0 20px 56px rgba(49, 99, 235, 0.26)" }}
            >
              이 결과로 등록하기
              <ChevronRight size={18} />
            </motion.button>
            <motion.button
              {...tapMotion}
              onClick={() => {
                setScanState("idle");
                setResult(null);
              }}
              className="w-full rounded-2xl py-3 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.74)" }}
            >
              다시 스캔
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
