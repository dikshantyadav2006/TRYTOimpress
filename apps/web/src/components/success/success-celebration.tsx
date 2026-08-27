"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { ConfettiLayer, HeartRain, MagneticButton, useProposalStore, useQuestionsStore, vibrate } from "@repo/ui";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface SuccessContent {
  heading: string;
  messages: string[];
}

export function SuccessCelebration({ content }: { content: SuccessContent }) {
  const router = useRouter();
  const replay = useProposalStore((state) => state.replay);
  const resetAnswers = useQuestionsStore((state) => state.reset);

  const messages = content.messages;

  const onReplay = () => {
    vibrate(12);
    replay();
    resetAnswers();
    router.push("/");
  };

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <ConfettiLayer duration={4200} particleCount={70} />
      <HeartRain count={24} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl drop-shadow-[0_0_32px_rgba(244,114,182,0.5)] sm:text-8xl"
        >
          💖
        </motion.span>

        <h1 className="text-foreground mt-8 font-display text-6xl sm:text-8xl">{content.heading}</h1>

        <div className="mt-8 space-y-2">
          {messages.map((message, index) => (
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.6 + index * 0.7, duration: 0.8, ease: EASE }}
              className="text-white/75 font-serif text-lg italic sm:text-xl"
            >
              {message}
            </motion.p>
          ))}
        </div>

        <div className="mt-12">
          <MagneticButton>
            <button
              type="button"
              onClick={onReplay}
              className="relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-9 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset shadow-[0_8px_32px_-12px_rgba(244,114,182,0.55)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              Replay from the start 🔁
            </button>
          </MagneticButton>
        </div>
      </motion.div>
    </main>
  );
}
