"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import type { Playlist, PlaylistSong } from "@repo/shared";
import { vibrate } from "@repo/ui";

import { trackPlaylist } from "@/lib/track-playlist";
import { PlaylistPlayer, type PlaylistPlayerHandle } from "./playlist-player";
import { PlaylistAudioPlayer, type PlaylistAudioPlayerHandle } from "./playlist-audio-player";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function randomOf<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function overlayRgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return `rgba(0, 0, 0, ${alpha})`;
  const [, r, g, b] = match;
  return `rgba(${Number.parseInt(r!, 16)}, ${Number.parseInt(g!, 16)}, ${Number.parseInt(b!, 16)}, ${alpha})`;
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M20 12H4" />
      <path d="m10 18-6-6 6-6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.74l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <path d="m7 6 7 6-7 6V6Z" />
      <path d="M17 6v12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function LikeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M19 14c1.5-1.5 2-3.2 2-4.9C21 6.6 19.4 5 17.4 5c-1.3 0-2.5.6-3.4 1.6-.9-1-2.1-1.6-3.4-1.6C8.6 5 7 6.6 7 9.1c0 1.7.5 3.4 2 4.9l3 3 7-7Z" />
    </svg>
  );
}

function pickQuotation(items: string[]): string | undefined {
  return randomOf(items);
}

interface Recommendation {
  playlist: Playlist;
  reason: string;
}

