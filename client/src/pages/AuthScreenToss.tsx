// UniFind - premium mobile-first auth flow
import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useApp } from "@/contexts/AppContext";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { LoadingSpinner, SchoolEmblem } from "@/components/TossComponents";
import { Modal } from "@/components/TossPopups";
import { UNIVERSITIES, UNIFIND_LOGO } from "@/lib/data";
import { motionEase, motionTransition } from "@/lib/motion";

type AuthStep = "landing" | "login" | "signup" | "verify-school" | "verify-email" | "complete";
type FieldName = "email" | "password" | "name";
type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

const SIGNUP_STEPS: AuthStep[] = ["signup", "verify-school", "verify-email", "complete"];

const screenMotion: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 26 : -26,
    filter: "blur(8px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: motionTransition.normal,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -26 : 26,
    filter: "blur(8px)",
    transition: { duration: 0.2, ease: motionEase.out },
  }),
};

const riseItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: motionTransition.slow },
};

const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const featureTiles = [
  { label: "AI 분류", value: "97%", Icon: Sparkles, accent: "var(--uf-blue)" },
  { label: "익명 채팅", value: "보호", Icon: MessageCircle, accent: "var(--uf-green)" },
  { label: "학교 인증", value: "필수", Icon: ShieldCheck, accent: "var(--uf-amber)" },
];

function PremiumAuthBackground({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? "linear-gradient(180deg, color-mix(in srgb, var(--background) 72%, black 28%) 0%, var(--background) 52%, color-mix(in srgb, var(--card) 76%, black 24%) 100%)"
            : "linear-gradient(180deg, color-mix(in srgb, var(--uf-blue-light) 54%, white 46%) 0%, #ffffff 48%, color-mix(in srgb, var(--uf-green) 5%, white 95%) 100%)",
        }}
      />
      <motion.div
        className="absolute -left-24 top-20 h-44 w-[36rem] rotate-[-14deg] blur-3xl"
        animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: isDarkMode
            ? "linear-gradient(90deg, color-mix(in srgb, var(--uf-blue) 16%, transparent), color-mix(in srgb, var(--uf-green) 8%, transparent), transparent)"
            : "linear-gradient(90deg, color-mix(in srgb, var(--uf-blue) 12%, transparent), color-mix(in srgb, var(--uf-green) 7%, transparent), transparent)",
        }}
      />
      <motion.div
        className="absolute -right-28 bottom-24 h-40 w-[32rem] rotate-[18deg] blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: isDarkMode
            ? "linear-gradient(90deg, transparent, color-mix(in srgb, var(--uf-amber) 9%, transparent), color-mix(in srgb, var(--uf-blue) 10%, transparent))"
            : "linear-gradient(90deg, transparent, color-mix(in srgb, var(--uf-amber) 8%, transparent), color-mix(in srgb, var(--uf-blue) 8%, transparent))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: isDarkMode
            ? "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
            : "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, transparent, black 18%, black 74%, transparent)",
        }}
      />
      <motion.div
        className="absolute left-5 right-5 top-[32%] h-px"
        animate={{ opacity: [0.14, 0.28, 0.14], x: [-12, 12, -12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--uf-blue) 34%, transparent), transparent)" }}
      />
    </div>
  );
}

function AuthShell({ children, isDarkMode }: { children: ReactNode; isDarkMode: boolean }) {
  return (
    <div className="relative flex min-h-full w-full flex-col overflow-x-hidden overflow-y-auto px-5 pb-6 pt-4">
      <PremiumAuthBackground isDarkMode={isDarkMode} />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}

function HeaderBack({
  canGoBack,
  onBack,
  onHelp,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onHelp: () => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between">
      <motion.button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        initial={false}
        animate={{ opacity: canGoBack ? 1 : 0, pointerEvents: canGoBack ? "auto" : "none" }}
        whileTap={{ scale: 0.94 }}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]/76 shadow-sm backdrop-blur-xl"
      >
        <ArrowLeft size={19} />
      </motion.button>
      <button
        type="button"
        onClick={onHelp}
        className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/72 px-3 py-2 text-xs font-bold text-[color:var(--muted-foreground)] shadow-sm backdrop-blur-xl transition hover:text-[color:var(--foreground)] active:scale-95"
      >
        인증 도움말
      </button>
    </div>
  );
}

function PremiumPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      variants={riseItem}
      className={`relative overflow-hidden rounded-[24px] border border-white/60 bg-[color:var(--card)]/90 p-4 shadow-[0_22px_64px_rgba(15,23,42,0.12),0_1px_0_rgba(255,255,255,0.62)_inset] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/76 dark:shadow-[0_28px_72px_rgba(0,0,0,0.32)] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.86), transparent)" }}
      />
      {children}
    </motion.section>
  );
}

function BrandLockup() {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="pt-1">
      <motion.div variants={riseItem} className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[19px] border border-white/70 bg-white shadow-[0_14px_34px_rgba(37,99,235,0.13)]">
          <img src={UNIFIND_LOGO} alt="UniFind" className="h-9 w-9 object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.18em] text-[color:var(--uf-blue)]">UNIFIND</p>
          <h1 className="text-[1.72rem] font-black leading-[1.14] tracking-[0] text-[color:var(--foreground)]">
            캠퍼스 분실물을
            <br />
            더 빨리 찾게.
          </h1>
        </div>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 max-w-[19rem] text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
        학교 인증, AI 사진 분류, 익명 채팅을 한 화면 흐름으로 묶은 UniFind 인증입니다.
      </motion.p>
    </motion.div>
  );
}

function FinderHeroVisual() {
  return (
    <motion.div
      variants={riseItem}
      className="relative mt-5 h-[150px] overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(140deg,rgba(255,255,255,0.72),rgba(239,246,255,0.82),rgba(236,253,245,0.58))] shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(140deg,rgba(15,23,42,0.74),rgba(30,41,59,0.62),rgba(15,118,110,0.16))]"
    >
      <div className="absolute inset-0 opacity-55">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(120deg, transparent 0 34%, rgba(37,99,235,0.08) 34% 35%, transparent 35% 67%, rgba(20,184,166,0.07) 67% 68%, transparent 68%)",
            backgroundSize: "58px 58px",
          }}
        />
      </div>

      <motion.div
        className="absolute left-4 top-4 h-[112px] w-[116px] rounded-[26px] border border-white/70 bg-white/86 p-3 shadow-[0_18px_42px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-white/[0.08]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#dbeafe,#ccfbf1)] text-[color:var(--uf-blue)] dark:bg-white/10">
          <Search size={25} strokeWidth={2.5} />
        </div>
        <div className="mt-3 h-2 w-16 rounded-full bg-slate-900/12 dark:bg-white/16" />
        <div className="mt-2 h-2 w-10 rounded-full bg-slate-900/8 dark:bg-white/10" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-[13px] bg-[color:var(--uf-blue)] text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
          <Sparkles size={15} />
        </div>
      </motion.div>

      <motion.div
        className="absolute left-[106px] top-[22px] h-[96px] w-[130px] rounded-[24px] border border-white/60 bg-slate-950/88 p-3 text-white shadow-[0_22px_52px_rgba(15,23,42,0.2)] dark:border-white/10"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black">AI 97%</span>
          <ShieldCheck size={15} className="text-emerald-300" />
        </div>
        <div className="space-y-2">
          <motion.div
            className="h-1.5 rounded-full bg-[linear-gradient(90deg,#60a5fa,#5eead4)]"
            animate={{ width: ["42%", "82%", "58%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="h-1.5 w-20 rounded-full bg-white/18" />
          <div className="h-1.5 w-14 rounded-full bg-white/12" />
        </div>
        <motion.div
          className="absolute inset-x-3 top-[52px] h-px bg-cyan-200/70"
          animate={{ y: [-18, 22, -18], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="absolute right-4 bottom-4 w-[118px] rounded-[24px] border border-white/70 bg-white/84 p-3 shadow-[0_18px_42px_rgba(20,184,166,0.13)] dark:border-white/10 dark:bg-white/[0.08]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[12px] bg-[color:var(--uf-green)]/12 text-[color:var(--uf-green)]">
            <MessageCircle size={15} />
          </div>
          <div className="h-2 w-12 rounded-full bg-slate-900/12 dark:bg-white/16" />
        </div>
        <div className="ml-2 h-2 w-20 rounded-full bg-[color:var(--uf-green)]/22" />
        <div className="ml-auto mt-2 h-2 w-14 rounded-full bg-[color:var(--uf-blue)]/18" />
      </motion.div>
    </motion.div>
  );
}

function TrustStrip() {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 gap-2">
      {featureTiles.map(({ Icon, label, value, accent }) => (
        <motion.div
          key={label}
          variants={riseItem}
          className="rounded-[18px] border border-white/60 bg-white/72 p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07]"
        >
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: `${accent}18`, color: accent }}>
            <Icon size={15} strokeWidth={2.4} />
          </div>
          <p className="text-[11px] font-bold text-[color:var(--muted-foreground)]">{label}</p>
          <p className="mt-0.5 text-sm font-black text-[color:var(--foreground)]">{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AuthPassPreview() {
  return (
    <motion.div
      variants={riseItem}
      className="mb-4 overflow-hidden rounded-[22px] border border-white/60 bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(255,255,255,0.66),rgba(20,184,166,0.08))] p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(15,23,42,0.56),rgba(20,184,166,0.1))]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border border-white/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
            <img src={UNIFIND_LOGO} alt="UniFind" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[color:var(--uf-blue)]">UNIFIND PASS</p>
            <p className="mt-0.5 text-sm font-black text-[color:var(--foreground)]">학교 인증 준비됨</p>
          </div>
        </div>
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-white/82 text-[color:var(--uf-blue)] shadow-sm dark:bg-white/10"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldCheck size={18} />
        </motion.div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "AI 분류", Icon: Sparkles },
          { label: "익명 채팅", Icon: MessageCircle },
          { label: "포인트", Icon: CheckCircle2 },
        ].map(({ label, Icon }) => (
          <div key={label} className="flex h-9 items-center justify-center gap-1.5 rounded-[15px] bg-white/64 text-[11px] font-black text-[color:var(--muted-foreground)] dark:bg-white/[0.08]">
            <Icon size={13} className="text-[color:var(--uf-blue)]" />
            {label}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--uf-blue),var(--uf-green))]"
          animate={{ width: ["38%", "76%", "52%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

function StepProgress({ step }: { step: AuthStep }) {
  if (step === "landing" || step === "login") return null;

  const activeIndex = Math.max(0, SIGNUP_STEPS.indexOf(step));

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-[color:var(--muted-foreground)]">
        <span>가입 진행</span>
        <span>{activeIndex + 1} / {SIGNUP_STEPS.length}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--muted)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--uf-blue), var(--uf-green))" }}
          initial={false}
          animate={{ width: `${((activeIndex + 1) / SIGNUP_STEPS.length) * 100}%` }}
          transition={motionTransition.normal}
        />
      </div>
    </div>
  );
}

function FieldInput({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  right,
  autoComplete,
}: {
  icon: IconType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  right?: ReactNode;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <motion.div
        animate={error ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.26, ease: motionEase.out }}
        className={`group flex h-[52px] items-center gap-3 rounded-[18px] border px-4 transition-all ${
          error
            ? "border-red-400/70 bg-red-50/80 dark:bg-red-950/20"
            : focused
              ? "border-[color:var(--uf-blue)] bg-[color:var(--card)] shadow-[0_0_0_4px_var(--uf-focus-ring)]"
              : "border-[color:var(--border)] bg-[color:var(--card)]/74"
        }`}
      >
        <motion.div animate={{ scale: focused ? 1.08 : 1, color: focused ? "var(--uf-blue)" : "var(--muted-foreground)" }}>
          <Icon size={19} strokeWidth={2.2} />
        </motion.div>
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)]/70"
        />
        {right}
      </motion.div>
      <AnimatePresence initial={false}>
        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={motionTransition.fast}
            className={`px-1 pt-2 text-xs font-bold ${error ? "text-red-500" : "text-[color:var(--muted-foreground)]"}`}
          >
            {error || hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={visible ? "eye-off" : "eye"}
          initial={{ opacity: 0, rotate: -8, scale: 0.86 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 8, scale: 0.86 }}
          transition={motionTransition.fast}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const percent = password.length ? Math.max(24, score * 25) : 0;
  const label = score <= 1 ? "약함" : score <= 3 ? "보통" : "강함";

  return (
    <div className="space-y-2 px-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--muted)]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              score <= 1
                ? "linear-gradient(90deg, var(--destructive), var(--uf-orange))"
                : score <= 3
                  ? "linear-gradient(90deg, var(--uf-amber), var(--uf-blue))"
                  : "linear-gradient(90deg, var(--uf-green), var(--uf-blue))",
          }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={motionTransition.normal}
        />
      </div>
      <p className="text-xs font-bold text-[color:var(--muted-foreground)]">비밀번호 강도: {password ? label : "입력 전"}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "quiet";
}) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <motion.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.975 }}
      className={`relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[18px] text-[15px] font-black transition ${
        isDisabled ? "cursor-not-allowed opacity-55 saturate-75" : "cursor-pointer"
      } ${
        variant === "primary"
          ? "bg-[linear-gradient(135deg,var(--uf-blue),var(--primary))] text-white shadow-[var(--uf-shadow-floating)]"
          : "border border-[color:var(--border)] bg-[color:var(--card)]/72 text-[color:var(--foreground)] shadow-sm backdrop-blur-xl"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={loading ? "loading" : "label"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={motionTransition.fast}
          className="flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" color={variant === "primary" ? "white" : "var(--uf-blue)"} /> : children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function LandingScreen({
  onLogin,
  onSignup,
  onPreview,
}: {
  onLogin: () => void;
  onSignup: () => void;
  onPreview: () => void;
}) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-1 flex-col">
      <BrandLockup />
      <FinderHeroVisual />
      <div className="mt-5">
        <TrustStrip />
      </div>
      <div className="min-h-4 flex-1" />
      <PremiumPanel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[color:var(--foreground)]">학교 계정으로 안전하게 시작</p>
            <p className="mt-1 text-xs font-bold leading-5 text-[color:var(--muted-foreground)]">
              인증된 학생끼리 분실물을 확인하고 연락해요.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[19px] bg-[color:var(--uf-blue)]/10 text-[color:var(--uf-blue)]">
            <ShieldCheck size={23} strokeWidth={2.4} />
          </div>
        </div>
        <AuthPassPreview />
        <div className="space-y-3">
          <ActionButton onClick={onLogin}>
            로그인
            <ChevronRight size={18} />
          </ActionButton>
          <ActionButton onClick={onSignup} variant="quiet">
            회원가입
          </ActionButton>
        </div>
        <button
          type="button"
          onClick={onPreview}
          className="mt-3 h-11 w-full rounded-2xl text-sm font-black text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] active:scale-[0.98]"
        >
          인증 전 홈 둘러보기
        </button>
      </PremiumPanel>
    </motion.div>
  );
}

function AuthFormScreen({
  mode,
  email,
  password,
  name,
  showPassword,
  errors,
  isLoading,
  onEmail,
  onPassword,
  onName,
  onTogglePassword,
  onSubmit,
  onSwitch,
}: {
  mode: "login" | "signup";
  email: string;
  password: string;
  name: string;
  showPassword: boolean;
  errors: Partial<Record<FieldName, string>>;
  isLoading: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onName: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onSwitch: () => void;
}) {
  const isSignup = mode === "signup";
  const emailHint = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "학교 이메일 형식을 확인해주세요." : undefined;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-1 flex-col">
      <StepProgress step={mode} />
      <motion.div variants={riseItem} className="mb-4">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[color:var(--uf-blue)]">
          {isSignup ? "NEW ACCOUNT" : "WELCOME BACK"}
        </p>
        <h2 className="mt-2 whitespace-pre-line text-[1.78rem] font-black leading-[1.16] tracking-[0] text-[color:var(--foreground)]">
          {isSignup ? "학교 인증을 위한\n기본 정보를 입력해주세요." : "다시 만나서 반가워요."}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
          {isSignup ? "가입 후 학교 이메일 인증으로 UniFind를 이용할 수 있어요." : "등록된 학교 이메일로 로그인해 주세요."}
        </p>
      </motion.div>

      <PremiumPanel>
        <div className="space-y-3">
          {isSignup && (
            <FieldInput
              icon={User}
              placeholder="이름"
              value={name}
              onChange={onName}
              error={errors.name}
              autoComplete="name"
            />
          )}
          <FieldInput
            icon={Mail}
            type="email"
            placeholder="학교 이메일"
            value={email}
            onChange={onEmail}
            error={errors.email}
            hint={emailHint}
            autoComplete="email"
          />
          <FieldInput
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={onPassword}
            error={errors.password}
            autoComplete={isSignup ? "new-password" : "current-password"}
            right={<PasswordToggle visible={showPassword} onClick={onTogglePassword} />}
          />
          {isSignup && <PasswordStrength password={password} />}
        </div>

        <div className="mt-4 space-y-2.5">
          <ActionButton onClick={onSubmit} disabled={isLoading} loading={isLoading}>
            {isSignup ? "학교 인증으로 계속" : "로그인"}
          </ActionButton>
          <button
            type="button"
            onClick={onSwitch}
            className="h-11 w-full rounded-2xl text-sm font-black text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] active:scale-[0.98]"
          >
            {isSignup ? "이미 계정이 있어요" : "처음이라면 회원가입"}
          </button>
        </div>
      </PremiumPanel>
    </motion.div>
  );
}

