"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export interface ConfettiLayerProps {
  duration?: number;
  particleCount?: number;
}

export function ConfettiLayer({ duration = 2500, particleCount = 55 }: ConfettiLayerProps) {
  useEffect(() => {
    const end = Date.now() + duration;

    const colors = ["#fb7185", "#f472b6", "#e879f9", "#fbbf24", "#34d399", "#60a5fa"];

    const fire = () => {
      confetti({
        particleCount,
        spread: 75,
        startVelocity: 55,
        origin: { y: 0.6 },
        colors,
        zIndex: 999,
      });
      confetti({
        particleCount: Math.round(particleCount * 0.6),
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 999,
      });
      confetti({
        particleCount: Math.round(particleCount * 0.6),
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 999,
      });

      if (Date.now() < end) {
        window.requestAnimationFrame(fire);
      }
    };

    fire();
  }, [duration, particleCount]);

  return null;
}
