"use client";

import { motion } from "framer-motion";

export interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = "Something special is loading…" }: LoadingScreenProps) {
  return (
    <div className="bg-background fixed inset-0 z-[110] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.22, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        💖
      </motion.div>
      <div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full w-1/2 rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-pink-300"
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}