function VerifySchoolScreen({
  selectedUniv,
  onOpenSheet,
  onSubmit,
}: {
  selectedUniv: string;
  onOpenSheet: () => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-1 flex-col">
      <StepProgress step="verify-school" />
      <motion.div variants={riseItem} className="mb-4">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[color:var(--uf-blue)]">SCHOOL VERIFY</p>
        <h2 className="mt-2 text-[1.78rem] font-black leading-[1.16] tracking-[0] text-[color:var(--foreground)]">
          학교를 선택하면
          <br />
          인증 범위가 정해져요.
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
          학교별 게시글, 채팅, 분실물 센터 데이터를 분리해서 더 안전하게 보여줍니다.
        </p>
      </motion.div>

      <PremiumPanel>
        <button
          type="button"
          onClick={onOpenSheet}
          className="flex w-full items-center justify-between rounded-[20px] border border-[color:var(--border)] bg-[color:var(--muted)]/58 p-3.5 text-left transition hover:bg-[color:var(--muted)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <SchoolEmblem name={selectedUniv} size="md" />
            <div>
              <p className="text-xs font-bold text-[color:var(--muted-foreground)]">선택한 학교</p>
              <p className="mt-0.5 text-base font-black text-[color:var(--foreground)]">{selectedUniv}</p>
            </div>
          </div>
          <ChevronDown size={20} className="text-[color:var(--muted-foreground)]" />
        </button>

        <div className="mt-3 rounded-[20px] bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(20,184,166,0.08))] p-3.5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/76 text-[color:var(--uf-blue)] shadow-sm dark:bg-white/10">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-[color:var(--foreground)]">학교 이메일 인증을 이어서 진행해요</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[color:var(--muted-foreground)]">
                인증된 학생만 채팅할 수 있도록 첫 가입 때 한 번 확인합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ActionButton onClick={onSubmit}>
            인증 코드 받기
            <ChevronRight size={18} />
          </ActionButton>
        </div>
      </PremiumPanel>
    </motion.div>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const focusIndex = (index: number) => {
    refs.current[Math.max(0, Math.min(5, index))]?.focus();
  };

  const updateDigit = (index: number, rawValue: string) => {
    const number = rawValue.replace(/\D/g, "");
    if (!number) {
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const next = digits.slice();
    number.slice(0, 6 - index).split("").forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    onChange(next.join("").slice(0, 6));
    focusIndex(Math.min(5, index + number.length));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) focusIndex(index - 1);
    if (event.key === "ArrowRight" && index < 5) focusIndex(index + 1);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, index) => (
        <motion.input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          aria-label={`인증코드 ${index + 1}번째 자리`}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault();
            updateDigit(index, event.clipboardData.getData("text"));
          }}
          whileFocus={{ scale: 1.05 }}
          className="h-[50px] rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] text-center text-xl font-black text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--uf-blue)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
        />
      ))}
    </div>
  );
}

