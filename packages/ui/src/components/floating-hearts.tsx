"use client";

import { motion } from "framer-motion";

import { useFloatingHearts } from "../hooks/use-floating-hearts";
import { useMounted } from "../hooks/use-mounted";

export interface FloatingHeartsProps {
  count?: number;
}

export function FloatingHearts({ count = 12 }: FloatingHeartsProps) {
  const mounted = useMounted();
  const hearts = useFloatingHearts(count);

  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.span
          key={heart.id}
          className="absolute select-none"
          style={{
            left: `${heart.x}%`,
            fontSize: heart.size,
            opacity: heart.opacity,
          }}
          initial={{ y: `${heart.startY}vh`, x: 0, opacity: 0, scale: 1 }}
          animate={{ y: "-12vh", x: heart.drift, opacity: 0 }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            repeatDelay: heart.duration * 0.6,
            ease: "easeInOut",
          }}
        >
          {heart.emoji}
        </motion.span>
      ))}
    </div>
  );
}
