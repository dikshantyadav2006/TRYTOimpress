"use client";

import { useState } from "react";

import type { LoveNote } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

export interface LoveJarProps {
  notes: LoveNote[];
}

export function LoveJar({ notes }: LoveJarProps) {
  const [current, setCurrent] = useState<LoveNote | null>(null);
  const [pulled, setPulled] = useState<string[]>([]);
  const [pulling, setPulling] = useState(false);

  if (notes.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🫙</p>
          <p className="text-white/50 mt-6 font-serif italic">
            The jar is empty for now. Add a note, and I&apos;ll fill it back up.
          </p>
        </div>
      </section>
    );
  }

  const remaining = notes.filter((note) => !pulled.includes(note.id));
  const pool = remaining.length > 0 ? remaining : notes;

  const reachIn = () => {
    if (pulling) return;
    setPulling(true);
    const note = pool[Math.floor(Math.random() * pool.length)];
    if (!note) return;
    setCurrent(null);
    window.setTimeout(() => {
      setCurrent(note);
      setPulled((list) => [note.id, ...list]);
      setPulling(false);
    }, 550);
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-12 text-center shadow-2xl shadow-rose-950/30">
        <motion.button
          type="button"
          onClick={reachIn}
          disabled={pulling}
          aria-label="Reach into the jar"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative mx-auto flex h-52 w-56 cursor-pointer select-none items-end justify-center"
        >
          <span
            aria-hidden
            className="bg-linear-to-b from-rose-500/80 to-pink-500/80 absolute top-2 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[1.5rem_1.5rem_0.4rem_0.4rem] ring-1 ring-white/20 ring-inset transition-transform duration-300 group-hover:rotate-2"
          />
          <span
            aria-hidden
            className="border-white/15 relative flex h-40 w-44 items-start justify-center rounded-b-[3rem] border bg-white/[0.06] shadow-[inset_0_20px_40px_-20px_rgba(244,114,182,0.5)] backdrop-blur-sm"
          >
            {pool.map((note, index) => (
              <motion.span
                key={note.id}
                aria-hidden
                className="absolute top-3 h-4 w-7 rounded-sm bg-linear-to-br from-rose-300/80 to-pink-300/80"
                style={{ left: `${18 + (index * 37) % 60}%`, rotate: `${-14 + (index * 23) % 28}deg` }}
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 3 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            {pulling && (
              <motion.span
                aria-hidden
                className="absolute top-2 h-5 w-8 rounded-sm bg-linear-to-br from-amber-200 to-rose-200 shadow-lg"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -90, opacity: 0, rotate: 8 }}
                transition={{ duration: 0.55, ease: "easeIn" }}
              />
            )}
          </span>
          <span className="text-white/40 absolute -bottom-7 text-[11px] uppercase tracking-[0.3em] transition-colors group-hover:text-rose-300/80">
            {pulling ? "reaching in…" : "tap the jar"}
          </span>
        </motion.button>

        <div className="mt-16 min-h-40">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 24, rotate: -2, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, rotate: 3, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative mx-auto max-w-sm rounded-2xl border border-rose-300/20 bg-linear-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-xl shadow-rose-950/20"
              >
                <span className="absolute -top-3 -right-2 rotate-12 text-2xl">📄</span>
                <p className="text-2xl">{current.emoji}</p>
                <p className="text-foreground/90 mt-3 font-serif text-lg italic leading-relaxed">
                  “{current.text}”
                </p>
                <button
                  type="button"
                  onClick={reachIn}
                  className="text-rose-300/80 mt-5 cursor-pointer text-xs uppercase tracking-[0.25em] transition-colors hover:text-rose-200"
                >
                  {remaining.length > 0 ? "one more, please" : "refill my heart"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-white/30 text-xs">
          {remaining.length > 0
            ? `${remaining.length} little note${remaining.length === 1 ? "" : "s"} still waiting in the jar`
            : "you found them all — I'll write you more"}
        </p>
      </div>
    </section>
  );
}
