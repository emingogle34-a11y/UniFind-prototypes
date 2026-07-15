// UniFind - 스플래시 화면
// Design: Neo-Minimal Korean Fintech, Primary #3182F6, Pretendard font
import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { UNIFIND_LOGO } from "@/lib/data";

export default function SplashScreen() {
  const { setScreen } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("auth");
    }, 2200);
    return () => clearTimeout(timer);
  }, [setScreen]);

  return (
    <div className="uf-mobile-frame flex h-full flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo */}
        <img src={UNIFIND_LOGO} alt="UniFind Logo" className="h-24 w-24 rounded-3xl object-cover shadow-[var(--uf-shadow-card)]" />
        <div className="text-center mt-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            UniFind
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">캠퍼스 분실물 통합 서비스</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--uf-blue)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