function VerifyEmailScreen({
  email,
  code,
  isLoading,
  onCode,
  onSubmit,
}: {
  email: string;
  code: string;
  isLoading: boolean;
  onCode: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-1 flex-col">
      <StepProgress step="verify-email" />
      <motion.div variants={riseItem} className="mb-4">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[color:var(--uf-blue)]">EMAIL CODE</p>
        <h2 className="mt-2 text-[1.78rem] font-black leading-[1.16] tracking-[0] text-[color:var(--foreground)]">
          인증번호 6자리를
          <br />
          입력해주세요.
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
          {email || "학교 이메일"}로 보낸 코드를 확인해 주세요.
        </p>
      </motion.div>

      <PremiumPanel>
        <OtpBoxes value={code} onChange={onCode} />
        <div className="mt-3 flex items-start gap-3 rounded-[20px] bg-[color:var(--muted)]/58 p-3.5">
          <Mail size={18} className="mt-0.5 shrink-0 text-[color:var(--uf-blue)]" />
          <p className="text-xs font-bold leading-5 text-[color:var(--muted-foreground)]">
            메일이 보이지 않으면 스팸함을 확인해 주세요. 데모에서는 6자리를 입력하면 다음 단계로 이동합니다.
          </p>
        </div>
        <div className="mt-4">
          <ActionButton onClick={onSubmit} disabled={code.length !== 6 || isLoading} loading={isLoading}>
            인증 완료
          </ActionButton>
        </div>
      </PremiumPanel>
    </motion.div>
  );
}

