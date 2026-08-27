"use client";

import { motion } from "framer-motion";

const MESSAGES = ["I knew you'd say yes ❤️", "Best decision ever 💕"];

export function FloatingMessages() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex flex-col items-center gap-3 px-6">
      {MESSAGES.map((message, index) => (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7 + index * 0.45, type: "spring", stiffness: 220, damping: 16 }}
          className="bg-surface text-foreground rounded-full border border-white/10 px-6 py-3 text-center font-serif text-lg shadow-xl shadow-black/40 sm:text-xl"
        >
          {message}
        </motion.p>
      ))}
    </div>
  );
}
