// UniFind - 알림 화면
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NOTIFICATIONS = [
  { id: "n1", icon: "💬", title: "새 채팅 메시지", desc: "이서연님이 메시지를 보냈어요", time: "방금", unread: true },
  { id: "n2", icon: "🎉", title: "포인트 적립", desc: "습득물 신고로 100P가 적립되었어요", time: "1시간 전", unread: true },
  { id: "n3", icon: "🔍", title: "분실물 매칭", desc: "등록하신 분실물과 유사한 습득물이 발견되었어요", time: "3시간 전", unread: true },
  { id: "n4", icon: "✅", title: "분실물 완료", desc: "갈색 반지갑이 주인을 찾았어요!", time: "1일 전", unread: false },
  { id: "n5", icon: "📅", title: "출석 체크", desc: "오늘 출석 체크로 50P가 적립되었어요", time: "1일 전", unread: false },
  { id: "n6", icon: "🏆", title: "뱃지 획득", desc: "'활발한 활동' 뱃지를 획득했어요!", time: "3일 전", unread: false },
];

export default function NotificationsScreen() {
  const { setScreen } = useApp();

  return (
    <div className="uf-screen flex flex-col h-full">
      <div className="uf-header px-4 pt-14 pb-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => setScreen("home")} className="p-1 -ml-1">
          <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">알림</h1>
        <button className="ml-auto text-xs font-semibold" style={{ color: "var(--uf-blue)" }}>
          모두 읽음
        </button>
      </div>

      <div className="uf-page-enter px-4 py-4">
        <div className="space-y-3">
          {NOTIFICATIONS.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="uf-card flex items-start gap-3 px-4 py-4 transition-colors active:scale-[0.99]"
              style={{ background: n.unread ? "var(--uf-warm-gradient)" : "var(--uf-card-gradient)" }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "var(--muted)" }}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{n.title}</p>
                  {n.unread && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--uf-blue)" }} />
                  )}
                </div>
                <p className="text-xs mt-0.5 text-muted-foreground">{n.desc}</p>
                <p className="text-[11px] mt-1 text-muted-foreground">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
