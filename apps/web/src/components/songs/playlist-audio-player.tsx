"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";

import type { PlaylistSong } from "@repo/shared";

interface YtPlayerOptions {
  videoId: string;
  playerVars?: Record<string, unknown>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
}

interface YtPlayer {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
}

interface YtApi {
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    CUED: number;
    BUFFERING: number;
    UNSTARTED: number;
  };
  Player: new (elementId: string, options: YtPlayerOptions) => YtPlayer;
}

let youtubeScriptPromise: Promise<YtApi | null> | null = null;

function loadYouTubeScript(): Promise<YtApi | null> {
  if (youtubeScriptPromise) return youtubeScriptPromise;
  youtubeScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-yt-iframesdk]");
    window.onYouTubeIframeAPIReady = () => {
      resolve((window as { YT?: YtApi }).YT ?? null);
    };
    if (existing) {
      if ((window as { YT?: YtApi }).YT) {
        resolve((window as { YT?: YtApi }).YT ?? null);
      }
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.dataset.ytIframesdk = "true";
    script.async = true;
    document.head.appendChild(script);
  });
  return youtubeScriptPromise;
}

export interface PlaylistAudioPlayerHandle {
  togglePlay: () => void;
  isPlaying: () => boolean;
  isTransitioning: () => boolean;
}

export interface PlaylistAudioPlayerProps {
  song: PlaylistSong;
  accentColor?: string;
  textColor?: string;
  onEnded: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onTransitionChange?: (transitioning: boolean) => void;
}

/**
 * Audio-only player. Renders cover art and never mounts the video visuals —
 * the YouTube embed is sized to a minimal hidden box used purely for audio.
 */
export const PlaylistAudioPlayer = forwardRef<
  PlaylistAudioPlayerHandle,
  PlaylistAudioPlayerProps
>(function PlaylistAudioPlayer(
  { song, accentColor, textColor, onEnded, onPlayingChange, onTransitionChange },
  ref,
) {
  const containerIdRef = useRef<string>(`yt-a-${Math.random().toString(36).slice(2, 10)}`);
  const playerRef = useRef<YtPlayer | null>(null);
  const ytRef = useRef<YtApi | null>(null);
  const requestedRef = useRef(song.youtubeId);
  const currentRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const switchingRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const onTransitionChangeRef = useRef(onTransitionChange);
  const playingRef = useRef(false);
  const retryTimerRef = useRef<number | undefined>(undefined);

  onEndedRef.current = onEnded;
  onPlayingChangeRef.current = onPlayingChange;
  onTransitionChangeRef.current = onTransitionChange;

  const setPlaying = useCallback((next: boolean) => {
    playingRef.current = next;
    onPlayingChangeRef.current?.(next);
  }, []);

  const setTransitioning = useCallback((value: boolean) => {
    switchingRef.current = value;
    onTransitionChangeRef.current?.(value);
  }, []);

  useEffect(() => {
    requestedRef.current = song.youtubeId;
  }, [song.youtubeId]);

  const loadRequested = useCallback(() => {
    const id = requestedRef.current;
    const player = playerRef.current;
    if (!player || !readyRef.current || id == null) return;

    if (switchingRef.current) return;

    setTransitioning(true);
    currentRef.current = id;
    try {
      player.loadVideoById(id);
      player.playVideo();
      setPlaying(true);
    } catch {
      if (requestedRef.current !== id) {
        setTransitioning(false);
        return;
      }
      if (retryTimerRef.current !== undefined) window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = undefined;
        if (requestedRef.current !== id || !playerRef.current || !readyRef.current) {
          setTransitioning(false);
          return;
        }
        try {
          playerRef.current.loadVideoById(id);
          playerRef.current.playVideo();
          setPlaying(true);
        } catch {
          setTransitioning(false);
        }
      }, 500);
    }
  }, [setPlaying, setTransitioning]);

  useEffect(() => {
    let disposed = false;
    void loadYouTubeScript().then((yt) => {
      if (disposed || !yt || playerRef.current) return;
      ytRef.current = yt;
      const states = yt.PlayerState;
      const onStateChange = (event: { data: number }) => {
        if (disposed || !ytRef.current) return;
        if (event.data === states.ENDED) {
          setTransitioning(false);
          setPlaying(false);
          onEndedRef.current();
        } else if (event.data === states.PLAYING) {
          setTransitioning(false);
          setPlaying(true);
        } else if (event.data === states.PAUSED) {
          setTransitioning(false);
          setPlaying(false);
        } else if (event.data === states.BUFFERING || event.data === states.CUED) {
          // keep transitioning state
        }
      };
      playerRef.current = new yt.Player(containerIdRef.current, {
        videoId: requestedRef.current,
        playerVars: {
          autoplay: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: "*",
        },
        events: {
          onReady: () => {
            if (disposed) return;
            readyRef.current = true;
            currentRef.current = requestedRef.current;
            loadRequested();
          },
          onStateChange,
          onError: (event: { data: number }) => {
            if (disposed) return;
            const errCode = event.data;
            const vid = currentRef.current;
            console.error(
              `[YT Audio Error] code=${errCode} video=${vid} requested=${requestedRef.current}`,
            );
            if (switchingRef.current || !readyRef.current) {
              setTransitioning(false);
              return;
            }
            if (vid == null || vid === requestedRef.current) {
              onEndedRef.current();
            }
          },
        },
      });
    });
    return () => {
      disposed = true;
      if (retryTimerRef.current !== undefined) window.clearTimeout(retryTimerRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestedRef.current = song.youtubeId;
    if (switchingRef.current) return;
    if (currentRef.current === song.youtubeId) {
      const player = playerRef.current;
      if (player && readyRef.current) {
        setTransitioning(true);
        currentRef.current = song.youtubeId;
        try {
          player.loadVideoById(song.youtubeId);
          player.playVideo();
          setPlaying(true);
        } catch {
          // onStateChange will handle
        }
      }
      return;
    }
    loadRequested();
  }, [song.youtubeId, loadRequested, setPlaying, setTransitioning]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current || switchingRef.current) return;
    if (playingRef.current) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      togglePlay,
      isPlaying: () => playingRef.current,
      isTransitioning: () => switchingRef.current,
    }),
    [togglePlay],
  );

  const textVar = textColor ?? "#ffffff";

  return (
    <div className="flex w-full flex-col items-center">
      <motion.div
        key={song.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15"
      >
        {song.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.thumbnail}
            alt={song.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor ?? "#d4a373"}44, ${accentColor ?? "#d4a373"}11)`,
            }}
          >
            <span className="text-6xl">🎵</span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 px-5 pb-4 text-left"
          style={{ color: textVar }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] opacity-60">
            now playing
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight">{song.title}</h2>
          <p className="mt-0.5 text-sm uppercase tracking-wide opacity-70">{song.artist}</p>
        </div>
      </motion.div>

      {/* Hidden YouTube player used solely for audio — no visual is mounted. */}
      <div
        id={containerIdRef.current}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />
    </div>
  );
});
