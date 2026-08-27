"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
}

export function FloatingPetals({ count = 14 }: { count?: number }) {
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 13 + Math.random() * 14,
        delay: -Math.random() * 22,
        drift: (Math.random() - 0.5) * 140,
        rotate: Math.random() * 360,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.span
          key={petal.id}
          className="bg-linear-to-br from-rose-300/60 to-pink-400/40 absolute rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
          style={{
            left: `${petal.left}%`,
            width: petal.size,
            height: petal.size * 1.4,
          }}
          initial={{ y: "-8vh", x: 0, rotate: petal.rotate, opacity: 0 }}
          animate={{
            y: "112vh",
            x: petal.drift,
            rotate: petal.rotate + 360,
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