function CompleteScreen({ name, university, onStart }: { name: string; university: string; onStart: () => void }) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-1 flex-col">
      <StepProgress step="complete" />
      <div className="flex flex-1 items-center">
        <PremiumPanel className="w-full text-center">
          <motion.div
            initial={{ scale: 0.64, rotate: -18, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.42, ease: motionEase.emphasized }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,var(--uf-blue),var(--uf-green))] text-white shadow-[0_24px_50px_rgba(37,99,235,0.26)]"
          >
            <CheckCircle2 size={42} strokeWidth={2.4} />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-x-7 top-8 flex justify-between text-[color:var(--uf-amber)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, ...motionTransition.normal }}
          >
            <PartyPopper size={20} />
            <Sparkles size={18} />
            <PartyPopper size={20} />
          </motion.div>
          <h2 className="mt-6 text-[1.85rem] font-black leading-tight text-[color:var(--foreground)]">
            {name || "사용자"}님,
            <br />
            인증이 완료됐어요.
          </h2>
          <p className="mx-auto mt-3 max-w-[17rem] text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
            {university} 캠퍼스에서 분실물 등록과 익명 채팅을 바로 시작할 수 있어요.
          </p>
          <div className="mt-6">
            <ActionButton onClick={onStart}>
              UniFind 시작하기
              <ChevronRight size={18} />
            </ActionButton>
          </div>
        </PremiumPanel>
      </div>
    </motion.div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[color:var(--uf-blue)]/15 px-0.5 text-[color:var(--uf-blue)]">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

