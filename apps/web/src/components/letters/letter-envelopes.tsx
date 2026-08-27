"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Letter } from "@repo/shared";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface LetterEnvelopesProps {
  letters: Letter[];
}

export function LetterEnvelopes({ letters }: LetterEnvelopesProps) {
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);

  useEffect(() => {
    document.body.style.overflow = openLetter ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openLetter]);

  if (letters.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-6 pb-4">
      <p className="text-white/40 mb-8 text-center font-serif text-lg italic">
        pick an envelope — the right words are already waiting inside
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {letters.map((letter, index) => (
          <motion.button
            key={letter.id}
            type="button"
            onClick={() => setOpenLetter(letter)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: EASE }}
            whileHover={{ y: -6, rotate: -0.5 }}
            whileTap={{ scale: 0.97 }}
            className="group text-left"
          >
            <div className="bg-linear-to-br from-rose-500/[0.08] to-pink-500/[0.03] relative h-44 overflow-hidden rounded-3xl border border-white/10 p-5 shadow-lg shadow-black/20 transition-colors duration-500 hover:border-rose-300/30">
              <div className="border-rose-300/10 bg-white/[0.03] absolute inset-x-0 top-0 h-1/2 border-b" />
              <span
                aria-hidden
                className="text-rose-300/15 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl"
              >
                💌
              </span>

              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <span className="text-3xl">{letter.emoji}</span>
                <p className="text-foreground mt-3 font-serif text-lg leading-snug">
                  {letter.title}
                </p>
                <span className="bg-linear-to-br from-rose-500 to-pink-600 mt-4 flex h-8 w-8 rotate-45 items-center justify-center rounded-full shadow-lg shadow-rose-900/50">
                  <span className="-rotate-45 text-sm text-white">❤️</span>
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Close letter"
              onClick={() => setOpenLetter(null)}
              className="bg-black/70 absolute inset-0 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#faf6ee] p-8 text-stone-800 shadow-2xl shadow-black/50 sm:p-10"
            >
              <div className="bg-rose-300/15 absolute inset-x-0 top-0 h-1.5" />
              <div className="absolute right-7 top-7 h-10 w-10 rounded-full bg-linear-to-br from-rose-500 to-pink-600 opacity-90 shadow-lg shadow-rose-900/40" />
              <div className="absolute right-[2.05rem] top-[2.05rem] text-white">
                <span className="text-sm">L</span>
              </div>

              <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-rose-700/70">
                a letter for you
              </p>
              <h3 className="mt-3 pr-10 font-display text-3xl leading-tight text-stone-900">
                {openLetter.title}
              </h3>
              <div className="via-rose-300 mt-5 h-px w-full bg-linear-to-r from-transparent to-transparent" />

              <p className="mt-5 whitespace-pre-line font-serif text-[1.05rem] leading-[1.85] text-stone-700">
                {openLetter.message}
              </p>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200 pt-5">
                <p className="font-serif text-sm italic text-stone-400">yours, always ❤️</p>
                <button
                  type="button"
                  onClick={() => setOpenLetter(null)}
                  className="rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-900/30 transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  Seal it again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
