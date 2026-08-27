"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { createPortal } from "react-dom";

import { vibrate } from "@repo/ui";

import { EditableImage } from "@/components/media/editable-image";

import type { GalleryItem } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${direction === "left" ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export interface GalleryModalProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
  onReplaced?: (itemId: string, url: string) => void;
}

export function GalleryModal({ items, index, onClose, onIndex, onReplaced }: GalleryModalProps) {
  const item = items[index];
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

  const goTo = useCallback(
    (next: number) => {
      const clamped = (next + items.length) % items.length;
      setZoom(1);
      onIndex(clamped);
      vibrate(6);
    },
    [items.length, onIndex],
  );

  useEffect(() => {
    setZoom(1);
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, index, goTo]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      setZoom((current) => clamp(current - event.deltaY * 0.01, 1, 4));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const first = event.touches.item(0);
    const second = event.touches.item(1);
    if (event.touches.length === 2 && first && second) {
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
      pinchRef.current = { distance, zoom };
    }
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const first = event.touches.item(0);
    const second = event.touches.item(1);
    if (event.touches.length === 2 && first && second && pinchRef.current) {
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
      const next = pinchRef.current.zoom * (distance / pinchRef.current.distance);
      setZoom(clamp(next, 1, 4));
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  if (!item) return null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg shadow-black/40 backdrop-blur-md transition-colors duration-200 hover:bg-white/25 hover:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 active:scale-90"
      >
        <CloseIcon />
      </button>

      <button
        type="button"
        aria-label="Previous memory"
        onClick={(event) => {
          event.stopPropagation();
          goTo(index - 1);
        }}
        className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-black/40 backdrop-blur-md transition-colors duration-200 hover:bg-white/25 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 active:scale-90 sm:left-5"
      >
        <ChevronIcon direction="left" />
      </button>

      <button
        type="button"
        aria-label="Next memory"
        onClick={(event) => {
          event.stopPropagation();
          goTo(index + 1);
        }}
        className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-black/40 backdrop-blur-md transition-colors duration-200 hover:bg-white/25 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 active:scale-90 sm:right-5"
      >
        <ChevronIcon direction="right" />
      </button>

      <div
        ref={containerRef}
        className="absolute inset-0 z-10 flex items-center justify-center px-14 sm:px-20"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          drag={zoom > 1 ? true : "x"}
          dragConstraints={containerRef}
          dragElastic={zoom > 1 ? 0.08 : 0.12}
          dragSnapToOrigin={zoom <= 1}
          onDragEnd={(_event, info) => {
            if (zoom <= 1) {
              if (info.offset.x < -110) goTo(index + 1);
              else if (info.offset.x > 110) goTo(index - 1);
            }
          }}
          className="relative"
          style={{ scale: zoom }}
        >
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm">
            {item.isVideo ? (
              <motion.video
                src={item.src}
                controls
                autoPlay
                muted
                playsInline
                draggable={false}
                className="max-h-[66vh] w-auto max-w-[72vw] select-none rounded-xl object-contain sm:max-w-[62vw] lg:max-w-[54vw]"
              />
            ) : (
              <EditableImage
                src={item.src}
                target={{ type: "gallery", id: item.id }}
                allowVideo
                className="rounded-xl"
                onReplaced={(url) => onReplaced?.(item.id, url)}
              >
                <motion.img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="max-h-[66vh] w-auto max-w-[72vw] select-none rounded-xl object-contain sm:max-w-[62vw] lg:max-w-[54vw]"
                />
              </EditableImage>
            )}
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-6 text-center">
        <p className="text-sm text-white/90">{item.caption}</p>
        <p className="mt-1 text-xs tabular-nums text-white/45">
          {index + 1} / {items.length} · swipe to browse · pinch to zoom
        </p>
      </div>
    </motion.div>,
    document.body,
  );
}
