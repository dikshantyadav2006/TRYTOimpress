"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Song } from "@repo/shared";
import { getYouTubeThumbnail } from "@repo/shared";
import { vibrate } from "@repo/ui";

import { YouTubeEmbed } from "./youtube-embed";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.74l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function SongModal({ song, onClose }: { song: Song; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${song.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close player"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="bg-white/10 hover:bg-white/20 border-white/20 absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border text-white shadow-lg shadow-black/40 backdrop-blur-md transition-colors duration-200 focus:outline-none active:scale-90"
      >
        <CloseIcon />
      </button>

      <div
        className="w-full max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
          className="bg-white/[0.05] border-white/15 overflow-hidden rounded-3xl border p-2.5 shadow-2xl shadow-black/60 backdrop-blur-sm"
        >
          <YouTubeEmbed videoId={song.youtubeId} title={song.title} />
        </motion.div>

        <div className="mt-6 text-center">
          <h3 className="text-foreground font-serif text-3xl sm:text-4xl">{song.title}</h3>
          <p className="text-white/55 mt-1">{song.artist}</p>
          {song.note && <p className="text-white/45 mx-auto mt-3 max-w-md text-sm">{song.note}</p>}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

export function SongsDeck({ songs }: { songs: Song[] }) {
  const [active, setActive] = useState<Song | null>(null);

  if (songs.length === 0) {
    return (
      <p className="text-white/50 mx-auto max-w-md px-6 pb-10 pt-4 text-center font-serif italic">
        No songs here yet — check back soon. 🎵
      </p>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-4xl gap-5 px-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((song, index) => (
          <motion.button
            key={song.id}
            type="button"
            onClick={() => {
              setActive(song);
              vibrate(8);
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: index * 0.07, ease: EASE }}
            className="border-white/10 bg-white/[0.02] hover:border-rose-400/30 hover:bg-white/[0.04] group cursor-pointer rounded-2xl border p-4 text-left shadow-lg shadow-black/20 transition-colors duration-300"
          >
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getYouTubeThumbnail(song.youtubeId)}
                alt={`${song.title} cover`}
                loading="lazy"
                className="aspect-video w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="bg-rose-500 text-white flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_28px_-8px_rgba(244,63,94,0.8)] ring-1 ring-white/30 ring-inset transition-transform duration-300 group-hover:scale-110">
                  <PlayIcon />
                </span>
              </span>
            </div>
            <h3 className="text-foreground mt-4 font-serif text-2xl leading-tight">{song.title}</h3>
            <p className="mt-0.5 text-sm text-white/55">{song.artist}</p>
            {song.note && <p className="text-white/40 mt-2 line-clamp-2 text-xs">{song.note}</p>}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && <SongModal song={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  );
}
