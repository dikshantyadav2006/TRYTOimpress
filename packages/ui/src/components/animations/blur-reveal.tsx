"use client";

import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { EASE } from "../../lib/motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
} as const;

export type BlurRevealTag = keyof typeof TAGS;

export interface BlurRevealProps {
  children: ReactNode;
  as?: BlurRevealTag;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function BlurReveal({
  children,
  as = "div",
  delay = 0,
  duration = 1,
  once = true,
  className,
}: BlurRevealProps) {
  const MotionTag: ElementType = TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
