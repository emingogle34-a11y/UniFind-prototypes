// Toss 스타일 재사용 가능 컴포넌트
import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Backpack,
  Bluetooth,
  CreditCard,
  KeyRound,
  Loader2,
  Package,
  Shirt,
  Smartphone,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { ItemCategory } from "@/lib/data";

const CATEGORY_ICON_COMPONENTS: Record<ItemCategory, LucideIcon> = {
  "지갑/카드": CreditCard,
  "블루투스 기기": Bluetooth,
  "휴대폰/태블릿": Smartphone,
  "가방": Backpack,
  "의류": Shirt,
  "열쇠": KeyRound,
  "우산": Umbrella,
  "기타": Package,
};

interface CategoryIconProps {
  category: ItemCategory;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 20, strokeWidth = 2, className = "" }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_COMPONENTS[category] ?? Package;
  return <Icon aria-hidden="true" size={size} strokeWidth={strokeWidth} className={className} />;
}

// ============ TossButton ============
interface TossButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TossButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  style,
}: TossButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantStyles = {
    primary: {
      background: "var(--uf-premium-gradient)",
      color: "white",
      boxShadow: "var(--uf-shadow-floating)",
      border: "1px solid color-mix(in srgb, white 22%, transparent)",
    },
    secondary: {
      background: "var(--muted)",
      color: "var(--foreground)",
      border: "1px solid var(--border)",
    },
    ghost: { background: "transparent", color: "var(--foreground)" },
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`rounded-2xl font-bold transition-all ${disabled ? "cursor-not-allowed saturate-75" : "active:scale-95"} ${sizeClasses[size]} ${className}`}
      style={{
        ...variantStyles[variant],
        ...style,
        opacity: disabled ? 0.56 : 1,
        filter: disabled ? "grayscale(0.1)" : undefined,
      }}
    >
      {children}
    </motion.button>
  );
}

// ============ TossCard ============
interface TossCardProps {
  children: ReactNode;
  onClick?: () => void;
  gradient?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TossCard({ children, onClick, gradient = false, className = "", style }: TossCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-[22px] border border-border/70 p-5 shadow-[var(--uf-shadow-card)] transition-all hover:shadow-[var(--uf-shadow-soft)] ${className}`}
      style={{
        background: gradient
          ? "var(--uf-premium-gradient)"
          : "var(--uf-card-gradient)",
        color: gradient ? "white" : "var(--card-foreground)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============ School Emblem ============
interface SchoolEmblemProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getSchoolMark(name = "한국대학교") {
  const normalized = name.replace(/\s/g, "");

  if (normalized.includes("명지")) return "MJ";
  if (normalized.includes("한국")) return "HU";
  if (normalized.includes("서울")) return "SU";
  if (normalized.includes("연세")) return "YU";
  if (normalized.includes("고려")) return "KU";

  return normalized.replace(/대학교|대학|University/gi, "").slice(0, 2) || "UN";
}

export function SchoolEmblem({ name = "한국대학교", size = "md", className = "" }: SchoolEmblemProps) {
  const mark = getSchoolMark(name);
  const sizeClass = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }[size];

  return (
    <div className={`uf-school-emblem ${sizeClass} ${className}`} aria-label={`${name} 인증 엠블럼`} role="img">
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="school-emblem-bg" x1="12" x2="54" y1="8" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--card)" />
            <stop offset="48%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--uf-blue-light)" />
          </linearGradient>
          <linearGradient id="school-emblem-accent" x1="17" x2="48" y1="14" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--uf-blue)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <path
          d="M32 5 52 12v15c0 14.5-8 25-20 31C20 52 12 41.5 12 27V12L32 5Z"
          fill="url(#school-emblem-bg)"
          stroke="color-mix(in srgb, var(--uf-blue) 34%, transparent)"
          strokeWidth="2"
        />
        <path
          d="M32 13 44 17.5v10.2c0 8.8-4.7 15.5-12 19.7-7.3-4.2-12-10.9-12-19.7V17.5L32 13Z"
          fill="url(#school-emblem-accent)"
          opacity="0.96"
        />
        <path d="M23 26h18M26 22h12M26 38h12M32 22v18" stroke="white" strokeOpacity="0.46" strokeWidth="2" strokeLinecap="round" />
        <text
          x="32"
          y="34.5"
          textAnchor="middle"
          fontSize={mark.length > 2 ? "12" : "14"}
          fontWeight="900"
          fill="white"
          letterSpacing="0"
        >
          {mark}
        </text>
      </svg>
    </div>
  );
}

// ============ Badge ============
interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

const badgeVariants = {
  primary: { bg: "var(--uf-blue-light)", text: "var(--uf-blue)" },
  success: { bg: "rgba(22, 163, 74, 0.12)", text: "var(--uf-green)" },
  warning: { bg: "rgba(201, 137, 16, 0.14)", text: "var(--uf-amber)" },
  error: { bg: "rgba(229, 72, 77, 0.12)", text: "var(--destructive)" },
  info: { bg: "var(--uf-purple-soft)", text: "var(--uf-purple)" },
};

export function Badge({ children, variant = "primary", size = "md" }: BadgeProps) {
  const colors = badgeVariants[variant];
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span
      className={`rounded-full font-semibold inline-block ${sizeClass}`}
      style={{ background: colors.bg, color: colors.text }}
    >
      {children}
    </span>
  );
}

// ============ LoadingSpinner ============
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoadingSpinner({ size = "md", color = "var(--uf-blue)" }: LoadingSpinnerProps) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <Loader2 size={sizeMap[size]} style={{ color }} />
    </motion.div>
  );
}

// ============ EmptyState ============
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      {action && (
        <TossButton onClick={action.onClick} variant="primary">
          {action.label}
        </TossButton>
      )}
    </div>
  );
}

// ============ Stat Card ============
interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon?: ReactNode;
}

export function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <TossCard gradient={false} className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {change && (
            <span style={{ color: change.isPositive ? "var(--uf-green)" : "var(--destructive)" }} className="text-xs font-semibold">
              {change.isPositive ? "+" : "-"}{Math.abs(change.value)}%
            </span>
          )}
        </div>
      </div>
      {icon && <div className="text-3xl">{icon}</div>}
    </TossCard>
  );
}

// ============ Gradient Text ============
interface GradientTextProps {
  children: ReactNode;
  from?: string;
  to?: string;
}

export function GradientText({ children, from = "var(--uf-blue)", to = "var(--primary)" }: GradientTextProps) {
  return (
    <span
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}
