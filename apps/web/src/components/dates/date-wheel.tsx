"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { DateIdea } from "@repo/shared";
import { cn, vibrate } from "@repo/ui";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TAG_STYLES: Record<string, string> = {
  free: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  home: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  sweet: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  adventure: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  silly: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  cozy: "border-orange-400/30 bg-orange-400/10 text-orange-300",
};

const FALLBACK_TAG = "border-white/15 bg-white/5 text-white/60";

export interface DateWheelProps {
  dates: DateIdea[];
}

export function DateWheel({ dates }: DateWheelProps) {
  const [picked, setPicked] = useState<DateIdea | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinEmoji, setSpinEmoji] = useState("🎰");
  const [history, setHistory] = useState<DateIdea[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  if (dates.length === 0) return null;

  const draw = () => {
    if (spinning) return;
    setPicked(null);
    setSpinning(true);
    vibrate(15);

    let cycles = 0;
    const interval = window.setInterval(() => {
      setSpinEmoji(dates[Math.floor(Math.random() * dates.length)]?.emoji ?? "✨");
      cycles += 1;
      if (cycles >= 16) {
        window.clearInterval(interval);
        timerRef.current = null;
        const chosen = dates[Math.floor(Math.random() * dates.length)] ?? dates[0]!;
        setPicked(chosen);
        setHistory((current) => [chosen, ...current]);
        setSpinning(false);
      }
    }, 90);
    timerRef.current = interval;
  };

  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 pb-4">
      <div className="relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] px-6 py-12 text-center shadow-2xl shadow-rose-950/20">
        <div
          aria-hidden
          className="bg-[radial-gradient(ellipse_55%_50%_at_50%_0%,rgba(244,114,182,0.1),transparent_70%)] pointer-events-none absolute inset-0"
        />

        <AnimatePresence mode="wait">
          {spinning ? (
            <motion.div
              key="spinning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative flex flex-col items-center"
            >
              <motion.span
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl"
              >
                {spinEmoji}
              </motion.span>
              <p className="text-white/55 mt-8 font-serif text-lg italic">
                the universe is deciding…
              </p>
            </motion.div>
          ) : picked ? (
            <motion.div
              key="picked"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative flex max-w-md flex-col items-center"
            >
              <motion.span
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl drop-shadow-[0_0_28px_rgba(244,114,182,0.35)]"
              >
                {picked.emoji}
              </motion.span>
              <span
                className={cn(
                  "mt-6 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em]",
                  TAG_STYLES[picked.tag] ?? FALLBACK_TAG,
                )}
              >
                {picked.tag || "our date"}
              </span>
              <h3 className="text-foreground mt-4 font-serif text-3xl sm:text-4xl">
                {picked.title}
              </h3>
              <p className="text-white/60 mt-4 leading-relaxed">{picked.description}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={draw}
                  className="bg-linear-to-r from-rose-500 to-pink-500 rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                >
                  🎲 Surprise us again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(null);
                    setHistory([]);
                  }}
                  className="text-muted-foreground hover:text-white/80 rounded-full px-4 py-3 text-sm transition-colors"
                >
                  start over
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative flex flex-col items-center"
            >
              <span className="text-5xl">🎡</span>
              <h3 className="text-foreground mt-6 font-serif text-3xl sm:text-4xl">
                Surprise us
              </h3>
              <p className="text-white/50 mt-3 max-w-xs font-serif text-lg italic">
                let fate pick our next adventure
              </p>
              <button
                type="button"
                onClick={draw}
                className="group relative mt-8 inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-9 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                Pick a date
              </button>
              <p className="text-white/30 mt-4 text-xs">
                {dates.length} adventures waiting to be drawn
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {history.length > 0 && !spinning && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <p className="text-rose-300/70 mb-4 text-center text-[11px] font-medium uppercase tracking-[0.35em]">
              the dates fate has picked so far
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {history.map((item) => (
                <span
                  key={item.id}
                  className="border-white/10 bg-white/[0.03] flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/70"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
