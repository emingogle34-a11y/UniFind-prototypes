// Toss 스타일 팝업 시스템
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CheckCircle, AlertCircle, Info } from "lucide-react";

const POPUP_HIDE_DURATION_MS = 24 * 60 * 60 * 1000;
const POPUP_STORAGE_PREFIX = "unifind-popup-dismissed-at";

function getPopupStorageKey(popupId: string) {
  return `${POPUP_STORAGE_PREFIX}:${popupId}`;
}

function isPopupHiddenToday(popupId?: string) {
  if (!popupId || typeof window === "undefined") return false;

  const key = getPopupStorageKey(popupId);
  const savedAt = Number(localStorage.getItem(key));

  if (!Number.isFinite(savedAt)) {
    localStorage.removeItem(key);
    return false;
  }

  const shouldHide = Date.now() - savedAt < POPUP_HIDE_DURATION_MS;
  if (!shouldHide) localStorage.removeItem(key);

  return shouldHide;
}

function rememberPopupDismissal(popupId?: string) {
  if (!popupId || typeof window === "undefined") return;
  localStorage.setItem(getPopupStorageKey(popupId), Date.now().toString());
}

// ============ BottomSheet ============
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, height = "auto" }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "var(--uf-overlay)" }}
          />

          {/* BottomSheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl"
            style={{
              background: "var(--card)",
              color: "var(--card-foreground)",
              maxHeight: height,
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full" style={{ background: "var(--muted)" }} />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-lg font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: "var(--muted)" }}
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 100px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============ Modal ============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  illustration?: ReactNode;
  popupId?: string;
  showDoNotShowToday?: boolean;
  doNotShowTodayLabel?: string;
  actions?: { label: string; onClick: () => void; variant?: "primary" | "secondary" }[];
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  illustration,
  popupId,
  showDoNotShowToday = false,
  doNotShowTodayLabel = "오늘 하루 보지 않기",
  actions,
}: ModalProps) {
  const [doNotShowToday, setDoNotShowToday] = useState(false);
  const [isHiddenToday, setIsHiddenToday] = useState(() =>
    showDoNotShowToday ? isPopupHiddenToday(popupId) : false
  );

  useEffect(() => {
    if (!isOpen) return;
    setDoNotShowToday(false);
    setIsHiddenToday(showDoNotShowToday ? isPopupHiddenToday(popupId) : false);
  }, [isOpen, popupId, showDoNotShowToday]);

  const closeWithPreference = () => {
    if (showDoNotShowToday && doNotShowToday) {
      rememberPopupDismissal(popupId);
    }
    onClose();
  };

  const handleActionClick = (action: { label: string; onClick: () => void; variant?: "primary" | "secondary" }) => {
    if (showDoNotShowToday && doNotShowToday) {
      rememberPopupDismissal(popupId);
    }
    action.onClick();
  };

  return (
    <AnimatePresence>
      {isOpen && !isHiddenToday && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWithPreference}
            className="fixed inset-0 z-40 backdrop-blur-[2px]"
            style={{ background: "var(--uf-overlay)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[32px] border border-border/70 p-5 shadow-[var(--uf-shadow-floating)]"
            style={{
              background: "var(--uf-card-gradient)",
              color: "var(--foreground)",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeWithPreference}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              aria-label="팝업 닫기"
            >
              <X size={18} />
            </button>

            {illustration && <div className="mb-5 pr-9">{illustration}</div>}

            {/* Title */}
            {subtitle && (
              <p className="mb-2 text-sm font-bold" style={{ color: "var(--uf-blue)" }}>
                {subtitle}
              </p>
            )}
            <h2 className="mb-3 pr-8 text-2xl font-extrabold leading-tight">{title}</h2>

            {/* Content */}
            <div className="mb-5 text-sm leading-6" style={{ color: "var(--uf-ink-soft)" }}>
              {children}
            </div>

            {showDoNotShowToday && (
              <label
                className="mb-4 flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-colors"
                style={{ background: "var(--uf-blue-light)", color: "var(--uf-ink-soft)" }}
              >
                <input
                  type="checkbox"
                  checked={doNotShowToday}
                  onChange={(event) => setDoNotShowToday(event.target.checked)}
                  className="sr-only"
                />
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all"
                  style={{
                    background: doNotShowToday ? "var(--uf-blue)" : "var(--card)",
                    borderColor: doNotShowToday ? "var(--uf-blue)" : "var(--border)",
                    color: "white",
                  }}
                >
                  {doNotShowToday && <Check size={15} strokeWidth={3} />}
                </span>
                <span className="text-sm font-semibold">{doNotShowTodayLabel}</span>
              </label>
            )}

            {/* Actions */}
            {actions && (
              <div className="flex flex-col gap-2">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action)}
                    className="w-full rounded-2xl py-4 text-base font-bold transition-all active:scale-95"
                    style={{
                      background: action.variant === "secondary" ? "var(--muted)" : "var(--uf-premium-gradient)",
                      color: action.variant === "secondary" ? "var(--foreground)" : "white",
                      boxShadow: action.variant === "secondary" ? "none" : "var(--uf-shadow-floating)",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============ Toast ============
interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

const toastVariants = {
  success: { icon: CheckCircle, color: "var(--uf-green)", bg: "var(--uf-success-soft)" },
  error: { icon: AlertCircle, color: "var(--destructive)", bg: "var(--uf-danger-soft)" },
  info: { icon: Info, color: "var(--uf-blue)", bg: "var(--uf-blue-light)" },
};

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const variant = toastVariants[type];
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg"
      style={{ background: variant.bg, color: variant.color }}
      onAnimationComplete={() => {
        if (duration > 0 && onClose) {
          setTimeout(() => onClose(), duration);
        }
      }}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
}

// ============ Toast Container ============
export function ToastContainer() {
  // This will be managed by a global toast context in production
  return null;
}
