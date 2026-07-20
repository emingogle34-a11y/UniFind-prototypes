import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Send, Loader2, ShieldCheck, Lock, HelpCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { riseItem, staggerContainer, tapMotion, motionTransition } from "@/lib/motion";
import { toast } from "sonner";
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from "@/lib/data";

const USE_API = import.meta.env.VITE_USE_API === "true";

const CHAT_SAFETY = [
  { icon: Lock, label: "번호 비공개", desc: "연락처 없이 대화" },
  { icon: ShieldCheck, label: "학교 인증", desc: "인증 학생만 참여" },
  { icon: HelpCircle, label: "확인 질문", desc: "주인 여부 검증" },
];

function getRoomHue(id: string | number) {
  const numeric = Number(id);
  if (Number.isFinite(numeric)) return numeric * 40;
  return String(id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getRoomDate(room: any) {
  if (room.lastMessageAt) {
    return new Date(room.lastMessageAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  }
  return room.lastTime || "방금";
}

function getRoomItemTitle(room: any) {
  return room.itemTitle ?? room.item?.title ?? `분실물 #${room.itemId ?? room.id}`;
}

function getRoomParticipant(room: any) {
  const name = room.otherUser ?? room.participantName ?? room.userName;
  if (typeof name === "string" && name.length > 0) return `${name.slice(0, 1)}** 인증 학생`;
  return "익명 인증 학생";
}

function getRoomUnread(room: any) {
  return Number(room.unread ?? room.unreadCount ?? 0);
}

function getMessageContent(message: any) {
  return message.content ?? message.text ?? "";
}

function getMessageTime(message: any) {
  if (message.createdAt) {
    return new Date(message.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  return message.timestamp ?? "방금";
}

function isMyMessage(message: any) {
  if (typeof message.isMe === "boolean") return message.isMe;
  return message.senderId === 0 || message.senderId === "me";
}

export function ChatListScreen() {
  const { setScreen, goBack, setSelectedChatId } = useApp();
  const { data: apiChatRooms, isLoading } = trpc.chat.rooms.useQuery(undefined, {
    enabled: USE_API,
    retry: false,
  });
  const chatRooms = (USE_API ? apiChatRooms ?? [] : MOCK_CHAT_ROOMS) as any[];
  const showLoading = isLoading && chatRooms.length === 0;
  const unreadTotal = chatRooms.reduce((sum, room) => sum + getRoomUnread(room), 0);

  return (
    <div className="uf-screen flex h-full flex-col transition-colors duration-300">
      <div className="uf-header sticky top-0 z-40 px-5 pb-4 pt-14 transition-colors duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-2">
            <motion.button {...tapMotion} onClick={goBack} className="-ml-2 rounded-full p-2" aria-label="이전 화면으로 돌아가기">
              <ArrowLeft size={21} style={{ color: "var(--foreground)" }} />
            </motion.button>
            <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>
              채팅
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              번호를 공개하지 않고 분실자와 습득자가 대화해요
            </p>
            </div>
          </div>
          {unreadTotal > 0 && (
            <span className="rounded-full px-2.5 py-1 text-xs font-extrabold text-white" style={{ background: "var(--uf-orange)" }}>
              {unreadTotal}
            </span>
          )}
        </div>
      </div>

      <div className="uf-page-enter flex-1 overflow-y-auto px-4 py-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.normal}
          className="mb-4 rounded-[26px] p-4"
          style={{
            background: "linear-gradient(135deg, var(--uf-blue-light), var(--uf-success-soft))",
            border: "1px solid var(--border)",
            boxShadow: "var(--uf-shadow-soft)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: "var(--card)" }}>
              <ShieldCheck size={18} style={{ color: "var(--uf-blue)" }} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">익명 보호 대화</p>
              <p className="text-xs text-muted-foreground">주인을 확인하는 데 필요한 정보만 나눠요</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CHAT_SAFETY.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl p-2.5" style={{ background: "color-mix(in srgb, var(--card) 72%, transparent)" }}>
                <Icon size={15} style={{ color: "var(--uf-blue)" }} />
                <p className="mt-1.5 text-[11px] font-extrabold text-foreground">{label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {showLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--muted-foreground)" }} />
          </div>
        ) : !chatRooms || chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px]" style={{ background: "var(--uf-blue-light)" }}>
              <MessageCircle size={28} style={{ color: "var(--uf-blue)" }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              아직 채팅이 없어요
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              분실물 게시글에서 익명 채팅을 시작해보세요
            </p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {chatRooms.map((room) => (
              <motion.button
                key={room.id}
                variants={riseItem}
                {...tapMotion}
                onClick={() => {
                  setSelectedChatId(room.id.toString());
                  setScreen("chat-room");
                }}
                className="uf-card w-full px-4 py-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-[var(--uf-shadow-soft)]"
                    style={{ background: `linear-gradient(135deg, hsl(${getRoomHue(room.id)}, 62%, 56%), hsl(${getRoomHue(room.id) + 30}, 70%, 46%))` }}
                  >
                    <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-bold" style={{ color: "var(--foreground)" }}>
                          {getRoomParticipant(room)}
                        </span>
                        <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}>
                          인증
                        </span>
                      </div>
                      <span className="shrink-0 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        {getRoomDate(room)}
                      </span>
                    </div>
                    <p className="mb-1 truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
                      물건 · {getRoomItemTitle(room)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--foreground)" }}>
                        {room.lastMessage || "아직 메시지가 없어요"}
                      </p>
                      {getRoomUnread(room) > 0 && (
                        <span className="min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold text-white" style={{ background: "var(--uf-orange)" }}>
                          {getRoomUnread(room)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function ChatRoomScreen() {
  const { goBack, selectedChatId } = useApp();
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState(MOCK_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const numericChatId = Number(selectedChatId);
  const canUseApi = !!selectedChatId && Number.isFinite(numericChatId);
  const selectedRoom = MOCK_CHAT_ROOMS.find((room) => room.id.toString() === selectedChatId);

  const { data: apiMessages, isLoading: messagesLoading } = trpc.chat.messages.useQuery(numericChatId, {
    enabled: USE_API && canUseApi,
    retry: false,
  });
  const messages = (USE_API ? apiMessages ?? [] : localMessages) as any[];
  const showMessagesLoading = messagesLoading && messages.length === 0;

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setInput("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error) => {
      toast.error("메시지 전송에 실패했어요");
      console.error(error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedChatId) return;

    if (!USE_API || !apiMessages?.length) {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          senderId: "me",
          text: input,
          timestamp: "방금",
          isMe: true,
        },
      ]);
      setInput("");
      setTimeout(scrollToBottom, 100);
      return;
    }

    await sendMutation.mutateAsync({
      roomId: numericChatId,
      content: input,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [apiMessages, localMessages]);

  return (
    <div className="uf-screen flex h-full flex-col transition-colors duration-300">
      <div className="uf-header sticky top-0 z-40 flex items-center gap-3 px-4 pb-3 pt-14 transition-colors duration-300">
        <motion.button
          {...tapMotion}
          onClick={goBack}
          aria-label="이전 화면으로 돌아가기"
          className="-ml-1 rounded-full p-2"
        >
          <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
        </motion.button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {selectedRoom ? getRoomParticipant(selectedRoom) : "익명 인증 학생"}
            </h2>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
              보호 중
            </span>
          </div>
          <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
            {selectedRoom ? getRoomItemTitle(selectedRoom) : "개인정보는 공개되지 않아요"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.normal}
          className="rounded-[22px] px-4 py-3"
          style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--uf-shadow-soft)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--uf-blue-light)" }}>
              <HelpCircle size={18} style={{ color: "var(--uf-blue)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">주인 확인 질문</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                색상, 안에 들어있던 물건, 분실 시간처럼 본인만 알 수 있는 정보로 확인해요.
              </p>
            </div>
          </div>
        </motion.div>

        <div
          className="rounded-[22px] px-4 py-3 text-xs leading-relaxed"
          style={{
            background: "var(--uf-blue-light)",
            color: "var(--uf-blue)",
            border: "1px solid color-mix(in srgb, var(--uf-blue) 18%, var(--border))",
          }}
        >
          연락처, 계좌번호 등 민감한 정보는 공개하지 않는 것이 좋아요. 필요하면 학교 분실물 센터에서 만나 전달하세요.
        </div>

        {showMessagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--muted-foreground)" }} />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[22px]" style={{ background: "var(--uf-blue-light)" }}>
              <MessageCircle size={24} style={{ color: "var(--uf-blue)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              대화를 시작해보세요
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              익명으로 안전하게 대화할 수 있어요
            </p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
            {messages.map((msg) => (
              <motion.div key={msg.id} variants={riseItem} className={`flex ${isMyMessage(msg) ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2.5 ${isMyMessage(msg) ? "uf-bubble-me" : "uf-bubble-other"}`}>
                  <p className="break-words text-sm">{getMessageContent(msg)}</p>
                  <p className="mt-1 text-xs" style={{ opacity: 0.7 }}>
                    {getMessageTime(msg)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="uf-header flex items-center gap-2 px-4 py-3 transition-colors duration-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="익명 메시지를 입력하세요"
          className="flex-1 rounded-full border px-4 py-3 transition-colors duration-300 placeholder:text-muted-foreground"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          disabled={sendMutation.isPending}
        />
        <motion.button
          {...tapMotion}
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-[var(--uf-shadow-floating)]"
          style={{ background: "var(--uf-premium-gradient)" }}
        >
          {sendMutation.isPending ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} className="text-white" />}
        </motion.button>
      </div>
    </div>
  );
}
