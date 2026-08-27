"use client";

import { useEffect, useMemo, useState } from "react";

import type { Capsule } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

export interface TimeCapsuleProps {
  capsules: Capsule[];
}

function daysUntil(unlockDate: string, now: Date): number {
  const target = new Date(`${unlockDate}T23:59:59`);
  if (Number.isNaN(target.getTime())) return 0;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

function formatDate(unlockDate: string): string {
  const date = new Date(`${unlockDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return unlockDate;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TimeCapsule({ capsules }: TimeCapsuleProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const sorted = useMemo(() => [...capsules].sort((a, b) => a.order - b.order), [capsules]);

  if (capsules.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">⏳</p>
          <p className="text-white/50 mt-6 font-serif italic">
            Nothing buried yet. The first message is always the hardest to write.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((capsule, index) => {
          const unlocked = now ? now.getTime() >= new Date(`${capsule.unlockDate}T00:00:00`).getTime() : false;
          const isOpened = Boolean(opened[capsule.id]);

          if (unlocked) {
            const showMessage = isOpened;
            return (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (index % 2) * 0.08 }}
                className="overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-500/5 shadow-xl shadow-amber-950/20"
              >
                <div className="flex items-center gap-3 px-5 pt-5">
                  <motion.span
                    animate={showMessage ? { rotate: -24, y: -2 } : { rotate: 0 }}
                    className="text-2xl"
                  >
                    📜
                  </motion.span>
                  <div>
                    <p className="text-foreground font-serif text-lg">{capsule.title}</p>
                    <p className="text-amber-200/60 text-[11px] uppercase tracking-[0.2em]">
                      unsealed
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  {showMessage ? (
                    <AnimatePresence>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 mt-3 font-serif text-sm italic leading-relaxed"
                      >
                        {capsule.message}
                      </motion.p>
                    </AnimatePresence>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setOpened((state) => ({ ...state, [capsule.id]: true }))
                      }
                      className="text-amber-200/80 mt-3 cursor-pointer text-xs uppercase tracking-[0.25em] transition-colors hover:text-amber-100"
                    >
                      open it
                    </button>
                  )}
                </div>
              </motion.div>
            );
          }

          const days = now ? daysUntil(capsule.unlockDate, now) : 0;

          return (
            <motion.div
              key={capsule.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (index % 2) * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-rose-950/20"
            >
              <span
                aria-hidden
                className="bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(244,114,182,0.1),transparent_70%)] pointer-events-none absolute inset-0"
              />
              <div className="relative flex items-center gap-3">
                <span className="text-2xl">{capsule.emoji}</span>
                <div>
                  <p className="text-foreground/85 font-serif text-lg">{capsule.title}</p>
                  <p className="text-white/40 text-[11px] uppercase tracking-[0.2em]">
                    sealed until {formatDate(capsule.unlockDate)}
                  </p>
                </div>
              </div>
              <div className="relative mt-4 flex items-center gap-3">
                <motion.span
                  aria-hidden
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl"
                >
                  ⏳
                </motion.span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <span className="block h-full w-1/3 rounded-full bg-amber-300/50" />
                </div>
                <span className="text-white/60 text-xs tabular-nums">
                  {days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`}
                </span>
              </div>
              <p className="text-white/30 relative mt-4 text-[11px] italic">
                some things are worth the wait
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
