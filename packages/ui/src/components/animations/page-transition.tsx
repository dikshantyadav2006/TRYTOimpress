"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { EASE } from "../../lib/motion";

export interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="min-h-svh"
    >
      {children}
    </motion.div>
  );
}
