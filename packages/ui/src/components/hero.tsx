"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { FloatingHearts } from "./floating-hearts";

export interface HeroProps {
  children: ReactNode;
}

export function Hero({ children }: HeroProps) {
  return (
    <section className="bg-background relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <FloatingHearts count={14} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex w-full flex-col items-center"
      >
        {children}
      </motion.div>
    </section>
  );
}
