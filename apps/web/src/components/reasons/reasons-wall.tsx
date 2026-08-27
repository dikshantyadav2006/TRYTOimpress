"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import type { Reason } from "@repo/shared";
import { cn } from "@repo/ui";

import { FloatingPetals } from "@/components/love/floating-petals";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface ReasonsWallProps {
  reasons: Reason[];
}

export function ReasonsWall({ reasons }: ReasonsWallProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const revealedCount = Object.values(revealed).filter(Boolean).length;
  const allRevealed = reasons.length > 0 && revealedCount === reasons.length;

  if (reasons.length === 0) return null;

  const toggle = (id: string) => {
    setRevealed((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 pb-4">
      <FloatingPetals />

      <div className="relative mb-10 text-center">
        <p className="text-rose-300/80 text-[11px] font-medium uppercase tracking-[0.35em]">
          {allRevealed
            ? "every single one — and it still isn't enough"
            : `${revealedCount} of ${reasons.length} reasons revealed`}
        </p>
        <div className="mx-auto mt-4 h-px w-full max-w-sm overflow-hidden bg-white/10">
          <motion.div
            className="bg-linear-to-r from-rose-400 to-pink-400 h-px"
            animate={{ width: `${(revealedCount / reasons.length) * 100}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, index) => {
          const isOpen = Boolean(revealed[reason.id]);
          return (
            <motion.button
              key={reason.id}
              type="button"
              onClick={() => toggle(reason.id)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (index % 3) * 0.07, duration: 0.6, ease: EASE }}
              whileTap={{ scale: 0.98 }}
              className="text-left"
            >
              <motion.div
                animate={{ scale: isOpen ? 1.02 : 1 }}
                className={cn(
                  "flex min-h-52 flex-col rounded-3xl border p-6 transition-colors duration-500",
                  isOpen
                    ? "border-rose-400/40 bg-linear-to-b from-rose-500/[0.1] to-pink-500/[0.03] shadow-[0_0_45px_-15px_rgba(244,114,182,0.55)]"
                    : "border-white/10 bg-white/[0.02] hover:border-rose-300/30 hover:bg-rose-500/[0.04]",
                )}
              >
                {isOpen ? (
                  <div className="flex h-full flex-col">
                    <span className="text-3xl">{reason.emoji}</span>
                    <h3 className="text-foreground mt-4 font-serif text-xl leading-snug">
                      {reason.title}
                    </h3>
                    <p className="text-white/60 mt-2 text-sm leading-relaxed">{reason.detail}</p>
                    <span className="text-rose-300/60 mt-auto pt-5 text-[10px] font-medium uppercase tracking-[0.3em]">
                      reason {index + 1} of {reasons.length}
                    </span>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-3xl opacity-70"
                    >
                      💌
                    </motion.span>
                    <span className="text-white/40 mt-4 text-[11px] font-medium uppercase tracking-[0.3em]">
                      tap to reveal
                    </span>
                    <span className="text-white/25 mt-1.5 font-serif text-sm italic">
                      reason {index + 1}
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
