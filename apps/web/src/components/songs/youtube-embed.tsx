"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@repo/shared";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.74l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

export interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

export function YouTubeEmbed({ videoId, title = "Song", className }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-xl shadow-black/40 ring-1 ring-white/10 ${className ?? ""}`}
    >
      {playing ? (
        <iframe
          src={`${getYouTubeEmbedUrl(videoId)}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <motion.button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getYouTubeThumbnail(videoId)}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/15" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-rose-500 text-white flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_32px_-8px_rgba(244,63,94,0.8)] ring-1 ring-white/25 ring-inset transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
              <PlayIcon />
            </span>
          </span>
        </motion.button>
      )}
    </div>
  );
}
