"use client";

import { useState } from "react";

import type { Wish } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

const POSITIONS = [
  { left: "24%", top: "6%", rotate: -10 },
  { left: "56%", top: "4%", rotate: 12 },
  { left: "12%", top: "26%", rotate: 14 },
  { left: "40%", top: "18%", rotate: -12 },
  { left: "70%", top: "22%", rotate: -8 },
  { left: "30%", top: "36%", rotate: 10 },
  { left: "62%", top: "34%", rotate: -14 },
  { left: "16%", top: "44%", rotate: -6 },
  { left: "48%", top: "46%", rotate: 8 },
];

export interface WishTreeProps {
  wishes: Wish[];
}

export function WishTree({ wishes }: WishTreeProps) {
  const [selected, setSelected] = useState<Wish | null>(null);

  if (wishes.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🌳</p>
          <p className="text-white/50 mt-6 font-serif italic">The tree is waiting for its first wish.</p>
        </div>
      </section>
    );
  }

  const tags = wishes.map((wish, index) => ({
    wish,
    ...(POSITIONS[index % POSITIONS.length] ?? { left: "50%", top: "30%", rotate: 0 }),
  }));

  return (
    <section className="mx-auto w-full max-w-2xl px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-12 shadow-2xl shadow-rose-950/30">
        <div className="relative mx-auto h-80 max-w-sm">
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-20 w-8 -translate-x-1/2 rounded-b-lg bg-linear-to-b from-[#7c5a3a] to-[#5d4226]"
          />
          <div
            aria-hidden
            className="absolute bottom-16 left-1/2 h-24 w-12 -translate-x-1/2 rounded-b-full bg-linear-to-t from-[#8a6238] to-[#6b4a28]"
          />
          <motion.div
            aria-hidden
            className="absolute top-0 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,0.5),rgba(16,185,129,0.35)_55%,transparent_75%)] blur-[1px]"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute top-14 left-8 h-14 w-10 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(52,211,153,0.4),transparent_70%)]" />
            <span className="absolute top-20 right-6 h-16 w-9 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(52,211,153,0.35),transparent_70%)]" />
          </motion.div>

          {tags.map(({ wish, left, top, rotate }, index) => {
            const active = selected?.id === wish.id;
            return (
              <button
                key={wish.id}
                type="button"
                onClick={() => setSelected(active ? null : wish)}
                aria-label={`Wish: ${wish.text}`}
                className="absolute z-10 cursor-pointer"
                style={{ left, top }}
              >
                <motion.span
                  className="block"
                  animate={{ rotate: [rotate, rotate + 4, rotate] }}
                  transition={{ duration: 3 + (index % 4) * 0.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="mx-auto block h-10 w-px bg-white/30" />
                  <motion.span
                    animate={active ? { scale: 1.15 } : { scale: 1 }}
                    className={`block max-w-24 rounded-lg px-2 py-1.5 text-center text-lg shadow-lg ring-1 ${
                      active
                        ? "bg-rose-500/30 ring-rose-300/60 shadow-rose-500/40"
                        : "bg-white/[0.08] ring-white/20"
                    }`}
                  >
                    {wish.emoji}
                  </motion.span>
                </motion.span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 min-h-28">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="mx-auto max-w-sm rounded-2xl border border-emerald-300/20 bg-emerald-500/5 px-6 py-5 text-center"
              >
                <p className="text-2xl">{selected.emoji}</p>
                <p className="text-foreground/90 mt-2 font-serif text-lg italic leading-relaxed">
                  “{selected.text}”
                </p>
              </motion.div>
            )}
            {!selected && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/40 pt-4 text-center text-sm font-serif italic"
              >
                tap a tag hanging on the tree
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
