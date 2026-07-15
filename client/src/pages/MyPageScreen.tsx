import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NicknameInput, type NicknameAvailability } from "@/components/NicknameInput";
import { trpc } from "@/lib/trpc";
import { Award, ChevronRight, GraduationCap, LogOut, Moon, Pencil, Star, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MyPageScreen() {
  const {
    setScreen,
    setIsAuthenticated,
    userName,
    userNickname,
    setUserNickname,
    userRealName,
    userUniversity,
    userPoints,
    hasServerUser,
    isDarkMode,
    setIsDarkMode,
  } = useApp();

  const utils = trpc.useUtils();
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(userNickname ?? "");
  const [nicknameState, setNicknameState] = useState<NicknameAvailability>({
    nickname: userNickname ?? "",
    available: Boolean(userNickname),
    checking: false,
    message: "",
  });

  const displayNickname = userNickname ?? "닉네임을 설정해주세요";
  const profileInitial = (userNickname ?? userRealName ?? userName ?? "U").slice(0, 1);
  const isNicknameUnchanged = nicknameState.nickname === (userNickname ?? "");
  const canSaveNickname =
    nicknameState.available &&
    !nicknameState.checking &&
    !isNicknameUnchanged &&
    nicknameState.nickname.length > 0;

  const updateNicknameMutation = trpc.auth.updateNickname.useMutation({
    onSuccess: async (result) => {
      setUserNickname(result.nickname);
      await utils.auth.me.invalidate();
      setNicknameDialogOpen(false);
      toast.success("닉네임이 저장됐어요.");
    },
    onError: (error) => {
      toast.error(error.message || "닉네임 저장에 실패했어요.");
    },
  });

  const stats = [
    { label: "등록", value: "12", icon: "📝" },
    { label: "찾아줌", value: "3", icon: "🤝" },
    { label: "포인트", value: `${userPoints.toLocaleString()}P`, icon: "⭐" },
  ];

  const menuGroups = [
    {
      title: "내 활동",
      items: [
        { icon: "📌", label: "내 게시글", action: () => setScreen("search") },
        { icon: "💬", label: "채팅 내역", action: () => setScreen("chat-list") },
        { icon: "⭐", label: "포인트 내역", action: () => setScreen("points") },
        { icon: "🛡️", label: "신뢰도", action: () => setScreen("trust") },
        { icon: "🏢", label: "분실물 센터", action: () => setScreen("center") },
        { icon: "📊", label: "분실 통계", action: () => setScreen("statistics") },
      ],
    },
    {
      title: "설정",
      items: [
        { icon: "🔔", label: "알림 설정", action: () => setScreen("notifications-setting") },
        { icon: "🔒", label: "개인정보 보호", action: () => toast.info("준비 중인 기능이에요.") },
        { icon: "❓", label: "문의하기", action: () => toast.info("준비 중인 기능이에요.") },
      ],
    },
  ];

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    toast.success(newMode ? "다크 모드가 켜졌어요." : "라이트 모드가 켜졌어요.");
  };

  const openNicknameDialog = () => {
    const initialNickname = userNickname ?? "";
    setNicknameDraft(initialNickname);
    setNicknameState({
      nickname: initialNickname,
      available: Boolean(initialNickname),
      checking: false,
      message: "",
    });
    setNicknameDialogOpen(true);
  };

  const handleNicknameSave = () => {
    if (!canSaveNickname) return;

    if (!hasServerUser) {
      setUserNickname(nicknameState.nickname);
      setNicknameDialogOpen(false);
      toast.success("미리보기 닉네임이 적용됐어요.");
      return;
    }

    updateNicknameMutation.mutate({ nickname: nicknameState.nickname });
  };

  return (
    <div className="uf-screen flex h-full flex-col">
      <div className="uf-header sticky top-0 z-40 px-5 pb-4 pt-14 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground">마이페이지</h1>
          <button
            onClick={handleDarkModeToggle}
            className="uf-theme-toggle active:scale-95"
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            aria-pressed={isDarkMode}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            <span className="uf-theme-toggle-thumb">
              {isDarkMode ? <Moon size={15} /> : <Sun size={15} />}
            </span>
          </button>
        </div>
      </div>

      <div className="uf-page-enter flex-1 space-y-4 px-5 py-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="uf-card p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
              style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-soft)" }}
            >
              {profileInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-extrabold text-foreground">{displayNickname}</h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}
                >
                  인증됨
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <GraduationCap size={12} style={{ color: "var(--uf-blue)" }} />
                <span className="text-xs text-muted-foreground">{userUniversity}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {userNickname ? `실명: ${userRealName ?? "인증 정보 없음"}` : "채팅과 게시물에 표시될 닉네임을 설정해보세요."}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <Star size={11} style={{ color: "var(--uf-amber)" }} fill="currentColor" />
                <span className="text-xs font-semibold" style={{ color: "var(--uf-amber)" }}>
                  매너 온도 38.5도
                </span>
              </div>
            </div>
            <button
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}
              onClick={openNicknameDialog}
            >
              <Pencil size={13} />
              수정
            </button>
          </div>

          <div className="mt-4 flex gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2"
                style={{ background: "var(--muted)" }}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-sm font-extrabold text-foreground">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="uf-card p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Award size={16} style={{ color: "var(--uf-amber)" }} />
            <h3 className="text-sm font-extrabold text-foreground">획득한 뱃지</h3>
          </div>
          <div className="flex gap-3">
            {[
              { icon: "🎓", label: "학교 인증", color: "var(--uf-blue-light)" },
              { icon: "🤝", label: "첫 해결", color: "var(--uf-warning-soft)" },
              { icon: "🛡️", label: "신뢰 활동", color: "var(--uf-success-soft)" },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-colors"
                  style={{ background: badge.color }}
                >
                  {badge.icon}
                </div>
                <span className="text-center text-[10px] font-semibold text-muted-foreground">{badge.label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-colors"
                style={{ background: "var(--muted)", border: "2px dashed var(--border)" }}
              >
                <span style={{ color: "var(--muted-foreground)" }}>?</span>
              </div>
              <span className="text-center text-[10px] font-semibold text-muted-foreground">미획득</span>
            </div>
          </div>
        </motion.div>

        {menuGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + gi * 0.05 }}
          >
            <p className="mb-2 px-1 text-xs font-bold text-muted-foreground">{group.title}</p>
            <div className="uf-card divide-y" style={{ borderColor: "var(--border)" }}>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors"
                  style={{ color: "var(--foreground)" }}
                >
                  <span className="w-7 text-center text-lg">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight size={15} style={{ color: "var(--muted-foreground)" }} />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            setIsAuthenticated(false);
            setScreen("auth");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]"
          style={{ background: "var(--uf-danger-soft)", color: "var(--uf-orange)" }}
        >
          <LogOut size={16} />
          로그아웃
        </motion.button>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          UniFind v1.0.0 · 개인정보처리방침 · 이용약관
        </p>
      </div>

      <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>닉네임 수정</DialogTitle>
            <DialogDescription>
              한글, 영문, 숫자만 사용할 수 있어요. 저장하면 게시물과 익명 채팅에 바로 반영됩니다.
            </DialogDescription>
          </DialogHeader>

          <NicknameInput
            value={nicknameDraft}
            onChange={setNicknameDraft}
            currentNickname={userNickname}
            onAvailabilityChange={setNicknameState}
            placeholder="새 닉네임"
            autoFocus
          />

          <DialogFooter>
            <Button variant="secondary" onClick={() => setNicknameDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="premium"
              onClick={handleNicknameSave}
              disabled={!canSaveNickname || updateNicknameMutation.isPending}
            >
              {updateNicknameMutation.isPending ? "저장 중" : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
