"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FloatingHearts, ImageAsset, MagneticButton, TextReveal, Typing } from "@repo/ui";

import { CtaLink } from "@/components/cta-link";
import { EditableImage } from "@/components/media/editable-image";
import { YouTubeEmbed } from "@/components/songs/youtube-embed";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface LandingContent {
  heroText: string;
  intro: string;
  ctaLabel: string;
  footer: string;
  heroImageUrl?: string;
  youtubeId?: string;
  ctaHref?: string;
}

export function Landing({ content }: { content: LandingContent }) {
  const [stage, setStage] = useState(0);
  const [heroImageUrl, setHeroImageUrl] = useState(content.heroImageUrl);

  useEffect(() => {
    if (stage !== 1) return;
    const timer = window.setTimeout(() => setStage(2), 1300);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <FloatingHearts count={12} />
      <div
        aria-hidden
        className="bg-[radial-gradient(ellipse_50%_42%_at_50%_30%,rgba(244,114,182,0.12),transparent_65%)] pointer-events-none absolute inset-0"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: EASE }}
          className="w-44 sm:w-52"
        >
          {heroImageUrl ? (
            <EditableImage
              src={heroImageUrl}
              target={{ type: "hero" }}
              className="rounded-[2rem]"
              onReplaced={setHeroImageUrl}
            >
              <ImageAsset
                src={heroImageUrl}
                alt="A little memory of us"
                eager
                imgClassName="rounded-[2rem]"
                className="rounded-[2rem] shadow-2xl shadow-rose-950/60 ring-1 ring-white/10"
              />
            </EditableImage>
          ) : (
            <div
              aria-hidden
              className="flex aspect-[4/3] w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03]"
            >
              <span className="text-5xl">💝</span>
            </div>
          )}
        </motion.div>

        <h1 className="text-foreground mt-12 min-h-[4.5rem] font-display text-6xl sm:text-8xl">
          <Typing text={content.heroText} speed={130} onComplete={() => setStage(1)} />
        </h1>

        <AnimatePresence mode="wait">
          {stage >= 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="flex flex-col items-center"
            >
              <span
                aria-hidden
                className="via-rose-400/50 mb-9 mt-2 h-px w-28 bg-linear-to-r from-transparent to-transparent"
              />
              <TextReveal
                as="p"
                delay={0.1}
                className="text-white/65 mx-auto max-w-md font-serif text-xl italic leading-relaxed sm:text-2xl"
              >
                {content.intro}
              </TextReveal>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mt-12 flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <MagneticButton strength={0.3}>
                  <CtaLink href={content.ctaHref ?? "/our-story"} label={content.ctaLabel} />
                </MagneticButton>
              </motion.div>
              {content.footer && (
                <p className="mt-5 text-xs tracking-wide text-white/35">{content.footer}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {content.youtubeId && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mt-14 w-full max-w-sm"
          >
            <p className="text-white/35 mb-3 text-[11px] uppercase tracking-[0.35em]">
              our song 🎵
            </p>
            <YouTubeEmbed videoId={content.youtubeId} title="Our song" />
          </motion.div>
        )}
      </div>
    </main>
  );
}
