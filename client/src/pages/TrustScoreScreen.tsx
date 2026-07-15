import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, CheckCircle2, AlertCircle, Award, MessageSquare, TrendingUp } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface UserTrust {
  name: string;
  trustScore: number;
  verifications: {
    emailVerified: boolean;
    schoolVerified: boolean;
    phoneVerified: boolean;
    itemsMatched: number;
  };
  reviews: {
    id: string;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export default function TrustScoreScreen() {
  const { setScreen, userName, userUniversity } = useApp();

  const userTrust: UserTrust = {
    name: userName,
    trustScore: 92,
    verifications: {
      emailVerified: true,
      schoolVerified: true,
      phoneVerified: true,
      itemsMatched: 5,
    },
    reviews: [
      {
        id: "1",
        reviewer: "이** 학생",
        rating: 5,
        comment: "답장이 빠르고 확인 질문도 정확해서 안심됐어요.",
        date: "2026-05-28",
      },
      {
        id: "2",
        reviewer: "박** 학생",
        rating: 5,
        comment: "분실물 센터 위치까지 알려줘서 바로 찾았습니다.",
        date: "2026-05-20",
      },
      {
        id: "3",
        reviewer: "최** 학생",
        rating: 4,
        comment: "약속 시간을 잘 지켜주셨어요.",
        date: "2026-05-15",
      },
    ],
  };

  const trustLevel =
    userTrust.trustScore >= 90
      ? { label: "매우 높음", color: "var(--uf-green)", bg: "rgba(22, 163, 74, 0.12)" }
      : userTrust.trustScore >= 75
        ? { label: "높음", color: "var(--uf-blue)", bg: "var(--uf-blue-light)" }
        : { label: "주의 필요", color: "var(--uf-orange)", bg: "rgba(249, 115, 76, 0.12)" };

  const scoreParts = [
    { label: "학교 인증", value: 30, max: 30, color: "var(--uf-blue)" },
    { label: "분실물 해결", value: 35, max: 40, color: "var(--uf-green)" },
    { label: "응답 매너", value: 20, max: 20, color: "#8B5CF6" },
    { label: "신고 이력 없음", value: 7, max: 10, color: "var(--uf-orange)" },
  ];

  const verifications = [
    { label: "학교 이메일 인증", desc: userUniversity, verified: userTrust.verifications.emailVerified },
    { label: "학교 구성원 인증", desc: "같은 캠퍼스 사용자만 연락 가능", verified: userTrust.verifications.schoolVerified },
    { label: "연락처 보호", desc: "전화번호 비공개 익명 채팅", verified: userTrust.verifications.phoneVerified },
  ];

  return (
    <div className="uf-screen flex h-full flex-col">
      <div className="uf-header sticky top-0 z-40 px-4 pb-4 pt-14">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("mypage")} className="p-1 -ml-1">
            <ArrowLeft size={22} style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">신뢰도</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">안전한 분실물 연락을 위한 기준이에요</p>
          </div>
        </div>
      </div>

      <div className="uf-page-enter flex-1 space-y-5 overflow-y-auto px-5 py-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5 text-white"
          style={{ background: "var(--uf-premium-gradient)", boxShadow: "var(--uf-shadow-floating)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white/75">{userTrust.name}님의 신뢰 점수</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-extrabold">{userTrust.trustScore}</span>
                <span className="mb-1 text-lg font-bold text-white/75">/100</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Shield size={30} />
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userTrust.trustScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: trustLevel.bg, color: trustLevel.color }}>
              {trustLevel.label}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-white/75">
              <TrendingUp size={13} />
              최근 30일 +6점
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "인증", value: "3/3", icon: "🎓" },
            { label: "해결", value: `${userTrust.verifications.itemsMatched}건`, icon: "🤝" },
            { label: "리뷰", value: `${userTrust.reviews.length}개`, icon: "⭐" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.04 }}
              className="uf-card p-3 text-center"
            >
              <p className="text-lg">{stat.icon}</p>
              <p className="mt-1 text-base font-extrabold text-foreground">{stat.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="uf-card p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <Award size={17} style={{ color: "var(--uf-blue)" }} />
            <h3 className="text-sm font-extrabold text-foreground">점수 구성</h3>
          </div>
          <div className="space-y-3">
            {scoreParts.map((part) => {
              const percent = Math.round((part.value / part.max) * 100);
              return (
                <div key={part.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">{part.label}</span>
                    <span className="text-xs font-extrabold text-foreground">{part.value}/{part.max}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: part.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 text-base font-extrabold text-foreground">인증 현황</h3>
          <div className="space-y-2.5">
            {verifications.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 + index * 0.04 }}
                className="uf-card flex items-center gap-3 p-4"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: item.verified ? "rgba(22, 163, 74, 0.12)" : "var(--muted)" }}
                >
                  {item.verified ? (
                    <CheckCircle2 size={20} style={{ color: "var(--uf-green)" }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: "var(--muted-foreground)" }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <h3 className="mb-3 text-base font-extrabold text-foreground">최근 리뷰</h3>
          <div className="space-y-2.5">
            {userTrust.reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + index * 0.04 }}
                className="uf-card p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{review.reviewer}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="rounded-3xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(201, 137, 16, 0.14) 0%, rgba(249, 115, 76, 0.10) 100%)",
            border: "1px solid rgba(249, 115, 76, 0.14)",
          }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare size={18} style={{ color: "var(--uf-orange)" }} />
            <div>
              <h4 className="text-sm font-extrabold text-foreground">신뢰도를 더 올리는 방법</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                익명 채팅에서 빠르게 답하고, 물건 확인 질문을 정확히 주고받고, 전달이 끝나면 상태를 바로 업데이트하세요.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
