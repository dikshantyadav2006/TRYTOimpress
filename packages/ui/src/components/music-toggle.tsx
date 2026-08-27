"use client";

import { useEffect, useState } from "react";

import { cn } from "../lib/cn";
import { vibrate } from "../lib/haptics";
import { useMusicStore } from "./music-provider";

export interface MusicToggleProps {
  className?: string;
}

export function MusicToggle({ className }: MusicToggleProps) {
  const enabled = useMusicStore((state) => state.enabled);
  const toggle = useMusicStore((state) => state.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Turn background music off" : "Turn background music on"}
      onClick={() => {
        vibrate(6);
        toggle();
      }}
      className={cn(
        "bg-surface/70 text-foreground fixed right-4 top-4 z-[90] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-lg backdrop-blur-md transition-transform active:scale-90",
        className,
      )}
    >
      {mounted ? (enabled ? "🎵" : "🔇") : "🔇"}
    </button>
  );
}
