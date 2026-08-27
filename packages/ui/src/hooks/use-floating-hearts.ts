"use client";

import { useMemo } from "react";

const HEART_EMOJIS = ["❤️", "💖", "💕", "🩷", "💗"];

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export interface HeartParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  startY: number;
  emoji: string;
}

export function useFloatingHearts(count = 12): HeartParticle[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        x: random(0, 100),
        size: random(12, 26),
        duration: random(12, 20),
        delay: random(0, 10),
        drift: random(-24, 24),
        opacity: random(0.16, 0.4),
        startY: random(10, 95),
        emoji: HEART_EMOJIS[index % HEART_EMOJIS.length] ?? "❤️",
      })),
    [count],
  );
}
