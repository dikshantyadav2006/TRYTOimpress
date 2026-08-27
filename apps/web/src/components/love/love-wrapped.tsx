"use client";

import { useCallback, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { CtaLink } from "@/components/cta-link";
import { siteHref } from "@/lib/site";
import { cn } from "@repo/ui";

export interface WrappedStats {
  daysTogether: number | null;
  startLabel?: string;
  reasons: number;
  songs: number;
  dates: number;
  letters: number;
  notes: number;
  compliments: number;
  wishes: number;
  promises: number;
  dreams: number;
  capsules: number;
  surprises: number;
}

interface Slide {
  emoji: string;
  stat: string;
  label: string;
}

function buildSlides(stats: WrappedStats): Slide[] {
  const slides: Slide[] = [
    {
      emoji: "🎬",
      stat: "OUR YEAR, WRAPPED",
      label: "every reason, every song, every little dream — counted, bundled, and tied with a bow.",
    },
    {
      emoji: "📆",
      stat: stats.daysTogether !== null ? `${stats.daysTogether} days` : "every day",
      label: stats.startLabel ? `of loving you since ${stats.startLabel}` : "of loving you, and counting",
    },
    {
      emoji: "❤️",
      stat: `${stats.reasons} reasons`,
      label: "why I love you — and I'm still counting",
    },
    {
      emoji: "🎵",
      stat: `${stats.songs} songs`,
      label: "that remind me of you, on endless repeat",
    },
    {
      emoji: "🗓️",
      stat: `${stats.dates} dates`,
      label: "I can't wait to take you on",
    },
    {
      emoji: "💌",
      stat: `${stats.letters} letters`,
      label: "open-when letters, waiting for the right moment",
    },
    {
      emoji: "🫙",
      stat: `${stats.notes} love notes`,
      label: "hidden in our jar, each one with your name on it",
    },
    {
      emoji: "💬",
      stat: `${stats.compliments} compliments`,
      label: "for the person who deserves every single one",
    },
    {
      emoji: "🌳",
      stat: `${stats.wishes} wishes`,
      label: "hanging on our tree, all wishing for you",
    },
    {
      emoji: "🤝",
      stat: `${stats.promises} promises`,
      label: "that I intend to keep for the rest of my life",
    },
    {
      emoji: "🗺️",
      stat: `${stats.dreams} dreams`,
      label: "on our bucket list, one lifetime to make them true",
    },
    {
      emoji: "⏳",
      stat: `${stats.capsules} time capsules`,
      label: "buried and waiting for future us",
    },
    {
      emoji: "🎁",
      stat: `${stats.surprises} surprises`,
      label: "under the foil and behind the button — all for you",
    },
    {
      emoji: "∞",
      stat: "1 story, still being written",
      label: "the best part is that it's not over yet.",
    },
  ];
  return slides;
}

export interface LoveWrappedProps {
  stats: WrappedStats;
  slug: string;
}

export function LoveWrapped({ stats, slug }: LoveWrappedProps) {
  const slides = buildSlides(stats);
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const advance = useCallback(() => {
    setIndex((current) => (current >= last ? last : current + 1));
  }, [last]);

  const goBack = () => {
    setIndex((current) => (current <= 0 ? 0 : current - 1));
  };

  useEffect(() => {
    if (index >= last) return;
    const timer = window.setTimeout(advance, 5200);
    return () => window.clearTimeout(timer);
  }, [index, last, advance]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <section className="mx-auto w-full max-w-2xl px-6">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-20 text-center shadow-2xl shadow-rose-950/30 sm:py-24"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,114,182,0.14), transparent 70%), linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
        }}
      >
        <div className="relative min-h-56 sm:min-h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.span
                initial={{ scale: 0.5, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="text-6xl sm:text-7xl"
              >
                {slide.emoji}
              </motion.span>
              <p className="text-foreground font-display text-4xl leading-tight sm:text-5xl">
                {slide.stat}
              </p>
              <p className="text-white/60 max-w-sm font-serif text-lg italic leading-relaxed">
                {slide.label}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative mt-10 flex items-center justify-center gap-4">
          {index > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground cursor-pointer text-sm transition-colors hover:text-white/80"
            >
              ← back
            </button>
          )}
          <div className="flex items-center gap-2">
            {slides.map((_, slideIndex) => (
              <span
                key={slideIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  slideIndex === index
                    ? "w-8 bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.7)]"
                    : slideIndex < index
                      ? "w-3 bg-rose-400/40"
                      : "w-3 bg-white/15",
                )}
              />
            ))}
          </div>
          {index < last ? (
            <button
              type="button"
              onClick={advance}
              className="text-rose-300/90 cursor-pointer text-sm uppercase tracking-[0.2em] transition-colors hover:text-rose-200"
            >
              next
            </button>
          ) : (
            <CtaLink href={siteHref(slug, "/proposal")} label="one more question" className="!px-7 !py-2.5 !text-xs" />
          )}
        </div>
      </div>
    </section>
  );
}
