"use client";

import type { Dream } from "@repo/shared";
import { motion } from "framer-motion";

export interface FutureTimelineProps {
  dreams: Dream[];
}

export function FutureTimeline({ dreams }: FutureTimelineProps) {
  if (dreams.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🗺️</p>
          <p className="text-white/50 mt-6 font-serif italic">
            The map is blank for now — every journey starts that way.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="relative">
        <div
          aria-hidden
          className="bg-linear-to-b from-rose-400/40 via-pink-400/30 to-fuchsia-400/40 absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 sm:block"
        />
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-4 w-px bg-linear-to-b from-rose-400/40 via-pink-400/30 to-fuchsia-400/40 sm:hidden"
        />

        <div className="flex flex-col gap-8">
          {dreams.map((dream, index) => {
            const even = index % 2 === 0;
            return (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className={`relative sm:w-1/2 ${even ? "sm:pr-10" : "sm:ml-auto sm:pl-10"} pl-12 sm:pl-0`}
              >
                <span
                  aria-hidden
                  className={`absolute top-6 left-2 h-4 w-4 rounded-full border-2 border-rose-400 bg-black shadow-[0_0_12px_rgba(251,113,133,0.8)] sm:left-auto sm:top-6 ${
                    even ? "sm:-right-2" : "sm:-left-2"
                  }`}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-rose-950/20 transition-colors hover:border-rose-300/25 hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dream.emoji}</span>
                    <p className="text-foreground font-serif text-xl">{dream.title}</p>
                  </div>
                  <p className="text-white/65 mt-3 font-serif text-sm italic leading-relaxed">
                    {dream.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-foreground/70 mt-12 text-center font-serif text-lg italic"
      >
        …and everything else, as long as it&apos;s with you. ∞
      </motion.p>
    </section>
  );
}
