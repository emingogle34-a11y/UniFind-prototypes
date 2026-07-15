import { useEffect, useState } from "react";
import type { MotionProps, Variants } from "framer-motion";

export const motionEase = {
  out: [0.22, 1, 0.36, 1],
  in: [0.4, 0, 1, 1],
  emphasized: [0.16, 1, 0.3, 1],
} as const;

export const motionDuration = {
  fast: 0.16,
  normal: 0.28,
  slow: 0.38,
} as const;

export const motionTransition = {
  fast: { duration: motionDuration.fast, ease: motionEase.out },
  normal: { duration: motionDuration.normal, ease: motionEase.out },
  slow: { duration: motionDuration.slow, ease: motionEase.out },
} as const;

export const pageMotion: Variants = {
  initial: { opacity: 0, x: 18 },
  animate: {
    opacity: 1,
    x: 0,
    transition: motionTransition.normal,
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.18, ease: motionEase.in },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

export const riseItem: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.26, ease: motionEase.out },
  },
};

export const softPop: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 360, damping: 26 },
  },
};

export const tapMotion = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 420, damping: 30 },
} satisfies Pick<MotionProps, "whileTap" | "transition">;

export function useCountUp(value: number, duration = 700) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return displayValue;
}
