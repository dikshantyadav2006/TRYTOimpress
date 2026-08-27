"use client";

import { useEffect, useRef, useState } from "react";

import type { Surprise } from "@repo/shared";
import { AnimatePresence, motion } from "framer-motion";

interface ScratchState {
  revealed: boolean;
  progress: number;
}

function ScratchCard({ surprise, delay }: { surprise: Surprise; delay: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scratchRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<ScratchState>({ revealed: false, progress: 0 });

  const reveal = () => {
    setState((prev) => (prev.revealed ? prev : { revealed: true, progress: 1 }));
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const step = 16;
    let transparent = 0;
    let total = 0;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = data[(y * width + x) * 4 + 3] ?? 0;
        if (alpha < 128) transparent += 1;
        total += 1;
      }
    }
    const ratio = total === 0 ? 0 : transparent / total;
    if (ratio > 0.55) {
      reveal();
    } else {
      setState((prev) => ({ ...prev, progress: Math.min(1, ratio / 0.55) }));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#e7e2f0");
    gradient.addColorStop(0.35, "#b7aed0");
    gradient.addColorStop(0.7, "#d6cfe6");
    gradient.addColorStop(1, "#a89cc4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(0, 0, width, 4);
    ctx.fillRect(0, height - 4, width, 4);
    ctx.font = `600 ${Math.round(width / 9)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("scratch me", width / 2, height / 2);
  }, []);

  const scratchTo = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const px = x - rect.left;
    const py = y - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 30;
    ctx.beginPath();
    if (lastRef.current) {
      ctx.moveTo(lastRef.current.x, lastRef.current.y);
    } else {
      ctx.moveTo(px, py);
    }
    ctx.lineTo(px, py);
    ctx.stroke();
    lastRef.current = { x: px, y: py };
  };

  const endStroke = () => {
    scratchRef.current = false;
    lastRef.current = null;
    checkProgress();
  };

  if (state.revealed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-rose-300/25 bg-linear-to-br from-rose-500/15 to-pink-500/5 p-5 text-center shadow-xl shadow-rose-950/20"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 0.5, delay }}
          className="text-3xl"
        >
          {surprise.emoji}
        </motion.span>
        <p className="text-foreground font-serif text-lg">{surprise.title}</p>
        <p className="text-white/70 font-serif text-sm italic leading-relaxed">
          {surprise.message}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative min-h-44 overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-rose-950/20"
    >
      <div className="bg-linear-to-br from-white/[0.06] to-white/[0.02] absolute inset-0 flex flex-col items-center justify-center gap-1 p-5 text-center">
        <span className="text-3xl">{surprise.emoji}</span>
        <span className="text-white/50 text-xs uppercase tracking-[0.25em]">something for you</span>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          scratchRef.current = true;
          lastRef.current = null;
          scratchTo(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (scratchRef.current) scratchTo(event.clientX, event.clientY);
        }}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onContextMenu={(event) => event.preventDefault()}
        aria-label={`Scratch card: ${surprise.title}`}
      />
      <AnimatePresence>
        {state.progress > 0.05 && state.progress < 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center"
          >
            <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full bg-white/50"
                animate={{ width: `${state.progress * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export interface ScratchCardsProps {
  surprises: Surprise[];
}

export function ScratchCards({ surprises }: ScratchCardsProps) {
  if (surprises.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-5xl">🎟️</p>
          <p className="text-white/50 mt-6 font-serif italic">
            No surprises to scratch yet. Let&apos;s fix that.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {surprises.map((surprise, index) => (
          <ScratchCard key={surprise.id} surprise={surprise} delay={index * 0.06} />
        ))}
      </div>
      <p className="text-white/30 mt-8 text-center text-xs">
        scratch until it sparkles — everything under the foil is yours
      </p>
    </section>
  );
}
