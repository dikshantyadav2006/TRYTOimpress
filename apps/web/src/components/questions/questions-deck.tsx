"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Question, QuestionOption } from "@repo/shared";
import { cn, useQuestionsStore, vibrate } from "@repo/ui";

import { CtaLink } from "@/components/cta-link";
import { submitAnswer } from "@/lib/content";
import { siteHref } from "@/lib/site";
import { YouTubeEmbed } from "@/components/songs/youtube-embed";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FLOAT_EMOJIS = ["💕", "✨", "💖", "💫"];

export interface QuestionsDeckProps {
  questions: Question[];
  title: string;
  subtitle?: string | undefined;
  youtubeId?: string;
  slug: string;
}

export function QuestionsDeck({ questions, title, subtitle, youtubeId, slug }: QuestionsDeckProps) {
  const answers = useQuestionsStore((state) => state.answers);
  const setAnswer = useQuestionsStore((state) => state.setAnswer);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState<{ emoji: string; key: number } | null>(null);

  const total = questions.length;
  const question = questions[currentIndex];

  if (total === 0) {
    return (
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-white/40 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.35em]"
        >
          <span aria-hidden className="h-px w-7 bg-white/15" />
          chapter 06 · your turn
          <span aria-hidden className="h-px w-7 bg-white/15" />
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-foreground mt-6 font-display text-5xl sm:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-white/50 mt-3 font-serif text-lg italic"
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
          className="mt-12 flex max-w-sm flex-col items-center"
        >
          <span aria-hidden className="text-5xl">
            💬
          </span>
          <p className="text-white/55 mt-5 font-serif text-lg italic leading-relaxed">
            These questions are still being written. Come back soon — there&apos;s
            more to ask.
          </p>
          <div className="mt-9">
            <CtaLink href={siteHref(slug, "/love-meter")} label="Keep going" />
          </div>
        </motion.div>
      </div>
    );
  }

  const choose = (option: QuestionOption) => {
    if (!question || answers[question.id]) return;
    setAnswer(question.id, option.id);
    vibrate(8);
    setBurst({ emoji: option.emoji, key: Date.now() });
    void submitAnswer(slug, question.id, option.id).catch((error: unknown) => {
      console.error("Failed to save answer", { questionId: question.id, optionId: option.id }, error);
    });

    window.setTimeout(() => {
      setBurst(null);
      if (currentIndex < total - 1) {
        setCurrentIndex((index) => index + 1);
      } else {
        setFinished(true);
      }
    }, 700);
  };

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <header className="mx-auto w-full max-w-xl px-6 pb-4 pt-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-white/40 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.35em]"
        >
          <span aria-hidden className="h-px w-7 bg-white/15" />
          chapter 06 · your turn
          <span aria-hidden className="h-px w-7 bg-white/15" />
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-foreground mt-6 font-display text-5xl sm:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="text-white/50 mt-3 font-serif text-lg italic"
        >
          {subtitle}
        </motion.p>

        <div className="mx-auto mt-8 flex max-w-xs items-center gap-1.5">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                index <= currentIndex || answers[questions[index]?.id ?? ""]
                  ? index === currentIndex && !answers[questions[index]?.id ?? ""]
                    ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"
                    : "bg-rose-400/45"
                  : "bg-white/10",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/30">
          {finished ? "all answered" : `question ${currentIndex + 1} of ${total}`}
        </p>

        {youtubeId && (
          <div className="mx-auto mt-10 w-full max-w-xs">
            <YouTubeEmbed videoId={youtubeId} title="Our song" />
          </div>
        )}
      </header>

      <main className="relative flex-1 overflow-hidden">
        <motion.div
          className="flex w-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
        >
          {questions.map((item) => (
            <div key={item.id} className="h-full w-full shrink-0 px-4 sm:px-6">
              <div className="flex h-full overflow-y-auto">
                <div className="m-auto flex w-full max-w-md flex-col items-center py-8 text-center">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="mb-6 w-28 rounded-2xl ring-1 ring-rose-400/20 shadow-lg shadow-rose-950/40 sm:w-32"
                    />
                  ) : null}
                  <span className="text-5xl sm:text-6xl">{item.emoji}</span>
                  <h2 className="text-foreground mt-5 font-serif text-3xl sm:text-4xl">
                    {item.title}
                  </h2>
                  <p className="text-white/55 mt-2">{item.subtitle}</p>

                  <div className="mt-7 grid w-full gap-3">
                    {item.options.map((option) => {
                      const selected = answers[item.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => choose(option)}
                          disabled={Boolean(answers[item.id])}
                          className={cn(
                            "border-white/10 bg-white/[0.02] hover:border-rose-300/40 flex items-center justify-between rounded-xl border px-5 py-4 text-left text-base transition-all duration-300",
                            selected &&
                              "border-rose-400/60 bg-rose-500/10 text-rose-100 shadow-[0_0_28px_-10px_rgba(244,114,182,0.5)]",
                            answers[item.id] && !selected && "opacity-40",
                          )}
                        >
                          <span>{option.label}</span>
                          <span aria-hidden className="text-2xl">
                            {option.emoji}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <AnimatePresence>
          {burst && (
            <motion.div
              key={burst.key}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="text-8xl drop-shadow-[0_0_30px_rgba(244,114,182,0.5)]"
                initial={{ scale: 0.2, rotate: -12 }}
                animate={{ scale: [0.2, 1.3, 1], rotate: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {burst.emoji}
              </motion.span>
              {FLOAT_EMOJIS.map((emoji, index) => (
                <motion.span
                  key={emoji}
                  className="absolute text-2xl"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                  animate={{
                    x: Math.cos((index / FLOAT_EMOJIS.length) * Math.PI * 2) * 90,
                    y: -60 - (index % 2) * 30,
                    opacity: 0,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {finished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="bg-background/75 absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center backdrop-blur-xl"
            >
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                💍
              </motion.span>
              <h2 className="text-foreground mt-8 font-display text-5xl sm:text-6xl">
                You answered everything
              </h2>
              <p className="text-white/55 mt-4 max-w-sm font-serif text-lg italic">
                Your answers are locked in. But the story isn&apos;t over yet — not by a long way.
              </p>
              <div className="mt-10">
                <CtaLink href={siteHref(slug, "/love-meter")} label="Keep going" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
