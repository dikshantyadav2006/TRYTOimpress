"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface StargazingProps {
  startDate?: string | undefined;
  startLabel?: string | undefined;
}

export function Stargazing({ startDate, startLabel }: StargazingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rand = mulberry32(hashString(startDate || "our-love-story"));

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let constellation: { x: number; y: number }[] = [];
    let raf = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(60, Math.floor((width * height) / 4200));
      stars = Array.from({ length: count }, () => ({
        x: rand() * width,
        y: rand() * height,
        r: 0.4 + rand() * 1.4,
        phase: rand() * Math.PI * 2,
        speed: 0.5 + rand() * 1.2,
      }));

      constellation = Array.from({ length: 6 }, () => ({
        x: width * (0.1 + rand() * 0.8),
        y: height * (0.12 + rand() * 0.7),
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = time / 1000;

      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.speed + star.phase);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(0.2 + 0.6 * twinkle).toFixed(3)})`;
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(244,114,182,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      constellation.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      for (const point of constellation) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251,113,133,0.1)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251,113,133,0.95)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    build();
    raf = requestAnimationFrame(draw);
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [startDate]);

  return (
    <section className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl shadow-black/40">
      <canvas ref={canvasRef} className="block h-[26rem] w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-3xl">🌠</span>
        <p className="text-white/75 mt-4 max-w-md font-serif text-lg italic leading-relaxed sm:text-xl">
          The night the stars aligned
        </p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.35em] text-rose-300/70">
          our constellation · {startLabel || "forever"}
        </p>
      </div>
    </section>
  );
}
