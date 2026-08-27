"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import type { Memory } from "@repo/shared";
import { cn, ParallaxImage, ScaleReveal, TextReveal } from "@repo/ui";

import { EditableImage } from "@/components/media/editable-image";

export interface StoryTimelineProps {
  memories: Memory[];
}

export function StoryTimeline({ memories }: StoryTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Memory[]>(memories);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.65", "end 0.5"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-3xl px-6 pb-4">
      <div className="absolute left-4 top-0 h-full w-px bg-white/[0.07] sm:left-1/2" />
      <motion.div
        aria-hidden
        style={{ scaleY, originY: 0 }}
        className="via-pink-400 absolute left-4 top-0 h-full w-px bg-linear-to-b from-rose-400 to-rose-500/70 sm:left-1/2"
      />

      <ol className="relative space-y-24 pt-8 sm:space-y-28">
        {items.map((memory, index) => {
          const alignRight = index % 2 === 1;

          return (
            <li key={memory.id} className="relative">
              <span
                aria-hidden
                className="bg-background absolute left-4 top-8 h-3 w-3 -translate-x-1/2 rounded-full border border-rose-400/70 shadow-[0_0_0_5px_rgba(244,114,182,0.1)] sm:left-1/2"
              />

              <div
                className={cn(
                  "pl-12 sm:w-[calc(50%-2.5rem)] sm:pl-0",
                  alignRight ? "sm:ml-auto" : "",
                )}
              >
                {memory.imageUrl ? (
                  <ScaleReveal>
                    <EditableImage
                      src={memory.imageUrl}
                      target={{ type: "memory", id: memory.id }}
                      className="rounded-2xl"
                      onReplaced={(url) =>
                        setItems((previous) =>
                          previous.map((item) =>
                            item.id === memory.id ? { ...item, imageUrl: url } : item,
                          ),
                        )
                      }
                    >
                      <ParallaxImage
                        src={memory.imageUrl}
                        alt={memory.title}
                        loading="lazy"
                        strength={20}
                        className="rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/10"
                        imgClassName="h-52 sm:h-64"
                      />
                    </EditableImage>
                  </ScaleReveal>
                ) : (
                  <div
                    aria-hidden
                    className="border-white/10 bg-white/[0.03] flex h-32 items-center justify-center rounded-2xl border sm:h-40"
                  >
                    <span className="text-4xl">💌</span>
                  </div>
                )}

                <p className="text-rose-300/80 mt-6 text-[11px] font-medium uppercase tracking-[0.3em]">
                  {memory.date}
                </p>
                <TextReveal as="h2" className="text-foreground mt-2 font-serif text-2xl sm:text-3xl">
                  {memory.title}
                </TextReveal>
                <TextReveal
                  as="p"
                  delay={0.12}
                  className="text-white/60 mt-3 leading-relaxed"
                >
                  {memory.caption}
                </TextReveal>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
