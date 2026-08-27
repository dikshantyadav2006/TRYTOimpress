"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

const OVERFLOW_STEPS = [
  "102%",
  "110%",
  "150%",
  "300%",
  "750%",
  "1,000%",
  "10,000%",
  "1,000,000%",
  "beyond every scale",
  "to the moon and back",
  "and then some",
  "unmeasurable by science",
  "infinity",
];

const MILESTONES: Record<string, string> = {
  "100%": "Wait. That's not the limit. Not even close.",
  "300%": "Still climbing. I warned you.",
  "1,000%": "The meter is panicking. I'm not.",
  "1,000,000%": "There is no number big enough for this.",
  infinity: "I told you. Infinite. ♾️",
};

export interface LoveMeterProps {
  startDate?: string | undefined;
  startLabel?: string | undefined;
}

export function LoveMeter({ startDate, startLabel }: LoveMeterProps) {
  const [level, setLevel] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  const overflowIndex = Math.min(
    Math.floor((tapCount - 1) / 2),
    OVERFLOW_STEPS.length - 1,
  );
  const isInfinite = level >= 100 + OVERFLOW_STEPS.length * 2;
  const fill = Math.min(level, 100);

  const handleTap = () => {
    setTapCount((count) => count + 1);
    setLevel((value) => value + 34 + Math.round(Math.random() * 8));
  };

  const reset = () => {
    setLevel(0);
    setTapCount(0);
  };

  const headline = level < 100 ? `${Math.min(level, 100)}%` : (OVERFLOW_STEPS[overflowIndex] ?? "infinity");
  const message =
    level < 100
      ? "keep going — I have a lot of love to show"
      : (MILESTONES[headline] ?? MILESTONES.infinity);

  return (
    <section className="mx-auto w-full max-w-2xl px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-12 text-center shadow-2xl shadow-rose-950/30">
        <div
          aria-hidden
          className="bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(244,114,182,0.12),transparent_70%)] pointer-events-none absolute inset-0"
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={isInfinite ? "infinity" : headline}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-foreground relative font-display text-7xl tabular-nums sm:text-8xl"
          >
            {isInfinite ? "∞" : headline}
          </motion.p>
        </AnimatePresence>

        <p className="text-white/45 relative mt-3 font-serif text-lg italic sm:text-xl">
          {isInfinite
            ? "There. Science has been outdone."
            : level < 100
              ? startLabel
                ? `${startLabel}, and counting up`
                : "and counting up"
              : message}
        </p>

        <div className="relative mx-auto mt-10 max-w-md">
          <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-rose-500 via-pink-400 to-fuchsia-400 shadow-[0_0_20px_rgba(244,114,182,0.6)]"
              animate={{ width: `${fill}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/30">
            <span>0%</span>
            <span>100%</span>
            <span>∞</span>
          </div>
        </div>

        <div className="relative mt-10 flex items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={handleTap}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all hover:brightness-110"
          >
            {isInfinite ? "still not enough ♾️" : "fill my heart"}
          </motion.button>
          {tapCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-muted-foreground cursor-pointer text-sm transition-colors hover:text-white/80"
            >
              reset
            </button>
          )}
        </div>

        {startDate && (
          <p className="text-white/30 relative mt-6 text-xs">
            daily measurement taken at least 3,000 times a day, forever
          </p>
        )}
      </div>
    </section>
  );
}
