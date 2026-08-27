"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Compliment } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

const HEART_COLORS = ["text-rose-300", "text-pink-300", "text-fuchsia-300", "text-rose-400"];

interface HeartBurst {
  id: string;
  text: string;
  emoji: string;
  hearts: { id: number; x: number; delay: number; color: string; size: number }[];
}

export interface ComplimentShowerProps {
  compliments: Compliment[];
}

export function ComplimentShower({ compliments }: ComplimentShowerProps) {
  const [bursts, setBursts] = useState<HeartBurst[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [showering, setShowering] = useState(false);

  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        x: (index - 6) * 26 + (Math.random() * 40 - 20),
        delay: Math.random() * 0.2,
        color: HEART_COLORS[index % HEART_COLORS.length] ?? "text-rose-300",
        size: 16 + Math.random() * 14,
      })),
    [],
  );

  const burst = useCallback(
    (compliment: Compliment) => {
      const id = `${compliment.id}-${Date.now()}`;
      setBursts((list) => [{ id, text: compliment.text, emoji: compliment.emoji, hearts }, ...list]);
      window.setTimeout(() => {
        setBursts((list) => list.filter((item) => item.id !== id));
      }, 2200);
    },
    [hearts],
  );

  const startShower = () => {
    if (showering) return;
    setShowering(true);
    setQueueIndex(0);
  };

  useEffect(() => {
    if (queueIndex < 0) return;
    const compliment = compliments[queueIndex];
    if (!compliment) return;
    burst(compliment);
    if (queueIndex < compliments.length - 1) {
      const timer = window.setTimeout(() => setQueueIndex(queueIndex + 1), 700);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setShowering(false);
      setQueueIndex(-1);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [burst, compliments, queueIndex]);

  if (compliments.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">💬</p>
          <p className="text-white/50 mt-6 font-serif italic">
            No compliments yet. That&apos;s a temporary situation.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="flex items-center justify-center">
        <motion.button
          type="button"
          onClick={startShower}
          disabled={showering}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all hover:brightness-110 disabled:opacity-60"
        >
          {showering ? "showering you…" : "shower me with compliments"}
        </motion.button>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {compliments.map((compliment, index) => (
          <motion.button
            key={compliment.id}
            type="button"
            onClick={() => burst(compliment)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-rose-300/30 hover:bg-white/[0.06]"
          >
            <span className="text-xl">{compliment.emoji}</span>
            <p className="text-foreground/85 mt-2 font-serif text-sm italic leading-relaxed">
              {compliment.text}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {bursts.map((burstItem) => (
          <div key={burstItem.id} className="relative flex h-full items-center justify-center">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15, y: -30 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-3xl border border-rose-300/30 bg-black/70 px-8 py-6 text-center shadow-2xl shadow-rose-950/40 backdrop-blur-md"
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.6, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl"
                >
                  {burstItem.emoji}
                </motion.p>
                <p className="text-foreground mt-3 max-w-xs font-serif text-lg italic">
                  {burstItem.text}
                </p>
              </motion.div>
            </AnimatePresence>
            {burstItem.hearts.map((heart) => (
              <motion.span
                key={heart.id}
                aria-hidden
                className={`absolute text-lg ${heart.color}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: heart.x,
                  y: -140 - Math.abs(heart.x),
                  scale: 1,
                }}
                transition={{ duration: 1.6, delay: heart.delay, ease: "easeOut" }}
              >
                ❤️
              </motion.span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
