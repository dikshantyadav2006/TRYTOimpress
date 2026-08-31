"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";

import type { Playlist, PlaylistSong } from "@repo/shared";
import { vibrate } from "@repo/ui";

import { trackPlaylist } from "@/lib/track-playlist";
import { PlaylistPlayer, type PlaylistPlayerHandle } from "./playlist-player";
import { PlaylistAudioPlayer, type PlaylistAudioPlayerHandle } from "./playlist-audio-player";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
type RepeatMode = "off" | "one" | "all";

function randomOf<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleArr<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i] as T;
    const b = copy[j] as T;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

function overlayRgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return `rgba(0, 0, 0, ${alpha})`;
  const [, r, g, b] = match;
  return `rgba(${Number.parseInt(r!, 16)}, ${Number.parseInt(g!, 16)}, ${Number.parseInt(b!, 16)}, ${alpha})`;
}

function pickQuotation(items: string[]): string | undefined {
  return randomOf(items);
}

interface Recommendation {
  playlist: Playlist;
  reason: string;
}

interface PlaylistExperienceProps {
  playlist: Playlist;
  songs: PlaylistSong[];
  sourceError: boolean;
  siteSlug: string;
  allPlaylists: Playlist[];
}

export function PlaylistExperience({
  playlist,
  songs,
  sourceError,
  siteSlug,
  allPlaylists,
}: PlaylistExperienceProps) {
  const [background, setBackground] = useState(() => randomOf(playlist.backgrounds));
  const [quote, setQuote] = useState(() => pickQuotation(playlist.quotes));
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  // Once mounted, the (YouTube) player stays mounted for the whole session.
  // Persisting it prevents the iframe container from being torn down/rebuilt,
  // which is what caused "insertBefore"/postMessage errors and breaking Next.
  const [playerMounted, setPlayerMounted] = useState(false);

  // Queue state: `played` are completed song indices (history), `upNext` the
  // remaining ones, `currentIndex` the live track. This deque model makes
  // prev/next and shuffle consistent and never loses the current track.
  const [played, setPlayed] = useState<number[]>([]);
  const [upNext, setUpNext] = useState<number[]>(() => songs.map((_, i) => i).slice(1));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastTrackChangeRef = useRef(0);
  const TRACK_CHANGE_COOLDOWN = 800;

  const playerRef = useRef<PlaylistPlayerHandle>(null);
  const audioPlayerRef = useRef<PlaylistAudioPlayerHandle>(null);

  const isAudio = playlist.mode === "audio";

  const current = songs[currentIndex];
  const totalCount = songs.length;
  const hasPrevious = songs.length > 1 || played.length > 0 || repeat !== "off";

  useEffect(() => {
    trackPlaylist(siteSlug, `/playlists/${playlist.slug}/plays`);
  }, [siteSlug, playlist.slug]);

  const trackSong = useCallback(
    (songId: string, op: "plays" | "skips") => {
      trackPlaylist(siteSlug, `/playlists/${playlist.slug}/songs/${songId}/${op}`);
    },
    [siteSlug, playlist.slug],
  );

  // Keeps index state in sync if the resolved song list changes shape.
  useEffect(() => {
    const nextPlayed = played.filter((i) => i < songs.length);
    const nextUpNext = upNext.filter((i) => i < songs.length);
    const clamped = Math.min(currentIndex, Math.max(0, songs.length - 1));
    if (songs.length === 0) {
      setPlayed([]);
      setUpNext([]);
      setCurrentIndex(0);
    } else if (
      nextPlayed.length !== played.length ||
      nextUpNext.length !== upNext.length ||
      clamped !== currentIndex ||
      (songs.length > 0 && currentIndex > songs.length - 1)
    ) {
      setPlayed(nextPlayed);
      setUpNext(nextUpNext);
      setCurrentIndex(clamped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs]);

  const advance = useCallback(
    (forceNext = false) => {
      if (repeat === "one" && !forceNext) return;

      if (upNext.length > 0) {
        const nextIdx = upNext[0]!;
        setPlayed((p) => [...p, currentIndex]);
        setUpNext((u) => u.slice(1));
        setCurrentIndex(nextIdx);
        setFinished(false);
        setStarted(true);
        setPlayerMounted(true);
        setPlaying(true);
        trackSong(songs[nextIdx]?.id ?? "", "plays");
        return;
      }

      if ((repeat === "all" || forceNext) && songs.length > 0) {
        const rest = songs.map((_, i) => i).filter((i) => i !== currentIndex);
        const nextOrder = shuffle ? shuffleArr(rest) : rest;
        const nextIdx = nextOrder[0] ?? (currentIndex + 1) % songs.length;
        if (nextIdx !== undefined) {
          setPlayed((p) => [...p, currentIndex]);
          setUpNext(nextOrder.slice(1));
          setCurrentIndex(nextIdx);
          setFinished(false);
          setStarted(true);
          setPlayerMounted(true);
          setPlaying(true);
          trackSong(songs[nextIdx]?.id ?? "", "plays");
          return;
        }
      }

      setStarted(false);
      setFinished(true);
    },
    [repeat, upNext, currentIndex, songs, shuffle, trackSong],
  );

  const handleEnded = useCallback(() => {
    advance(false);
  }, [advance]);

  const onSkip = useCallback(() => {
    if (isTransitioning) return;
    if (Date.now() - lastTrackChangeRef.current < TRACK_CHANGE_COOLDOWN) return;
    vibrate(8);
    if (songs.length === 0) return;
    if (current) trackSong(current.id, "skips");
    lastTrackChangeRef.current = Date.now();
    setIsTransitioning(true);
    advance(true);
  }, [advance, current, songs.length, trackSong, isTransitioning]);

  const onPrev = useCallback(() => {
    if (isTransitioning) return;
    if (Date.now() - lastTrackChangeRef.current < TRACK_CHANGE_COOLDOWN) return;
    vibrate(8);
    if (songs.length === 0) return;

    lastTrackChangeRef.current = Date.now();
    setIsTransitioning(true);

    if (played.length > 0) {
      const prevIdx = played[played.length - 1]!;
      setUpNext((u) => [currentIndex, ...u]);
      setPlayed((p) => p.slice(0, -1));
      setCurrentIndex(prevIdx);
      setFinished(false);
      setStarted(true);
      setPlayerMounted(true);
      setPlaying(true);
      return;
    }

    if (songs.length > 1) {
      const prevIdx = (currentIndex - 1 + songs.length) % songs.length;
      setUpNext((u) => [currentIndex, ...u]);
      setCurrentIndex(prevIdx);
      setFinished(false);
      setStarted(true);
      setPlayerMounted(true);
      setPlaying(true);
      return;
    }

    setFinished(false);
    setStarted(true);
    setPlayerMounted(true);
    setPlaying(true);
  }, [played, currentIndex, songs.length, isTransitioning]);

  const onStart = useCallback(() => {
    if (isTransitioning) return;
    vibrate(8);
    if (!current) return;
    setStarted(true);
    setPlayerMounted(true);
    setPlaying(true);
    trackSong(current.id, "plays");
  }, [current, trackSong, isTransitioning]);

  const onPlayAgain = useCallback(() => {
    if (isTransitioning) return;
    if (Date.now() - lastTrackChangeRef.current < TRACK_CHANGE_COOLDOWN) return;
    vibrate(8);
    if (songs.length === 0) return;
    lastTrackChangeRef.current = Date.now();
    setIsTransitioning(true);
    const rest = songs.map((_, i) => i).slice(1);
    setUpNext(shuffle ? shuffleArr(rest) : rest);
    setPlayed([]);
    setCurrentIndex(0);
    setFinished(false);
    setStarted(true);
    setPlayerMounted(true);
    setPlaying(true);
    trackSong(songs[0]!.id, "plays");
  }, [songs, shuffle, trackSong, isTransitioning]);

  const toggleShuffle = useCallback(() => {
    vibrate(6);
    setShuffle((prev) => {
      const next = !prev;
      const used = new Set<number>(played);
      used.add(currentIndex);
      const remaining = songs.map((_, i) => i).filter((i) => !used.has(i));
      setUpNext(next ? shuffleArr(remaining) : remaining);
      return next;
    });
  }, [played, currentIndex, songs]);

  const toggleRepeat = useCallback(() => {
    vibrate(6);
    setRepeat((r) => (r === "off" ? "one" : r === "one" ? "all" : "off"));
  }, []);

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
    if (isTransitioning) return;
    (isAudio ? audioPlayerRef : playerRef).current?.togglePlay();
  }, [isAudio, isTransitioning]);

  const handlePlayingChange = useCallback((playing: boolean) => {
    setPlaying(playing);
    if (playing) setIsTransitioning(false);
  }, []);

  const currentArtwork = current?.thumbnail ?? playlist.coverImage;

  const playerBg =
    currentArtwork && !isAudio
      ? `url(${currentArtwork})`
      : background
        ? `url(${background})`
        : `linear-gradient(160deg, ${accentVar}22 0%, ${playlist.theme.overlayColor} 60%)`;

  return (
    <main
      className="relative z-0 flex h-dvh w-full flex-col overflow-hidden"
      style={heroStyle}
    >
      {/* Full-bleed blurred background driven by the active artwork.
          Wrapped in a clipped fixed layer so the scaled blur can never spill
          past the viewport and cause a page scrollbar. */}
      <div aria-hidden className="fixed inset-0 -z-20 overflow-hidden">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: playerBg }}
        />
        <div
          className="absolute inset-0"
          style={{ background: overlayRgba(playlist.theme.overlayColor, 0.62) }}
        />
      </div>

      {/* Minimal chrome */}
      <header className="flex shrink-0 items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-8 sm:pt-7">
        <Link
          href={hubHref}
          aria-label="All playlists"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--pl-text)] shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="New background and quote"
          title="Refresh"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--pl-text)] shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <RefreshCw className="h-5 w-5" />
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
            {sourceError ? (
              <p className="mt-10 font-serif italic text-[var(--pl-text)]/60">
                We couldn’t reach the playlist source just now. Please try again shortly.
              </p>
            ) : (
              <p className="mt-10 font-serif italic text-[var(--pl-text)]/45">
                No songs here yet — check back soon.
              </p>
            )}
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
                onClick={onPlayAgain}
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
            className="flex min-h-0 w-full max-w-2xl flex-1 flex-col items-stretch justify-center overflow-hidden text-center"
          >
            <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.35em] text-[var(--pl-text)]/50">
              {playlist.name} · {currentIndex + 1} / {totalCount}
            </p>

            {/* Media area: scales to whatever vertical space is left so the
                whole player always fits within 100dvh without scrolling. */}
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden py-3">
              {playerMounted ? (
                <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
                  {current && (
                    isAudio ? (
                      <div
                        className="flex min-h-0 w-full justify-center overflow-hidden"
                        style={{ width: "min(24rem, 100%, 40dvh)" }}
                      >
                        <PlaylistAudioPlayer
                          ref={audioPlayerRef}
                          song={current}
                          accentColor={accentVar}
                          textColor={textVar}
                          onEnded={handleEnded}
                          onPlayingChange={handlePlayingChange}
                          onTransitionChange={setIsTransitioning}
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                          <PlaylistPlayer
                            ref={playerRef}
                            videoId={current.youtubeId}
                            onEnded={handleEnded}
                            onPlayingChange={handlePlayingChange}
                            onTransitionChange={setIsTransitioning}
                          />
                        </div>
                        <h1 className="mt-3 max-w-xl shrink-0 truncate font-serif text-2xl text-[var(--pl-text)] sm:text-3xl">
                          {current?.title}
                        </h1>
                        <p className="mt-0.5 shrink-0 truncate text-xs uppercase tracking-wide text-[var(--pl-text)]/60">
                          {current?.artist}
                        </p>
                      </div>
                    )
                  )}

                  {!started && (
                    <button
                      type="button"
                      onClick={onStart}
                      aria-label={`Play ${playlist.name}`}
                      className="absolute inset-0 z-20 flex items-center justify-center"
                    >
                      <span
                        className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] ring-4 ring-white/20 transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: accentVar }}
                      >
                        <Play className="ml-1 h-8 w-8 fill-current" />
                      </span>
                    </button>
                  )}

                  {isTransitioning && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/45 backdrop-blur-sm">
                      <Loader2 className="h-9 w-9 animate-spin text-white" />
                      <p className="font-serif text-sm text-white/80">
                        Loading next song...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {currentArtwork && (
                    <div
                      className="aspect-square w-full max-w-[13rem] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15"
                      style={{ maxHeight: "min(13rem, 38dvh)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentArtwork}
                        alt={current?.title ?? playlist.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {current && !isAudio && (
                    <h1 className="mt-4 max-w-xl shrink-0 truncate font-serif text-2xl text-[var(--pl-text)] sm:text-3xl">
                      {current.title}
                    </h1>
                  )}
                  {current && !isAudio && (
                    <p className="mt-0.5 shrink-0 truncate text-xs uppercase tracking-wide text-[var(--pl-text)]/60">
                      {current.artist}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={onStart}
                    aria-label={`Play ${playlist.name}`}
                    className="group mt-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] ring-4 ring-white/20 transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: accentVar }}
                  >
                    <Play className="ml-0.5 h-7 w-7 fill-current" />
                  </button>
                </div>
              )}
            </div>

            {/* Control bar */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  aria-pressed={shuffle}
                  aria-label="Toggle shuffle"
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                    shuffle
                      ? "bg-white/20 text-white"
                      : "border border-white/20 bg-black/30 text-[var(--pl-text)]/70"
                  }`}
                >
                  <Shuffle className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrevious || isTransitioning}
                  aria-label="Previous song"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-[var(--pl-text)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isTransitioning}
                  aria-label="Play or pause"
                  className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/20 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: accentVar }}
                >
                  {playing ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-7 w-7 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={isTransitioning}
                  aria-label="Skip to next song"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-[var(--pl-text)] backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={toggleRepeat}
                  aria-label={`Repeat: ${repeat}`}
                  aria-pressed={repeat !== "off"}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                    repeat !== "off"
                      ? "bg-white/20 text-white"
                      : "border border-white/20 bg-black/30 text-[var(--pl-text)]/70"
                  }`}
                >
                  {repeat === "one" ? (
                    <Repeat1 className="h-5 w-5" />
                  ) : (
                    <Repeat className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={onLike}
                aria-label="Like this playlist"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 ${
                  liked ? "text-rose-400" : "text-[var(--pl-text)]/70"
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {quote && !isAudio && (
              <motion.p
                key={quote}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                className="mx-auto mt-3 max-w-md shrink-0 font-serif text-sm italic leading-relaxed text-[var(--pl-text)]/70 sm:text-base"
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
