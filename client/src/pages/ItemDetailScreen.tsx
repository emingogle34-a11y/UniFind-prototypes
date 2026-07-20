import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { MOCK_ITEMS } from "@/lib/data";
import { ArrowLeft, MapPin, Clock, MessageCircle, Share2, Bookmark, ChevronRight, Sparkles, Loader2, CheckCircle2, ShieldCheck, HelpCircle, AlertTriangle, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/TossComponents";
import { trpc } from "@/lib/trpc";

const USE_API = import.meta.env.VITE_USE_API === "true";

function getAiPercent(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric <= 1 ? numeric * 100 : numeric);
}

function getStatusValue(status: unknown) {
  if (status === "resolved" || status === "완료") return "resolved";
  if (status === "expired") return "expired";
  return "active";
}

function getReportedLabel(item: any) {
  if (item?.reportedAt) return new Date(item.reportedAt).toLocaleString();
  return item?.date || "방금 전";
}

export default function ItemDetailScreen() {
  const { selectedItemId, setScreen, replaceScreen, goBack, setSelectedChatId, setActiveTab, isAuthenticated } = useApp();
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const numericItemId = Number(selectedItemId);

  // tRPC 쿼리
  const itemQuery = trpc.items.getById.useQuery(numericItemId, {
    enabled: USE_API && !!selectedItemId && Number.isFinite(numericItemId),
    retry: false,
  });
  const apiItem = itemQuery.data as any;
  const mockItem = MOCK_ITEMS.find((entry) => entry.id === selectedItemId);
  const item = apiItem ?? mockItem;
  const statusValue = getStatusValue(item?.status);
  const aiPercent = getAiPercent(item?.aiConfidence);
  const userHue = (Number((item as any)?.userId ?? selectedItemId) || 1) * 40;
  const isMockItem = !apiItem && !!mockItem;
  const statusSteps = [
    { label: "등록", done: true },
    { label: item?.type === "lost" ? "제보 대기" : "주인 확인", done: statusValue !== "expired" },
    { label: "안전 채팅", done: (item?.chatCount ?? 0) > 0 },
    { label: "해결", done: statusValue === "resolved" },
  ];
  const verificationQuestions =
    item?.type === "lost"
      ? ["지갑 안에 들어 있던 물건은?", "마지막으로 사용한 장소는?", "겉면의 흠집이나 특징은?"]
      : ["정확한 색상과 브랜드는?", "안에 들어 있던 물건은?", "분실한 시간대는?"];

  const updateStatusMutation = trpc.items.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("상태가 업데이트되었습니다!");
      setStatusUpdateOpen(false);
    },
    onError: () => {
      toast.error("상태 업데이트에 실패했습니다");
    },
  });

  const createChatRoomMutation = trpc.chat.createRoom.useMutation({
    onSuccess: (result: any) => {
      const roomId = result?.insertId || result?.id;
      if (roomId) {
        setSelectedChatId(roomId.toString());
        setActiveTab("chat");
        setScreen("chat-room");
      }
    },
    onError: (error) => {
      toast.error(error.message || "채팅방을 만들지 못했어요");
    },
  });

  const handleChat = async () => {
    if (!item) return;
    if (!isAuthenticated) {
      toast.info("익명 채팅은 로그인과 학교 인증 후 이용할 수 있어요");
      replaceScreen("auth");
      return;
    }
    if (!USE_API || isMockItem || !item.userId) {
      toast.error("현재 미리보기에서는 실제 채팅방을 만들 수 없어요");
      return;
    }
    createChatRoomMutation.mutate({
      itemId: item.id,
      respondentId: item.userId,
    });
  };

  if (itemQuery.isLoading && !mockItem) {
    return (
      <div className="uf-screen flex items-center justify-center h-full">
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--muted-foreground)" }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="uf-screen flex flex-col h-full transition-colors duration-300">
        <div className="uf-header px-4 pt-14 pb-3 flex items-center gap-3">
          <button onClick={goBack} className="p-1 -ml-1" aria-label="이전 화면으로 돌아가기">
            <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>게시물을 찾을 수 없어요</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>선택한 게시물 정보가 없거나 불러오기에 실패했습니다.</p>
          <button
            onClick={() => setScreen("home")}
            className="uf-btn-primary mt-5 px-5 py-3"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="uf-screen flex flex-col h-full transition-colors duration-300">
      {/* Header */}
      <div className="uf-header px-4 pt-14 pb-3 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
        <button onClick={goBack} className="p-1 -ml-1" aria-label="이전 화면으로 돌아가기">
          <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => toast.success("북마크에 저장했어요")} className="uf-icon-tile h-9 w-9">
            <Bookmark size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={() => toast.success("링크가 복사되었어요")} className="uf-icon-tile h-9 w-9">
            <Share2 size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      <div className="uf-page-enter overflow-y-auto pb-32">
        {/* Image hero */}
        <div
          className="w-full flex items-center justify-center py-12 transition-colors duration-300"
          style={{ background: item.type === "lost" ? "var(--uf-danger-soft)" : "var(--uf-blue-light)" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-28 h-28 rounded-[30px] flex items-center justify-center text-6xl shadow-[var(--uf-shadow-floating)] overflow-hidden"
            style={{ background: "var(--card)" }}
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <CategoryIcon category={item.category} size={54} strokeWidth={1.6} />
            )}
          </motion.div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Title & badges */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: item.type === "lost" ? "var(--uf-danger-soft)" : "var(--uf-blue-light)",
                  color: item.type === "lost" ? "var(--uf-orange)" : "var(--uf-blue)"
                }}
              >
                {item.type === "lost" ? "분실물" : "습득물"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {item.category}
              </span>
              {aiPercent !== null && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
                  <Sparkles size={10} />
                  AI {aiPercent}%
                </span>
              )}
              {/* Status badge */}
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: statusValue === "active" ? "var(--uf-blue-light)" : statusValue === "resolved" ? "var(--uf-success-soft)" : "var(--uf-danger-soft)",
                  color: statusValue === "active" ? "var(--uf-blue)" : statusValue === "resolved" ? "var(--uf-green)" : "var(--uf-orange)"
                }}
              >
                {statusValue === "active" ? "진행 중" : statusValue === "resolved" ? "해결됨" : "만료됨"}
              </span>
            </div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{item.title}</h1>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="uf-card p-4 space-y-3 transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="uf-icon-tile w-8 h-8 rounded-lg">
                <MapPin size={15} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>장소</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.location}</p>
              </div>
            </div>
            <div className="h-px" style={{ background: "var(--border)" }} />
            <div className="flex items-center gap-3">
              <div className="uf-icon-tile w-8 h-8 rounded-lg" style={{ background: "var(--uf-purple-soft)", color: "var(--uf-purple)" }}>
                <Clock size={15} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>보고 시간</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {getReportedLabel(item)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="uf-card p-4 transition-colors duration-300"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>처리 상태</p>
                <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>
                  {statusValue === "resolved" ? "해결 완료" : statusValue === "expired" ? "보관 기간 확인 필요" : "연락을 기다리는 중"}
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}>
                채팅 {item.chatCount ?? 0}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {statusSteps.map((step) => (
                <div key={step.label} className="min-w-0">
                  <div
                    className="mb-1 h-1.5 rounded-full"
                    style={{ background: step.done ? "var(--uf-blue)" : "var(--muted)" }}
                  />
                  <p className="truncate text-[10px] font-semibold" style={{ color: step.done ? "var(--foreground)" : "var(--muted-foreground)" }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          {item.description && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="uf-card p-4 transition-colors duration-300"
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>상세 설명</p>
              <p style={{ color: "var(--foreground)" }}>{item.description}</p>
            </motion.div>
          )}

          {/* Reward */}
          {(item.points ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="uf-card p-4 transition-colors duration-300"
              style={{ background: "linear-gradient(135deg, var(--uf-danger-soft) 0%, var(--uf-warning-soft) 100%)", border: "1px solid color-mix(in srgb, var(--uf-orange) 22%, var(--border))" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--uf-orange)" }}>습득자 보상</p>
                  <p className="text-2xl font-extrabold" style={{ color: "var(--uf-orange)" }}>+{item.points}P</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "var(--card)", color: "var(--uf-orange)" }}>
                  <LockKeyhole size={20} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "color-mix(in srgb, var(--card) 74%, transparent)", color: "var(--muted-foreground)" }}>
                <ShieldCheck size={14} style={{ color: "var(--uf-green)" }} />
                <span className="text-[11px] font-semibold">분실자가 물건을 받았다고 확인하면 자동 지급돼요</span>
              </div>
            </motion.div>
          )}

          {/* Author info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="uf-card p-4 flex items-center gap-3 transition-colors duration-300"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: `hsl(${userHue}, 60%, 55%)` }}
            >
              👤
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>익명 사용자</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>대학교 인증됨</p>
            </div>
          </motion.div>

          {/* Verification guide */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="uf-card p-4 transition-colors duration-300"
          >
            <div className="mb-3 flex items-start gap-3">
              <div className="uf-icon-tile h-9 w-9 rounded-xl" style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>주인 확인 질문</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  연락 전에 본인만 알 수 있는 정보를 확인하면 악용 가능성을 줄일 수 있어요.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {verificationQuestions.map((question) => (
                <div key={question} className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "var(--muted)" }}>
                  <HelpCircle size={14} style={{ color: "var(--uf-blue)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{question}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="rounded-3xl p-4"
            style={{
              background: "linear-gradient(135deg, var(--uf-danger-soft), var(--uf-warning-soft))",
              border: "1px solid color-mix(in srgb, var(--uf-orange) 20%, var(--border))",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} style={{ color: "var(--uf-orange)" }} />
              <div>
                <p className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>연락처는 공개하지 마세요</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  전달 장소와 시간은 앱 안의 익명 채팅으로만 정하고, 현금 요구나 외부 링크 요청은 신고 대상이에요.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status update section */}
          {statusValue === "active" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button
                onClick={() => setStatusUpdateOpen(!statusUpdateOpen)}
                className="uf-btn-secondary w-full py-3 rounded-xl font-bold transition-all active:scale-95"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                상태 변경
              </button>

              {statusUpdateOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <button
                    onClick={() => USE_API && apiItem ? updateStatusMutation.mutate({ id: item.id, status: "resolved" }) : toast.success((item.points ?? 0) > 0 ? `수령 확인 완료 · 습득자에게 ${item.points}P가 지급돼요` : "물건을 받은 것으로 처리했어요")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "var(--uf-green)" }}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        물건을 받았어요
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => USE_API && apiItem ? updateStatusMutation.mutate({ id: item.id, status: "expired" }) : toast.success("시연 데이터에서는 화면 상태만 확인할 수 있어요")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                  >
                    못 찾았어요
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Fixed action buttons */}
      <div className="fixed bottom-24 left-0 right-0 px-4 py-3 flex gap-2 transition-colors duration-300 uf-header">
        <button
          onClick={handleChat}
          className="uf-btn-primary flex-1 py-3 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          {item.type === "lost" ? "찾은 것 같아요" : "주인 확인하기"}
        </button>
      </div>
    </div>
  );
}
