"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useProposalStore } from "../store/use-proposal-store";

export interface YesButtonProps {
  children?: ReactNode;
}

export function YesButton({ children = "Yes 💖" }: YesButtonProps) {
  const accept = useProposalStore((state) => state.accept);

  return (
    <motion.button
      type="button"
      onClick={accept}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="bg-linear-to-r group relative select-none rounded-full from-pink-500 via-rose-500 to-red-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_10px_40px_-10px_rgba(244,63,94,0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121315]"
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="bg-linear-to-r absolute inset-0 rounded-full from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </motion.button>
  );
}
