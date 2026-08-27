"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useMounted } from "../../hooks/use-mounted";

const HEART_EMOJIS = ["❤️", "💖", "💕", "🩷", "💗", "💘"];

export interface HeartRainProps {
  count?: number;
  className?: string;
}

export function HeartRain({ count = 26, className }: HeartRainProps) {
  const mounted = useMounted();

  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        size: 16 + Math.random() * 24,
        sway: (Math.random() - 0.5) * 80,
        opacity: 0.35 + Math.random() * 0.45,
        emoji: HEART_EMOJIS[index % HEART_EMOJIS.length] ?? "❤️",
      })),
    [count],
  );

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className ?? ""}`}
    >
      {drops.map((drop) => (
        <motion.span
          key={drop.id}
          className="absolute top-0 select-none"
          style={{ left: `${drop.left}%`, fontSize: drop.size, opacity: drop.opacity }}
          initial={{ y: "-10vh", x: 0 }}
          animate={{ y: "110vh", x: drop.sway }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {drop.emoji}
        </motion.span>
      ))}
    </div>
  );
}
