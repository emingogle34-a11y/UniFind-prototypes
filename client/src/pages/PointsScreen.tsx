import { useApp } from "@/contexts/AppContext";
import { MOCK_POINT_HISTORY } from "@/lib/data";
import { ArrowLeft, BadgeCheck, CheckCircle2, ChevronRight, FileCheck2, Gift, Handshake, LockKeyhole, PackageCheck, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { riseItem, staggerContainer, tapMotion, motionTransition, useCountUp } from "@/lib/motion";
import { toast } from "sonner";

const REWARDS = [
  { icon: "☕", name: "아메리카노", points: 500, desc: "캠퍼스 카페 교환권" },
  { icon: "🍚", name: "학식 할인쿠폰", points: 1000, desc: "학생 식당 20% 할인" },
  { icon: "📚", name: "도서관 연장권", points: 300, desc: "대출 기간 7일 연장" },
  { icon: "🏪", name: "편의점 상품권", points: 2000, desc: "5,000원 상당" },
];

const POINT_METHODS = [
  { icon: FileCheck2, label: "분실물 등록", points: "+100P", color: "var(--uf-blue-light)", textColor: "var(--uf-blue)" },
  { icon: PackageCheck, label: "습득물 등록", points: "+200P", color: "var(--uf-success-soft)", textColor: "var(--uf-green)" },
  { icon: Handshake, label: "물건 전달 완료", points: "설정된 보상P", color: "var(--uf-danger-soft)", textColor: "var(--uf-orange)" },
  { icon: CheckCircle2, label: "매일 출석 체크", points: "+50P", color: "var(--uf-success-soft)", textColor: "var(--uf-green)" },
  { icon: BadgeCheck, label: "첫 학교 인증 보너스", points: "+100P", color: "var(--uf-purple-soft)", textColor: "var(--uf-purple)" },
];

const FINDER_REWARD_FLOW: { icon: LucideIcon; title: string; desc: string; color: string; background: string }[] = [
  { icon: LockKeyhole, title: "보상 포인트 예약", desc: "분실자가 등록할 때 포인트를 안전하게 보관해요", color: "var(--uf-blue)", background: "var(--uf-blue-light)" },
  { icon: Handshake, title: "물건 전달", desc: "익명 채팅에서 장소와 시간을 정해 전달해요", color: "var(--uf-purple)", background: "var(--uf-purple-soft)" },
  { icon: CheckCircle2, title: "수령 확인", desc: "분실자가 '물건을 받았어요'를 누르면 지급돼요", color: "var(--uf-green)", background: "var(--uf-success-soft)" },
];

const PARTNER_BENEFITS = [
  { icon: "🍱", title: "학식/카페", desc: "식권, 음료 교환권", tag: "제휴 예정", color: "var(--uf-blue-light)", textColor: "var(--uf-blue)" },
  { icon: "🏪", title: "캠퍼스 편의점", desc: "소액 상품권 전환", tag: "인기", color: "var(--uf-success-soft)", textColor: "var(--uf-green)" },
  { icon: "💝", title: "기부 전환", desc: "장학금·동아리 후원", tag: "추천", color: "var(--uf-warning-soft)", textColor: "var(--uf-amber)" },
];

export default function PointsScreen() {
  const { goBack, userPoints } = useApp();
  const displayPoints = useCountUp(userPoints, 720);

  const totalEarned = MOCK_POINT_HISTORY.filter((h) => h.type === "earn").reduce((s, h) => s + h.amount, 0);
  const totalSpent = Math.abs(MOCK_POINT_HISTORY.filter((h) => h.type === "spend").reduce((s, h) => s + h.amount, 0));
  const availableRewards = REWARDS.filter((reward) => userPoints >= reward.points).length;
  const nextReward = REWARDS.filter((reward) => reward.points > userPoints).sort((a, b) => a.points - b.points)[0];
  const nextRewardProgress = nextReward ? Math.min(100, Math.round((userPoints / nextReward.points) * 100)) : 100;

  const handleRewardClick = (reward: (typeof REWARDS)[number]) => {
    if (userPoints >= reward.points) {
      toast.success(`${reward.name} 교환 신청 화면으로 이동할 수 있어요`);
    } else {
      toast.info(`${(reward.points - userPoints).toLocaleString()}P가 더 필요해요.`);
    }
  };

  return (
    <div className="uf-screen flex h-full flex-col">
      <div className="uf-header sticky top-0 z-40 px-4 pb-4 pt-14">
        <div className="flex items-center gap-3">
          <motion.button {...tapMotion} onClick={goBack} className="-ml-1 rounded-full p-2" aria-label="이전 화면으로 돌아가기">
            <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
          </motion.button>
          <div>
            <h1 className="text-lg font-extrabold text-foreground">포인트</h1>
            <p className="text-xs text-muted-foreground">참여할수록 캠퍼스 혜택이 쌓여요</p>
          </div>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="uf-page-enter flex-1 space-y-5 px-5 py-4 pb-24">
        <motion.div
          variants={riseItem}
          className="relative overflow-hidden rounded-[28px]"
          style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-floating)" }}
        >
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/15 bg-white/12">
            <Sparkles size={25} className="text-white" />
          </div>
          <div className="relative z-10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/80">사용 가능한 포인트</p>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{displayPoints.toLocaleString()}</span>
                  <span className="mb-1 text-lg font-bold text-white/80">P</span>
                </div>
                <p className="mt-2 text-xs font-medium text-white/72">
                  지금 교환 가능한 혜택 {availableRewards}개
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 border-t border-white/20 pt-4">
              <div>
                <p className="text-xs text-white/70">총 적립</p>
                <p className="mt-0.5 text-base font-bold text-white">+{totalEarned.toLocaleString()}P</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-xs text-white/70">총 사용</p>
                <p className="mt-0.5 text-base font-bold text-white">-{totalSpent.toLocaleString()}P</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <TrendingUp size={12} className="text-white/70" />
                <span className="text-xs text-white/70">이번 달 +350P</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={riseItem} className="uf-card overflow-hidden p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--uf-warning-soft)", color: "var(--uf-amber)" }}>
              <Handshake size={19} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">습득자 보상은 이렇게 지급돼요</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">물건을 실제로 돌려준 뒤에만 포인트가 이동해요.</p>
            </div>
          </div>
          <div className="space-y-3">
            {FINDER_REWARD_FLOW.map(({ icon: Icon, title, desc, color, background }, index) => (
              <div key={title} className="relative flex items-start gap-3">
                {index < FINDER_REWARD_FLOW.length - 1 && <span className="absolute left-[17px] top-9 h-6 w-px bg-border" />}
                <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background, color }}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-extrabold text-foreground">{index + 1}. {title}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: "var(--uf-success-soft)", color: "var(--uf-green)" }}>
            <BadgeCheck size={16} />
            <span className="text-[11px] font-extrabold">수령 확인 즉시 습득자 계정으로 자동 지급</span>
          </div>
        </motion.div>

        <motion.div variants={riseItem} className="uf-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">다음 목표</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">
                {nextReward ? nextReward.name : "모든 혜택 가능"}
              </p>
            </div>
            {nextReward && (
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground">남은 포인트</p>
                <p className="mt-1 text-sm font-extrabold" style={{ color: "var(--uf-blue)" }}>
                  {(nextReward.points - userPoints).toLocaleString()}P
                </p>
              </div>
            )}
          </div>
          {nextReward && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextRewardProgress}%` }}
                  transition={motionTransition.slow}
                  className="h-full rounded-full"
                  style={{ background: "var(--uf-premium-gradient)" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>{userPoints.toLocaleString()}P</span>
                <span>{nextReward.points.toLocaleString()}P</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={riseItem} className="uf-card p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">포인트 사용처</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">적립한 포인트가 실제 혜택으로 이어지게 설계했어요</p>
            </div>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--uf-blue-light)", color: "var(--uf-blue)" }}>
              베타
            </span>
          </div>
          <div className="space-y-2.5">
            {PARTNER_BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-center gap-3 rounded-[20px] p-3" style={{ background: "var(--muted)" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ background: benefit.color }}>
                  {benefit.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-foreground">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </div>
                <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "var(--card)", color: benefit.textColor }}>
                  {benefit.tag}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={riseItem} className="uf-card p-4">
          <h3 className="mb-3 text-sm font-extrabold text-foreground">포인트 적립 방법</h3>
          <div className="space-y-2.5">
            {POINT_METHODS.map((item) => {
              const Icon = item.icon;
              return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: item.color, color: item.textColor }}>
                  <Icon size={15} />
                </div>
                <span className="flex-1 text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="text-sm font-extrabold" style={{ color: item.textColor }}>
                  {item.points}
                </span>
              </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted-foreground">중복·허위 신고는 적립에서 제외되고, 반복 시 활동이 제한돼요.</p>
        </motion.div>

        <motion.div variants={riseItem}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-foreground" />
              <h3 className="text-base font-extrabold text-foreground">포인트 교환</h3>
            </div>
            <button className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "var(--uf-blue)" }}>
              전체보기 <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {REWARDS.map((reward) => {
              const canRedeem = userPoints >= reward.points;
              return (
                <motion.button
                  key={reward.name}
                  variants={riseItem}
                  {...tapMotion}
                  className="uf-card p-4 text-left"
                  onClick={() => handleRewardClick(reward)}
                >
                  <span className="text-3xl">{reward.icon}</span>
                  <p className="mt-2 text-sm font-bold text-foreground">{reward.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{reward.desc}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold" style={{ color: "var(--uf-blue)" }}>
                      {reward.points.toLocaleString()}P
                    </span>
                    <span
                      className="rounded-full px-2 py-1 text-[10px] font-bold"
                      style={{
                        background: canRedeem ? "var(--uf-blue)" : "var(--muted)",
                        color: canRedeem ? "white" : "var(--muted-foreground)",
                      }}
                    >
                      {canRedeem ? "교환" : "부족"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={riseItem}>
          <h3 className="mb-3 text-base font-extrabold text-foreground">포인트 내역</h3>
          <div className="uf-card divide-y" style={{ borderColor: "var(--border)" }}>
            {MOCK_POINT_HISTORY.map((history) => (
              <div key={history.id} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                  style={{ background: history.type === "earn" ? "var(--uf-blue-light)" : "var(--uf-danger-soft)" }}
                >
                  {history.type === "earn" ? "＋" : "−"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{history.reason}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{history.date}</p>
                </div>
                <span className="text-sm font-extrabold" style={{ color: history.type === "earn" ? "var(--uf-blue)" : "var(--uf-orange)" }}>
                  {history.type === "earn" ? "+" : ""}
                  {history.amount.toLocaleString()}P
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