export function PlaylistExperience({
  playlist,
  siteSlug,
  allPlaylists,
}: {
  playlist: Playlist;
  siteSlug: string;
  allPlaylists: Playlist[];
}) {
  const [background, setBackground] = useState(() => randomOf(playlist.backgrounds));
  const [quote, setQuote] = useState(() => pickQuotation(playlist.quotes));
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const playerRef = useRef<PlaylistPlayerHandle>(null);
  const audioPlayerRef = useRef<PlaylistAudioPlayerHandle>(null);

  // Audio mode renders the cover-art player; video mode renders playback.
  const isAudio = playlist.mode === "audio";

  const songs = playlist.songs;
  const current = songs[index];
  const atLast = index >= songs.length - 1;
  const totalCount = songs.length;

  useEffect(() => {
    trackPlaylist(siteSlug, `/playlists/${playlist.slug}/plays`);
  }, [siteSlug, playlist.slug]);

  const trackSong = useCallback(
    (songId: string, op: "plays" | "skips") => {
      trackPlaylist(siteSlug, `/playlists/${playlist.slug}/songs/${songId}/${op}`);
    },
    [siteSlug, playlist.slug],
  );

  const goTo = useCallback(
    (nextIndex: number, opts?: { skipFrom?: PlaylistSong | undefined }) => {
      if (opts?.skipFrom) trackSong(opts.skipFrom.id, "skips");
      const target = songs[nextIndex];
      if (!target) {
        setStarted(false);
        setFinished(true);
        return;
      }
      setFinished(false);
      setIndex(nextIndex);
      setStarted(true);
      trackSong(target.id, "plays");
    },
    [songs, trackSong],
  );

  const handleEnded = useCallback(() => {
    if (atLast) {
      setFinished(true);
      return;
    }
    goTo(index + 1);
  }, [atLast, goTo, index]);

  const onSkip = useCallback(() => {
    vibrate(8);
    if (atLast) {
      if (current) trackSong(current.id, "skips");
      setFinished(true);
      return;
    }
    goTo(index + 1, { skipFrom: current });
  }, [atLast, current, goTo, index, trackSong]);

  const onStart = useCallback(() => {
    vibrate(8);
    if (!current) return;
    setStarted(true);
    trackSong(current.id, "plays");
  }, [current, trackSong]);

  const onLike = useCallback(() => {
    setLiked((prev) => {
      if (!prev) {
        trackPlaylist(siteSlug, `/playlists/${playlist.slug}/like`);
        vibrate(8);
      }
      return true;
    });
  }, [siteSlug, playlist.slug]);

  const onRefresh = useCallback(() => {
    vibrate(4);
    const nextBg = randomOf(playlist.backgrounds);
    if (nextBg) setBackground(nextBg);
    setQuote(pickQuotation(playlist.quotes));
  }, [playlist.backgrounds, playlist.quotes]);

  const recommended = useMemo<Recommendation[]>(() => {
    const others = allPlaylists.filter(
      (item) => item.id !== playlist.id && item.songs.length > 0,
    );
    const scored = others
      .map((item) => {
        let score = 0;
        if (item.mood === playlist.mood) score += 2;
        if (playlist.recommendedSlugs?.includes(item.slug)) score += 4;
        return { playlist: item, score };
      })
      .sort((a, b) => b.score - a.score || a.playlist.order - b.playlist.order);
    const picks = scored.slice(0, 2);
    const reasons: Record<string, string> = {
      love: "more of the same love",
      "miss-you": "when the missing runs even deeper",
      sad: "for the feelings that linger",
      rain: "let the mood carry you",
      night: "stay in the quiet a little longer",
    };
    return picks.map((pick) => ({
      playlist: pick.playlist,
      reason: reasons[pick.playlist.mood] ?? "another mood, another moment",
    }));
  }, [allPlaylists, playlist.id, playlist.mood, playlist.recommendedSlugs]);

  const hubHref = `/u/${siteSlug}/songs`;
  const textVar = playlist.theme.textColor;
  const accentVar = playlist.theme.accentColor;

  const heroStyle = {
    "--pl-text": textVar,
    "--pl-accent": accentVar,
    backgroundColor: overlayRgba(playlist.theme.overlayColor, 0.82),
  } as React.CSSProperties;

  const togglePlay = useCallback(() => {
    (isAudio ? audioPlayerRef : playerRef).current?.togglePlay();
  }, [isAudio]);

  return (
    <main
      className="relative z-0 flex h-dvh w-full flex-col overflow-hidden"
      style={heroStyle}
    >
      {/* Full-bleed background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: background
            ? `url(${background})`
            : `linear-gradient(160deg, ${accentVar}22 0%, ${playlist.theme.overlayColor} 60%)`,
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{ background: overlayRgba(playlist.theme.overlayColor, 0.62) }}
      />

      {/* Minimal chrome */}
      <header className="flex shrink-0 items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-8 sm:pt-7">
        <Link
          href={hubHref}
          aria-label="All playlists"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--pl-text)] shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <BackIcon />
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="New background and quote"
          title="Refresh"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--pl-text)] shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <RefreshIcon />
        </button>
      </header>

      {/* Scroll-free body: everything fits within 100dvh */}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-8">
        {songs.length === 0 ? (
          <div className="max-w-md text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[var(--pl-text)]/50">
              playlist
            </p>
            <h1 className="font-serif text-5xl text-[var(--pl-text)] sm:text-6xl">
              {playlist.name}
            </h1>
            {quote && (
              <p className="mt-6 font-serif text-lg italic text-[var(--pl-text)]/75 sm:text-xl">
                “{quote}”
              </p>
            )}
            <p className="mt-10 font-serif italic text-[var(--pl-text)]/45">
              No songs here yet — check back soon. 🎵
            </p>
          </div>
        ) : finished || (started && !current) ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-h-full w-full max-w-2xl overflow-hidden text-center"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[var(--pl-text)]/50">
              {playlist.name}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-[var(--pl-text)] sm:text-5xl">
              Keep the feeling going
            </h1>
            {quote && (
              <p className="mx-auto mt-5 max-w-md font-serif text-lg italic text-[var(--pl-text)]/75">
                “{quote}”
              </p>
            )}
            {recommended.length > 0 && (
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {recommended.map((item, order) => (
                  <motion.div
                    key={item.playlist.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + order * 0.12, ease: EASE }}
                  >
                    <Link
                      href={`/u/${siteSlug}/music/${item.playlist.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-white/15 bg-black/30 text-left shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div
                        className="h-28 w-full bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
                        style={{
                          backgroundImage: item.playlist.coverImage
                            ? `url(${item.playlist.coverImage})`
                            : `linear-gradient(135deg, ${item.playlist.theme.accentColor}55, ${item.playlist.theme.overlayColor})`,
                        }}
                      />
                      <div className="px-5 py-4 text-left">
                        <h3 className="font-serif text-xl text-[var(--pl-text)]">
                          {item.playlist.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--pl-text)]/55">{item.reason}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                href={hubHref}
                className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-[var(--pl-text)] backdrop-blur-md transition-colors hover:bg-white/15 active:scale-95"
              >
                All playlists
              </Link>
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-[var(--pl-text)] backdrop-blur-md transition-colors hover:bg-white/15 active:scale-95"
              >
                Play again
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex min-h-0 w-full max-w-2xl flex-1 flex-col items-center justify-center overflow-hidden text-center"
          >
            <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.35em] text-[var(--pl-text)]/50">
              {playlist.name} · {index + 1} / {totalCount}
            </p>

            {current && !isAudio && (
              <>
                <h1 className="mt-3 shrink-0 font-serif text-4xl text-[var(--pl-text)] sm:text-5xl">
                  {current.title}
                </h1>
                <p className="mt-1 shrink-0 text-sm tracking-wide text-[var(--pl-text)]/60 uppercase">
                  {current.artist}
                </p>
              </>
            )}

            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              {started ? (
                isAudio ? (
                  <>
                    {current && (
                      <PlaylistAudioPlayer
                        ref={audioPlayerRef}
                        song={current}
                        accentColor={accentVar}
                        textColor={textVar}
                        onEnded={handleEnded}
                        onPlayingChange={setPlaying}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {current && (
                      <PlaylistPlayer
                        ref={playerRef}
                        videoId={current.youtubeId}
                        onEnded={handleEnded}
                        onPlayingChange={setPlaying}
                      />
                    )}
                  </>
                )
              ) : (
                <button
                  type="button"
                  onClick={onStart}
                  aria-label={`Play ${playlist.name}`}
                  className="group flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] ring-4 ring-white/20 transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: accentVar }}
                >
                  <PlayIcon />
                </button>
              )}
            </div>

            {started && (
              <div className="flex shrink-0 items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play or pause"
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: accentVar }}
                >
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  aria-label="Skip to next song"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-[var(--pl-text)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                >
                  <SkipIcon />
                </button>
                <button
                  type="button"
                  onClick={onLike}
                  aria-label="Like this playlist"
                  className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 ${
                    liked ? "text-rose-400" : "text-[var(--pl-text)]/70"
                  }`}
                >
                  <LikeIcon active={liked} />
                </button>
              </div>
            )}

            {quote && !isAudio && (
              <motion.p
                key={quote}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                className="mx-auto mt-6 max-w-md shrink-0 font-serif text-base italic leading-relaxed text-[var(--pl-text)]/70 sm:text-lg"
              >
                “{quote}”
              </motion.p>
            )}
          </motion.section>
        )}
      </div>
    </main>
  );
}
