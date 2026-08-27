"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  cn,
  FloatingHearts,
  useNoButtonEscape,
  useProposalStore,
  vibrate,
} from "@repo/ui";

import { YouTubeEmbed } from "@/components/songs/youtube-embed";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface ProposalContent {
  title: string;
  message: string;
  hint: string;
  noLabels: string[];
  yesLabel: string;
  youtubeId?: string;
}

export function ProposalExperience({ content }: { content: ProposalContent }) {
  const router = useRouter();
  const fleeCount = useProposalStore((state) => state.noButtonFleeCount);
  const accept = useProposalStore((state) => state.accept);

  const {
    wrapperRef,
    buttonRef,
    wrapperStyle,
    offset,
    onPointerEnter,
    onTouchStart,
    onKeyDown,
  } = useNoButtonEscape();

  const noLabels = content.noLabels;
  const yesScale = 1 + Math.min(fleeCount, 6) * 0.14;
  const noLabel = noLabels[Math.min(fleeCount, noLabels.length - 1)] ?? "No";

  const onYes = () => {
    vibrate(30);
    accept();
    router.push("/yes");
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <FloatingHearts count={14} />
      <div
        aria-hidden
        className="bg-[radial-gradient(circle_at_50%_30%,rgba(244,114,182,0.14),transparent_55%)] pointer-events-none absolute inset-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="border-white/10 bg-white/[0.04] relative z-10 w-full max-w-lg rounded-3xl border p-8 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-xl sm:p-12"
      >
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block text-6xl drop-shadow-[0_0_24px_rgba(244,114,182,0.4)]"
        >
          💍
        </motion.span>

        <h1 className="text-foreground mt-6 font-display text-5xl sm:text-6xl">
          {content.title}
        </h1>
        <p className="text-white/60 mt-4 font-serif text-lg italic leading-relaxed">
          {content.message}
        </p>

        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
          <motion.button
            type="button"
            onClick={onYes}
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.04 }}
            whileTap={{ scale: yesScale * 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="relative select-none rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_8px_32px_-12px_rgba(244,114,182,0.7)] ring-1 ring-white/25 ring-inset"
          >
            {content.yesLabel}
          </motion.button>

          <div ref={wrapperRef} style={wrapperStyle} className="relative inline-block">
            <motion.button
              ref={buttonRef}
              type="button"
              aria-label="Decline"
              animate={{ x: offset.x, y: offset.y }}
              transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.7 }}
              onPointerEnter={onPointerEnter}
              onTouchStart={onTouchStart}
              onKeyDown={onKeyDown}
              onClick={onKeyDown}
              className={cn(
                "border-white/15 bg-surface/60 text-foreground/70 select-none rounded-full border px-8 py-4 text-base font-semibold backdrop-blur-md",
              )}
            >
              {noLabel}
            </motion.button>
          </div>
        </div>

        <p className="text-white/30 mt-8 text-[11px] uppercase tracking-[0.3em]">{content.hint}</p>
      </motion.div>

      {content.youtubeId && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="relative z-10 mt-10 w-full max-w-sm"
        >
          <p className="text-white/35 mb-3 text-[11px] uppercase tracking-[0.35em]">
            play our song 🎵
          </p>
          <YouTubeEmbed videoId={content.youtubeId} title="Our song" />
        </motion.div>
      )}
    </main>
  );
}
