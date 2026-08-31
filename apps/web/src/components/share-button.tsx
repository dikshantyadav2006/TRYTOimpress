"use client";

import { useEffect, useState } from "react";

import { cn } from "@repo/ui";

export interface ShareButtonProps {
  className?: string;
  label?: string;
}

export function ShareButton({ className, label = "share this page" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        setCopied(true);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/55 ring-1 ring-white/15 transition-all duration-300 hover:bg-white/5 hover:text-white/80 hover:ring-white/30 active:scale-[0.97]",
        className,
      )}
    >
      {copied ? (
        <>
          <span aria-hidden>✓</span>
          link copied
        </>
      ) : (
        <>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.59 13.51 6.83 3.98" />
            <path d="m15.41 6.51-6.82 3.98" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
