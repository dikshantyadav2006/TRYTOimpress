"use client";

import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
} as const;

export type ScaleRevealTag = keyof typeof TAGS;

export interface ScaleRevealProps {
  children: ReactNode;
  as?: ScaleRevealTag;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScaleReveal({
  children,
  as = "div",
  delay = 0,
  once = true,
  className,
}: ScaleRevealProps) {
  const MotionTag: ElementType = TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay }}
    >
      {children}
    </MotionTag>
  );
}
