"use client";

import { useState } from "react";

import type { Surprise } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

const CONFETTI_COLORS = ["#fb7185", "#f472b6", "#e879f9", "#facc15", "#34d399", "#60a5fa"];

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotate: number;
  shape: "rect" | "circle";
  size: number;
}

const makeConfetti = (): ConfettiPiece[] =>
  Array.from({ length: 36 }, (_, index) => ({
    id: index,
    x: (index - 18) * 36 + (Math.random() * 60 - 30),
    delay: Math.random() * 0.25,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? "#fb7185",
    rotate: Math.random() * 360,
    shape: index % 3 === 0 ? "circle" : "rect",
    size: 8 + Math.random() * 8,
  }));

export interface SurpriseButtonProps {
  surprises: Surprise[];
}

export function SurpriseButton({ surprises }: SurpriseButtonProps) {
  const [current, setCurrent] = useState<Surprise | null>(null);
  const [pressed, setPressed] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>(makeConfetti);

  if (surprises.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🎁</p>
          <p className="text-white/50 mt-6 font-serif italic">
            The surprise box is empty. Hide something in it first.
          </p>
        </div>
      </section>
    );
  }

  const surpriseMe = () => {
    const pick = surprises[Math.floor(Math.random() * surprises.length)];
    if (!pick) return;
    setCurrent(null);
    setPressed((count) => count + 1);
    setConfetti(makeConfetti());
    window.setTimeout(() => setCurrent(pick), 320);
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-6">
      <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center shadow-2xl shadow-rose-950/30">
        <div
          aria-hidden
          className="bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(244,114,182,0.12),transparent_70%)] pointer-events-none absolute inset-0"
        />

        <motion.div
          key={pressed}
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {confetti.map((piece) => (
            <motion.span
              key={`${pressed}-${piece.id}`}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{
                opacity: 0,
                x: piece.x,
                y: 140 + Math.abs(piece.x) * 0.7,
                rotate: piece.rotate,
                scale: 1,
              }}
              transition={{ duration: 1.4, delay: piece.delay, ease: "easeOut" }}
              style={{
                width: piece.size,
                height: piece.shape === "circle" ? piece.size : piece.size * 1.6,
                borderRadius: piece.shape === "circle" ? "50%" : 2,
                background: piece.color,
              }}
            />
          ))}
        </motion.div>

        <motion.button
          type="button"
          onClick={surpriseMe}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 0 40px 0 rgba(244,114,182,0.35)",
              "0 0 80px 8px rgba(244,114,182,0.55)",
              "0 0 40px 0 rgba(244,114,182,0.35)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto flex h-44 w-44 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-6xl ring-1 ring-white/30 ring-inset shadow-2xl"
          aria-label="Press for a surprise"
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🎁
          </motion.span>
        </motion.button>

        <p className="text-white/40 mt-8 text-[11px] uppercase tracking-[0.3em]">
          press it. I insist.
        </p>

        <div className="mt-8 min-h-32">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="mx-auto max-w-md rounded-2xl border border-rose-300/25 bg-white/[0.04] px-6 py-6"
              >
                <p className="text-3xl">{current.emoji}</p>
                <p className="text-foreground mt-2 font-serif text-xl">{current.title}</p>
                <p className="text-white/70 mt-2 font-serif text-sm italic leading-relaxed">
                  {current.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
