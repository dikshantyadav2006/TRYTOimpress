"use client";

import { motion } from "framer-motion";

import { useNoButtonEscape } from "../hooks/use-no-button-escape";
import { cn } from "../lib/cn";

const LABELS = [
  "No",
  "Are you sure?",
  "Really? 🥺",
  "Think again 💭",
  "Nope 🫣",
  "Last chance 💔",
  "No means yes? 😏",
];

export function NoButton() {
  const {
    isFleeing,
    fleeCount,
    wrapperRef,
    buttonRef,
    wrapperStyle,
    offset,
    onPointerEnter,
    onTouchStart,
    onKeyDown,
  } = useNoButtonEscape();

  const label = LABELS[Math.min(fleeCount, LABELS.length - 1)];

  return (
    <div ref={wrapperRef} style={wrapperStyle} className="relative inline-block">
      <motion.button
        ref={buttonRef}
        type="button"
        aria-label="Decline"
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.7 }}
        onPointerEnter={onPointerEnter}
        onTouchStart={onTouchStart}
        onKeyDown={onKeyDown}
        onClick={onKeyDown}
        className={cn(
          "bg-surface text-foreground/80 select-none rounded-full border border-white/15 px-8 py-4 text-lg font-semibold shadow-lg shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          isFleeing ? "cursor-default" : "cursor-not-allowed",
        )}
      >
        {label}
      </motion.button>
    </div>
  );
}
