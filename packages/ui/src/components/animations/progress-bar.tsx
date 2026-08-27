"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { EASE } from "../../lib/motion";
import { useNavigationStore } from "../../store/navigation-store";

export function ProgressBar() {
  const pending = useNavigationStore((state) => state.pending);
  const done = useNavigationStore((state) => state.done);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(done, 800);
    return () => window.clearTimeout(timer);
  }, [pending, done]);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[120] h-px w-full">
      <AnimatePresence>
        {pending && (
          <motion.div
            key="progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ originX: 0 }}
            className="h-full w-full bg-linear-to-r from-rose-500 via-pink-400 to-pink-300"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
