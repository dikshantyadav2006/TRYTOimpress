"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useProposalStore } from "../store/use-proposal-store";
import { Button } from "./button";
import { ConfettiLayer } from "./confetti-layer";
import { FloatingMessages } from "./floating-messages";

const HEART_EMOJIS = ["❤️", "💖", "💕", "🩷", "💗", "❤️‍🔥"];

function HeartBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        const distance = 90 + Math.random() * 120;
        return {
          id: index,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          rotate: (Math.random() - 0.5) * 200,
          size: 16 + Math.random() * 22,
          delay: Math.random() * 0.25,
          emoji: HEART_EMOJIS[index % HEART_EMOJIS.length],
        };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute left-1/2 top-1/2"
          style={{ fontSize: particle.size }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: 1,
            opacity: [1, 1, 0],
            rotate: particle.rotate,
          }}
          transition={{ delay: particle.delay, duration: 1.8, ease: "easeOut" }}
        >
          {particle.emoji}
        </motion.span>
      ))}
    </div>
  );
}

export interface SuccessScreenProps {
  recipientName?: string;
}

export function SuccessScreen({ recipientName }: SuccessScreenProps) {
  const replay = useProposalStore((state) => state.replay);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <ConfettiLayer />
      <HeartBurst />
      <FloatingMessages />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
        className="relative z-30 flex flex-col items-center"
      >
        <motion.span
          className="block text-7xl sm:text-8xl"
          animate={{ scale: [1, 1.18, 1], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          💖
        </motion.span>
        <h2 className="text-foreground mt-6 font-display text-6xl sm:text-8xl">
          {recipientName ? `${recipientName} — it's official!` : "It's official!"}
        </h2>
        <p className="mt-3 max-w-md text-white/60">
          She said yes. This is the start of something beautiful.
        </p>
      </motion.div>
      <div className="relative z-30 mt-10">
        <Button onClick={replay} size="lg">
          Replay from the start 🔁
        </Button>
      </div>
    </motion.div>
  );
}
