"use client";

import { useState } from "react";

import type { LovePromise } from "@repo/shared";
import { motion } from "framer-motion";

export interface PromiseCardsProps {
  promises: LovePromise[];
}

export function PromiseCards({ promises }: PromiseCardsProps) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  if (promises.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🤝</p>
          <p className="text-white/50 mt-6 font-serif italic">
            No promises written yet — but there will be.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {promises.map((promise, index) => {
          const isFlipped = Boolean(flipped[promise.id]);
          return (
            <motion.button
              key={promise.id}
              type="button"
              onClick={() =>
                setFlipped((state) => ({ ...state, [promise.id]: !isFlipped }))
              }
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (index % 2) * 0.08 }}
              className="group h-56 cursor-pointer [perspective:1200px]"
              aria-label={isFlipped ? "Promise revealed" : `Flip to see promise: ${promise.title}`}
            >
              <motion.div
                className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-rose-950/20 [backface-visibility:hidden]">
                  <span className="text-4xl">{promise.emoji}</span>
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.3em]">
                    flip me
                  </span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-linear-to-br from-rose-500/20 to-pink-500/10 p-6 text-center shadow-xl shadow-rose-950/30 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-xl">{promise.emoji}</span>
                  <p className="text-foreground font-serif text-xl">{promise.title}</p>
                  <p className="text-white/70 font-serif text-sm italic leading-relaxed">
                    {promise.text}
                  </p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <p className="text-white/30 mt-8 text-center text-xs">
        every card you flip, I mean with my whole heart
      </p>
    </section>
  );
}