function UniversitySheet({
  open,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => UNIVERSITIES.filter((university) => university.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="학교 선택 닫기"
            className="absolute inset-0 z-40 bg-slate-950/36 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-[32px] border border-white/50 bg-[color:var(--card)] p-5 shadow-[0_-28px_80px_rgba(15,23,42,0.22)] dark:border-white/10"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={motionTransition.normal}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--border)]" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] text-[color:var(--uf-blue)]">UNIVERSITY</p>
                <h3 className="mt-1 text-xl font-black text-[color:var(--foreground)]">학교 선택</h3>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--muted)] text-[color:var(--muted-foreground)] transition active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-3 flex h-12 items-center gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--muted)]/54 px-4">
              <Search size={18} className="text-[color:var(--muted-foreground)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="학교 이름 검색"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[color:var(--muted-foreground)]/70"
              />
            </div>
            <motion.div variants={stagger} initial="initial" animate="animate" className="max-h-[43vh] space-y-2 overflow-y-auto pb-2">
              {filtered.map((university) => {
                const isSelected = university === selected;
                return (
                  <motion.button
                    key={university}
                    type="button"
                    variants={riseItem}
                    onClick={() => onSelect(university)}
                    className={`flex w-full items-center justify-between rounded-[22px] p-3 text-left transition active:scale-[0.99] ${
                      isSelected ? "bg-[color:var(--uf-blue)]/10" : "hover:bg-[color:var(--muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SchoolEmblem name={university} size="sm" />
                      <span className="text-sm font-black text-[color:var(--foreground)]">
                        <HighlightedText text={university} query={query} />
                      </span>
                    </div>
                    {isSelected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--uf-blue)] text-white">
                        <Check size={16} strokeWidth={2.8} />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AuthScreenToss() {
  const { setIsAuthenticated, setScreen, setUserName, setUserUniversity, isDarkMode } = useApp();
  const [step, setStep] = useState<AuthStep>("landing");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedUniv, setSelectedUniv] = useState("한국대학교");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showUnivList, setShowUnivList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const loadingGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateStep = (nextStep: AuthStep, nextDirection = 1) => {
    setDirection(nextDirection);
    setErrors({});
    setStep(nextStep);
  };

  const clearLoadingGuard = () => {
    if (loadingGuardRef.current) {
      clearTimeout(loadingGuardRef.current);
      loadingGuardRef.current = null;
    }
  };

  const startLoadingGuard = () => {
    clearLoadingGuard();
    loadingGuardRef.current = setTimeout(() => {
      setIsLoading(false);
      toast.error("응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.");
      loadingGuardRef.current = null;
    }, 6500);
  };

  useEffect(() => clearLoadingGuard, []);

  const validateFields = (mode: "login" | "signup") => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    if (mode === "signup" && !name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!email.trim()) nextErrors.email = "학교 이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "이메일 형식이 올바르지 않아요.";
    if (!password) nextErrors.password = "비밀번호를 입력해주세요.";
    else if (mode === "signup" && password.length < 8) nextErrors.password = "비밀번호는 8자 이상을 추천해요.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateFields("login")) return;
    setIsLoading(true);
    startLoadingGuard();

    setTimeout(() => {
      clearLoadingGuard();
      setIsLoading(false);
      setIsAuthenticated(true);
      setUserName(name.trim() || "김민준");
      setUserUniversity(selectedUniv);
      setScreen("home");
    }, 900);
  };

  const handleSignup = () => {
    if (!validateFields("signup")) return;
    navigateStep("verify-school", 1);
  };

  const handleVerifySchool = () => {
    setIsLoading(true);
    startLoadingGuard();

    setTimeout(() => {
      clearLoadingGuard();
      setIsLoading(false);
      toast.success(`${selectedUniv} 이메일로 인증번호를 보냈어요.`);
      navigateStep("verify-email", 1);
    }, 650);
  };

  const handleVerifyEmail = () => {
    if (verificationCode.length !== 6) return;
    setIsLoading(true);
    startLoadingGuard();

    setTimeout(() => {
      clearLoadingGuard();
      setIsLoading(false);
      navigateStep("complete", 1);
    }, 720);
  };

  const handleComplete = () => {
    setIsAuthenticated(true);
    setUserName(name.trim() || "새 학생");
    setUserUniversity(selectedUniv);
    setScreen("home");
  };

  const goBack = () => {
    if (step === "login" || step === "signup") navigateStep("landing", -1);
    if (step === "verify-school") navigateStep("signup", -1);
    if (step === "verify-email") navigateStep("verify-school", -1);
    if (step === "complete") navigateStep("verify-email", -1);
  };

  return (
    <AuthShell isDarkMode={isDarkMode}>
      <HeaderBack canGoBack={step !== "landing"} onBack={goBack} onHelp={() => setShowHelp(true)} />
      <main className="relative flex flex-1 flex-col pt-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={screenMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex min-h-0 flex-1 flex-col"
          >
            {step === "landing" && (
              <LandingScreen
                onLogin={() => navigateStep("login", 1)}
                onSignup={() => navigateStep("signup", 1)}
                onPreview={() => setScreen("home")}
              />
            )}
            {step === "login" && (
              <AuthFormScreen
                mode="login"
                email={email}
                password={password}
                name={name}
                showPassword={showPassword}
                errors={errors}
                isLoading={isLoading}
                onEmail={setEmail}
                onPassword={setPassword}
                onName={setName}
                onTogglePassword={() => setShowPassword((value) => !value)}
                onSubmit={handleLogin}
                onSwitch={() => navigateStep("signup", 1)}
              />
            )}
            {step === "signup" && (
              <AuthFormScreen
                mode="signup"
                email={email}
                password={password}
                name={name}
                showPassword={showPassword}
                errors={errors}
                isLoading={isLoading}
                onEmail={setEmail}
                onPassword={setPassword}
                onName={setName}
                onTogglePassword={() => setShowPassword((value) => !value)}
                onSubmit={handleSignup}
                onSwitch={() => navigateStep("login", -1)}
              />
            )}
            {step === "verify-school" && (
              <VerifySchoolScreen
                selectedUniv={selectedUniv}
                onOpenSheet={() => setShowUnivList(true)}
                onSubmit={handleVerifySchool}
              />
            )}
            {step === "verify-email" && (
              <VerifyEmailScreen
                email={email}
                code={verificationCode}
                isLoading={isLoading}
                onCode={setVerificationCode}
                onSubmit={handleVerifyEmail}
              />
            )}
            {step === "complete" && <CompleteScreen name={name} university={selectedUniv} onStart={handleComplete} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <UniversitySheet
        open={showUnivList}
        selected={selectedUniv}
        onClose={() => setShowUnivList(false)}
        onSelect={(university) => {
          setSelectedUniv(university);
          setShowUnivList(false);
        }}
      />

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="학교 인증 안내"
        subtitle="인증된 학생끼리만 안전하게 연결돼요."
        actions={[
          {
            label: "확인",
            onClick: () => setShowHelp(false),
            variant: "primary",
          },
        ]}
      >
        <p className="text-sm font-medium leading-6 text-[color:var(--muted-foreground)]">
          UniFind는 캠퍼스 구성원끼리만 분실물 채팅을 할 수 있도록 학교 이메일 인증을 먼저 확인합니다.
        </p>
      </Modal>
    </AuthShell>
  );
}
