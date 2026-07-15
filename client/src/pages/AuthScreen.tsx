import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Shield, Users, Zap, Star } from "lucide-react";
import { UNIVERSITIES, UNIFIND_LOGO } from "@/lib/data";
import { NicknameInput, type NicknameAvailability } from "@/components/NicknameInput";
import { SchoolEmblem } from "@/components/TossComponents";

type AuthStep = "landing" | "login" | "signup" | "nickname" | "verify-school" | "verify-email" | "complete";

export default function AuthScreen() {
  const { setScreen, setIsAuthenticated, setUserUniversity, setUserName, setUserNickname } = useApp();
  const [step, setStep] = useState<AuthStep>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameState, setNicknameState] = useState<NicknameAvailability>({
    nickname: "",
    available: false,
    checking: false,
    message: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [selectedUniv, setSelectedUniv] = useState("");
  const [showUnivList, setShowUnivList] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      setUserName(name || "김민준");
      setUserUniversity(selectedUniv || "명지대학교");
      setScreen("home");
    }, 1200);
  };

  const handleSignup = () => {
    if (!name || !email || !password) return;
    setNickname(name.slice(0, 10));
    setNicknameState({
      nickname: name.slice(0, 10),
      available: false,
      checking: true,
      message: "닉네임을 확인하고 있어요.",
    });
    setStep("nickname");
  };

  const handleNicknameNext = () => {
    if (!nicknameState.available || nicknameState.checking) return;
    setStep("verify-school");
  };

  const handleVerifySchool = () => {
    if (!selectedUniv) return;
    setStep("verify-email");
  };

  const handleVerifyEmail = () => {
    if (verifyCode.length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("complete");
    }, 1000);
  };

  const handleComplete = () => {
    setIsAuthenticated(true);
    setUserUniversity(selectedUniv);
    setUserName(name);
    setUserNickname(nicknameState.nickname || nickname);
    setScreen("home");
  };

  // Landing Screen - 새로운 레이아웃
  if (step === "landing") {
    return (
      <div
        className="min-h-screen flex flex-col overflow-hidden relative"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fbff 58%, #eef5ff 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(49,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(49,130,246,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(180deg, transparent 0%, black 18%, black 76%, transparent 100%)",
          }}
        />

        {/* 상단: 로고 + 제목 (왼쪽 정렬) */}
        <div className="pt-8 px-6 relative z-10">
          <motion.div
            className="flex items-center gap-4 mb-12"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <img src={UNIFIND_LOGO} alt="UniFind" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UniFind</h1>
              <p className="text-sm text-gray-600 font-medium">분실물 찾기의 새로운 방법</p>
            </div>
          </motion.div>
        </div>

        {/* 중단: 중앙 일러스트 + 기능 카드 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* 중앙 일러스트 영역 */}
          <motion.div
            className="mb-12 relative w-full max-w-xs h-64"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 배경 원 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-2xl opacity-40" />
            
            {/* 메인 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl">
                <SchoolEmblem name="한국대학교" size="lg" className="drop-shadow-xl" />
              </div>
            </div>

            {/* 장식 아이콘들 */}
            <motion.div
              className="absolute top-4 right-8 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Star className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>

          {/* 기능 카드 (3열) */}
          <motion.div
            className="grid grid-cols-3 gap-3 w-full max-w-md mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { icon: Shield, title: "안전한 커뮤니티", color: "bg-blue-500" },
              { icon: Users, title: "같은 학교 친구들", color: "bg-purple-500" },
              { icon: Zap, title: "빠른 찾기", color: "bg-pink-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 하단: 학교 이메일로 시작하기 섹션 */}
        <motion.div
          className="px-6 pb-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <SchoolEmblem name={selectedUniv || "한국대학교"} size="sm" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">학교 이메일로 시작하기</h3>
                  <p className="text-xs font-semibold text-blue-600">캠퍼스 인증 네트워크</p>
                </div>
              </div>
              <button
                onClick={() => setStep("login")}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700"
              >
                인증 방법
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">대학교 이메일 주소를 입력해주세요</p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="yourname@university.ac.kr"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm"
              />
            </div>
          </div>

          {/* CTA 버튼 */}
          <button
            onClick={() => setStep("login")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 rounded-2xl hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            계속하기
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="mt-3 w-full bg-white text-gray-700 font-semibold py-3.5 rounded-2xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all active:scale-95"
          >
            인증 전 홈 둘러보기
          </button>
        </motion.div>
      </div>
    );
  }

  // Login Screen
  if (step === "login") {
    return (
      <div className="uf-auth-screen relative flex min-h-screen flex-col overflow-hidden">
        <div className="uf-auth-grid" aria-hidden="true" />

        <div className="relative z-10 flex items-center justify-between px-5 pt-5">
          <button
            onClick={() => setStep("landing")}
            className="uf-glass flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-95"
            aria-label="이전 화면"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: "var(--uf-blue)" }}>UNIFIND</p>
            <h2 className="text-base font-black text-foreground">학교 인증 로그인</h2>
          </div>
          <div className="h-11 w-11" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 pt-10">
          <motion.div
            className="mx-auto flex w-full max-w-sm flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <motion.div
              className="mb-9"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: "easeOut", delay: 0.05 }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] shadow-[var(--uf-shadow-soft)]" style={{ background: "var(--uf-premium-gradient)" }}>
                  <img src={UNIFIND_LOGO} alt="UniFind" className="h-9 w-9" />
                </div>
                <SchoolEmblem name={selectedUniv || "명지대학교"} size="sm" />
              </div>
              <p className="text-sm font-black" style={{ color: "var(--uf-blue)" }}>UniFind 로그인</p>
              <h1 className="mt-2 text-[30px] font-black leading-tight tracking-normal text-foreground">
                다시 만나서
                <br />
                반가워요
              </h1>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
                학교 이메일로 로그인하고 내 분실물, 채팅, 포인트를 이어서 확인하세요.
              </p>
            </motion.div>

            <motion.section
              className="uf-auth-form-card rounded-[30px] p-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease: "easeOut", delay: 0.12 }}
            >
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-foreground">이메일</span>
                  <span className="uf-auth-input-wrap">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@university.ac.kr"
                      className="uf-auth-input"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-foreground">비밀번호</span>
                  <span className="uf-auth-input-wrap pr-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호"
                      className="uf-auth-input pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted active:scale-95"
                      aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </span>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--uf-green)" }} />
                  연락처 비공개 보호
                </span>
                <button
                  type="button"
                  className="text-xs font-extrabold"
                  style={{ color: "var(--uf-blue)" }}
                >
                  비밀번호 찾기
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="uf-btn-primary mt-6 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "로그인 중..." : "로그인"}
                {!isLoading && <ChevronRight className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setStep("signup")}
                className="mt-3 w-full rounded-2xl border border-border bg-card/80 py-3.5 text-sm font-extrabold text-foreground transition-all active:scale-95"
              >
                처음이라면 학교 인증 가입하기
              </button>
            </motion.section>

            <p className="mt-5 text-center text-xs font-semibold leading-relaxed text-muted-foreground">
              학교 인증 기반으로 분실자와 습득자를 안전하게 연결합니다.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Signup Screen
  if (step === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setStep("landing")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">회원가입</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            className="w-full max-w-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 이름 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="김민준"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@university.ac.kr"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">비밀번호</label>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleSignup}
              disabled={!name || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>

            {/* 로그인 링크 */}
            <button
              onClick={() => setStep("login")}
              className="w-full text-center text-blue-600 font-medium hover:text-blue-700 transition-all"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Nickname Screen
  if (step === "nickname") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setStep("signup")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">닉네임 설정</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            className="w-full max-w-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[var(--uf-shadow-card)]">
              <div className="mb-5">
                <p className="text-xs font-bold text-blue-600">UniFind 프로필</p>
                <h3 className="mt-1 text-2xl font-black text-gray-900">친구들이 알아볼 이름을 정해주세요</h3>
                <p className="mt-2 text-sm text-gray-500">
                  닉네임은 채팅과 게시물에서 표시돼요. 실명은 학교 인증용으로만 분리해서 관리합니다.
                </p>
              </div>

              <NicknameInput
                value={nickname}
                onChange={setNickname}
                onAvailabilityChange={setNicknameState}
                autoFocus
              />
            </div>

            <button
              onClick={handleNicknameNext}
              disabled={!nicknameState.available || nicknameState.checking}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Verify School Screen
  if (step === "verify-school") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setStep("signup")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">학교 선택</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            className="w-full max-w-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">소속 학교</label>
              <div className="relative">
                <button
                  onClick={() => setShowUnivList(!showUnivList)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-all"
                >
                  <span className={selectedUniv ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {selectedUniv || "학교를 선택해주세요"}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUnivList ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showUnivList && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {UNIVERSITIES.map((univ) => (
                        <button
                          key={univ}
                          onClick={() => {
                            setSelectedUniv(univ);
                            setShowUnivList(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-all border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-900">{univ}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={handleVerifySchool}
              disabled={!selectedUniv}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Verify Email Screen
  if (step === "verify-email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setStep("verify-school")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">이메일 인증</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            className="w-full max-w-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">인증 코드</label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-center text-lg font-semibold tracking-widest"
              />
            </div>

            <button
              onClick={handleVerifyEmail}
              disabled={verifyCode.length < 6 || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "확인 중..." : "확인"}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">가입 완료!</h1>
          <p className="text-gray-600 mb-8">UniFind에 오신 것을 환영합니다</p>

          <button
            onClick={handleComplete}
            className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            시작하기
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
