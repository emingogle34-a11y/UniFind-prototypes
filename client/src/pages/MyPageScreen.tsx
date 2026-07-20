import { useEffect, useState } from "react";
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
import {
  Award,
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  FileText,
  GraduationCap,
  Handshake,
  LockKeyhole,
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  Pencil,
  ShieldCheck,
  Star,
  Sun,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const USE_API = import.meta.env.VITE_USE_API === "true";

export default function MyPageScreen() {
  const {
    setScreen,
    replaceScreen,
    goBack,
    setSearchScope,
    setIsAuthenticated,
    userName,
    userNickname,
    setUserNickname,
    userRealName,
    userUniversity,
    userPoints,
    hasServerUser,
    isGuest,
    isDarkMode,
    setIsDarkMode,
  } = useApp();

  const utils = trpc.useUtils();
  const myItemsQuery = trpc.items.mine.useQuery(undefined, {
    enabled: USE_API && hasServerUser,
    retry: false,
  });
  const myItems = myItemsQuery.data ?? [];
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(userNickname ?? "");
  const [nicknameState, setNicknameState] = useState<NicknameAvailability>({
    nickname: userNickname ?? "",
    available: Boolean(userNickname),
    checking: false,
    message: "",
  });
  const [nicknameViewport, setNicknameViewport] = useState({ bottom: 0, height: 0 });

  useEffect(() => {
    if (!nicknameDialogOpen || typeof window === "undefined") return;

    const updateViewport = () => {
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const bottom = Math.max(0, window.innerHeight - height - offsetTop);
      setNicknameViewport({ bottom, height });
    };

    updateViewport();
    window.visualViewport?.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [nicknameDialogOpen]);

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

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setIsAuthenticated(false);
      utils.auth.me.setData(undefined, null);
      replaceScreen("auth");
      toast.success("로그아웃됐어요.");
    },
    onError: (error) => {
      toast.error(error.message || "로그아웃에 실패했어요.");
    },
  });

  const stats = [
    { label: "등록", value: isGuest ? "0" : myItems.length.toString(), icon: FileText },
    { label: "찾아줌", value: isGuest ? "0" : myItems.filter((item) => item.type === "found" && item.status === "resolved").length.toString(), icon: Handshake },
    { label: "포인트", value: `${userPoints.toLocaleString()}P`, icon: WalletCards },
  ];

  const badges = [
    { icon: GraduationCap, label: "학교 인증", color: "var(--uf-blue)" },
    { icon: Handshake, label: "첫 해결", color: "var(--uf-amber)" },
    { icon: ShieldCheck, label: "신뢰 활동", color: "var(--uf-green)" },
  ];

  const menuGroups = [
    {
      title: "내 활동",
      items: [
        { icon: FileText, label: "내 게시글", action: () => { setSearchScope("mine"); setScreen("search"); } },
        { icon: MessageCircle, label: "채팅 내역", action: () => setScreen("chat-list") },
        { icon: WalletCards, label: "포인트 내역", action: () => setScreen("points") },
        { icon: ShieldCheck, label: "신뢰도", action: () => setScreen("trust") },
        { icon: Building2, label: "분실물 센터", action: () => setScreen("center") },
        { icon: BarChart3, label: "분실 통계", action: () => setScreen("statistics") },
      ],
    },
    {
      title: "설정",
      items: [
        { icon: Bell, label: "알림 설정", action: () => setScreen("notifications-setting") },
        { icon: LockKeyhole, label: "개인정보 보호", action: () => toast.info("준비 중인 기능이에요.") },
        { icon: CircleHelp, label: "문의하기", action: () => toast.info("준비 중인 기능이에요.") },
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
      toast.info("닉네임을 저장하려면 로그인해주세요.");
      setNicknameDialogOpen(false);
      replaceScreen("auth");
      return;
    }

    updateNicknameMutation.mutate({ nickname: nicknameState.nickname });
  };

  return (
    <div className="uf-screen flex h-full flex-col">
      <div className="uf-header sticky top-0 z-40 px-5 pb-4 pt-14 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goBack} className="-ml-2 rounded-full p-2 active:scale-95" aria-label="이전 화면으로 돌아가기">
              <ChevronRight size={21} className="rotate-180 text-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground">마이페이지</h1>
          </div>
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

      <div className="scrollbar-hide uf-page-enter flex-1 overflow-y-auto pb-24">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-5 pt-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ background: "var(--uf-premium-gradient)" }}
            >
              {isGuest ? "U" : profileInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-extrabold text-foreground">{isGuest ? "게스트" : displayNickname}</h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}
                >
                  {isGuest ? "미인증" : "인증됨"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <GraduationCap size={12} style={{ color: "var(--uf-blue)" }} />
                <span className="text-xs text-muted-foreground">{isGuest ? "학교 인증 전" : userUniversity}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isGuest ? "로그인하면 내 활동과 포인트를 저장할 수 있어요." : userNickname ? `실명: ${userRealName ?? "인증 정보 없음"}` : "채팅과 게시물에 표시될 닉네임을 설정해보세요."}
              </p>
              {!isGuest && <div className="mt-1 flex items-center gap-1">
                <Star size={11} style={{ color: "var(--uf-amber)" }} fill="currentColor" />
                <span className="text-xs font-semibold" style={{ color: "var(--uf-amber)" }}>
                  매너 온도 38.5도
                </span>
              </div>}
            </div>
            {!isGuest && <button
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
              onClick={openNicknameDialog}
              aria-label="닉네임 수정"
              title="닉네임 수정"
            >
              <Pencil size={18} strokeWidth={1.8} />
            </button>}
          </div>

          <div className="mt-5 grid grid-cols-3 border-t border-border py-4">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`flex min-h-[58px] min-w-0 items-center justify-center gap-2.5 px-2 ${index < stats.length - 1 ? "border-r border-border" : ""}`}
              >
                <Icon size={24} strokeWidth={1.75} className="flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-semibold leading-tight text-foreground">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-t border-border px-5 py-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Award size={18} strokeWidth={1.7} className="text-muted-foreground" />
            <h2 className="text-[15px] font-semibold text-foreground">획득한 뱃지</h2>
          </div>
          {isGuest ? (
            <button
              type="button"
              onClick={() => replaceScreen("auth")}
              className="flex w-full items-center justify-between rounded-2xl bg-muted px-4 py-3 text-left"
            >
              <span className="text-sm text-muted-foreground">로그인 후 활동 뱃지를 확인할 수 있어요</span>
              <LogIn size={18} className="text-[color:var(--uf-blue)]" />
            </button>
          ) : <div className="grid grid-cols-4 gap-2">
            {badges.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 py-1">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                  style={{ color }}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </div>
                <span className="text-center text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                <span className="text-sm">?</span>
              </div>
              <span className="text-center text-[11px] text-muted-foreground">미획득</span>
            </div>
          </div>}
        </motion.section>

        {menuGroups.map((group, gi) => (
          <motion.section
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + gi * 0.05 }}
            className="border-t border-border py-4"
          >
            <h2 className="mb-1 px-5 text-xs font-semibold text-muted-foreground">{group.title}</h2>
            <div>
              {group.items.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex min-h-12 w-full items-center gap-4 px-5 py-3 text-left text-foreground transition-colors hover:bg-muted/70 active:bg-muted"
                >
                  <Icon size={21} strokeWidth={1.65} className="flex-shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-[15px] font-normal">{label}</span>
                  <ChevronRight size={17} strokeWidth={1.6} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.section>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            if (isGuest) {
              replaceScreen("auth");
              return;
            }
            logoutMutation.mutate();
          }}
          disabled={logoutMutation.isPending}
          className={`flex min-h-12 w-full items-center gap-4 border-t border-border px-5 py-4 text-left text-sm font-normal transition-colors hover:bg-muted/70 active:bg-muted ${isGuest ? "text-[color:var(--uf-blue)]" : "text-destructive"}`}
        >
          {isGuest ? <LogIn size={21} strokeWidth={1.65} /> : <LogOut size={21} strokeWidth={1.65} />}
          {isGuest ? "로그인하기" : "로그아웃"}
        </motion.button>

        <p className="px-5 pb-4 pt-5 text-center text-[11px] text-muted-foreground">
          UniFind v1.0.0 · 개인정보처리방침 · 이용약관
        </p>
      </div>

      <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
        <DialogContent
          className="!top-auto !w-full !max-w-[390px] !translate-y-0 max-h-[calc(100dvh-12px)] overflow-y-auto overscroll-contain rounded-b-none rounded-t-[28px] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:!bottom-auto sm:!top-1/2 sm:!max-w-[360px] sm:!-translate-y-1/2 sm:rounded-[28px] sm:p-6"
          style={{
            bottom: `${nicknameViewport.bottom}px`,
            maxHeight: nicknameViewport.height ? `${Math.max(280, nicknameViewport.height - 12)}px` : undefined,
          }}
        >
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

          <DialogFooter className="sticky bottom-0 z-10 -mx-1 !grid grid-cols-2 gap-2 bg-card/95 pt-2 backdrop-blur-sm">
            <Button className="w-full" variant="secondary" onClick={() => setNicknameDialogOpen(false)}>
              취소
            </Button>
            <Button
              className="w-full"
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
