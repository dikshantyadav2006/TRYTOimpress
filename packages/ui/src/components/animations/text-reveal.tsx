"use client";

import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { EASE } from "../../lib/motion";

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

export type TextRevealTag = keyof typeof TAGS;

export interface TextRevealProps {
  children: ReactNode;
  as?: TextRevealTag;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

export function TextReveal({
  children,
  as = "div",
  delay = 0,
  duration = 0.9,
  once = true,
  className,
}: TextRevealProps) {
  const MotionTag: ElementType = TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.35 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
