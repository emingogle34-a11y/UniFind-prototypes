import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { validateNickname } from "@shared/nickname";

const USE_API = import.meta.env.VITE_USE_API === "true";

type NicknameAvailability = {
  nickname: string;
  available: boolean;
  message: string;
  checking: boolean;
};

type NicknameInputProps = {
  value: string;
  onChange: (value: string) => void;
  onAvailabilityChange?: (state: NicknameAvailability) => void;
  currentNickname?: string | null;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export function NicknameInput({
  value,
  onChange,
  onAvailabilityChange,
  currentNickname,
  label = "닉네임",
  placeholder = "예: 유니파인더",
  autoFocus = false,
  className,
}: NicknameInputProps) {
  const [debouncedValue, setDebouncedValue] = useState(value.trim());
  const shouldCheckServer = USE_API;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value]);

  const localValidation = useMemo(() => validateNickname(value), [value]);
  const debouncedValidation = useMemo(() => validateNickname(debouncedValue), [debouncedValue]);
  const normalizedCurrent = currentNickname?.trim() || null;
  const isCurrentNickname =
    Boolean(normalizedCurrent) && localValidation.nickname === normalizedCurrent;
  const isWaitingForDebounce =
    localValidation.valid && value.trim() !== debouncedValue && !isCurrentNickname;

  const availabilityQuery = trpc.auth.checkNicknameAvailable.useQuery(
    { nickname: debouncedValidation.nickname },
    {
      enabled:
        shouldCheckServer &&
        debouncedValidation.valid &&
        debouncedValidation.nickname.length > 0 &&
        !isCurrentNickname,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    }
  );

  const state = useMemo<NicknameAvailability>(() => {
    if (!value.trim()) {
      return {
        nickname: "",
        available: false,
        checking: false,
        message: "2~10자, 한글/영문/숫자만 사용할 수 있어요.",
      };
    }

    if (!localValidation.valid) {
      return {
        nickname: localValidation.nickname,
        available: false,
        checking: false,
        message: localValidation.message,
      };
    }

    if (isCurrentNickname) {
      return {
        nickname: localValidation.nickname,
        available: true,
        checking: false,
        message: "현재 사용 중인 닉네임이에요.",
      };
    }

    if (!shouldCheckServer) {
      return {
        nickname: localValidation.nickname,
        available: true,
        checking: false,
        message: "형식이 맞아요. 실제 저장 시 서버에서 중복을 확인해요.",
      };
    }

    if (isWaitingForDebounce || availabilityQuery.isFetching) {
      return {
        nickname: localValidation.nickname,
        available: false,
        checking: true,
        message: "닉네임을 확인하고 있어요.",
      };
    }

    if (availabilityQuery.data) {
      return {
        nickname: availabilityQuery.data.nickname,
        available: availabilityQuery.data.available,
        checking: false,
        message: availabilityQuery.data.message,
      };
    }

    if (availabilityQuery.error) {
      return {
        nickname: localValidation.nickname,
        available: false,
        checking: false,
        message: "중복 확인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      nickname: localValidation.nickname,
      available: false,
      checking: true,
      message: "닉네임을 확인하고 있어요.",
    };
  }, [
    availabilityQuery.data,
    availabilityQuery.error,
    availabilityQuery.isFetching,
    isCurrentNickname,
    isWaitingForDebounce,
    localValidation,
    shouldCheckServer,
    value,
  ]);

  useEffect(() => {
    onAvailabilityChange?.(state);
  }, [onAvailabilityChange, state]);

  const statusIcon = state.checking ? (
    <Loader2 className="animate-spin text-muted-foreground" size={18} />
  ) : state.available ? (
    <CheckCircle2 size={18} style={{ color: "var(--uf-green)" }} />
  ) : value.trim() ? (
    <XCircle size={18} style={{ color: "var(--destructive)" }} />
  ) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-extrabold text-foreground">{label}</label>
      <div
        className="flex h-14 items-center gap-3 rounded-2xl border px-4 transition-all focus-within:ring-4"
        style={{
          background: "var(--card)",
          borderColor: state.available ? "rgba(22, 163, 74, 0.42)" : "var(--border)",
          boxShadow: "var(--uf-shadow-card)",
          outlineColor: "var(--uf-blue-light)",
        }}
      >
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          maxLength={10}
          className="min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          {statusIcon}
        </div>
      </div>
      <p
        className="text-xs font-semibold"
        style={{
          color: state.checking
            ? "var(--muted-foreground)"
            : state.available
              ? "var(--uf-green)"
              : value.trim()
                ? "var(--destructive)"
                : "var(--muted-foreground)",
        }}
      >
        {state.message}
      </p>
    </div>
  );
}

export type { NicknameAvailability };
