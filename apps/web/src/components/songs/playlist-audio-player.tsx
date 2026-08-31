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
    onError?: () => void;
  };
}

interface YtPlayer {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
}

interface YtApi {
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
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
}

export interface PlaylistAudioPlayerProps {
  song: PlaylistSong;
  accentColor?: string;
  textColor?: string;
  onEnded: () => void;
  onPlayingChange?: (playing: boolean) => void;
}

/**
 * Audio-only player. Renders cover art and never mounts the video visuals —
 * the YouTube embed is sized to a minimal hidden box used purely for audio.
 */
export const PlaylistAudioPlayer = forwardRef<
  PlaylistAudioPlayerHandle,
  PlaylistAudioPlayerProps
>(function PlaylistAudioPlayer({ song, accentColor, textColor, onEnded, onPlayingChange }, ref) {
  const containerIdRef = useRef<string>(`yt-a-${Math.random().toString(36).slice(2, 10)}`);
  const playerRef = useRef<YtPlayer | null>(null);
  const ytRef = useRef<YtApi | null>(null);
  const requestedRef = useRef(song.youtubeId);
  const currentRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const switchingRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const playingRef = useRef(false);

  onEndedRef.current = onEnded;
  onPlayingChangeRef.current = onPlayingChange;

  const setPlaying = useCallback((next: boolean) => {
    playingRef.current = next;
    onPlayingChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    requestedRef.current = song.youtubeId;
  }, [song.youtubeId]);

  const loadRequested = useCallback(() => {
    const id = requestedRef.current;
    const player = playerRef.current;
    if (!player || !readyRef.current || id == null) return;
    switchingRef.current = true;
    currentRef.current = id;
    try {
      player.loadVideoById(id);
      player.playVideo();
      setPlaying(true);
    } catch {
      window.setTimeout(() => {
        if (requestedRef.current !== id) return;
        try {
          player.loadVideoById(id);
          player.playVideo();
          setPlaying(true);
        } catch {
          // let onStateChange/onError settle
        }
      }, 400);
    }
    switchingRef.current = false;
  }, [setPlaying]);

  useEffect(() => {
    let disposed = false;
    void loadYouTubeScript().then((yt) => {
      if (disposed || !yt || playerRef.current) return;
      ytRef.current = yt;
      const onStateChange = (event: { data: number }) => {
        if (!ytRef.current) return;
        if (event.data === ytRef.current.PlayerState.ENDED) {
          setPlaying(false);
          onEndedRef.current();
        } else if (event.data === ytRef.current.PlayerState.PLAYING) {
          setPlaying(true);
        } else if (event.data === ytRef.current.PlayerState.PAUSED) {
          setPlaying(false);
        }
      };
      playerRef.current = new yt.Player(containerIdRef.current, {
        videoId: requestedRef.current,
        playerVars: {
          autoplay: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            if (disposed) return;
            readyRef.current = true;
            currentRef.current = requestedRef.current;
            loadRequested();
          },
          onStateChange,
          onError: () => {
            // Only auto-advance when the error concerns the requested video and
            // the player isn't mid-switch, to avoid skipping two songs.
            if (switchingRef.current || !readyRef.current) return;
            if (currentRef.current == null || currentRef.current === requestedRef.current) {
              onEndedRef.current();
            }
          },
        },
      });
    });
    return () => {
      disposed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestedRef.current = song.youtubeId;
    if (currentRef.current === song.youtubeId) {
      // Same track but different song entry — replay from the start.
      const player = playerRef.current;
      if (player && readyRef.current) {
        switchingRef.current = true;
        try {
          player.loadVideoById(song.youtubeId);
          player.playVideo();
          setPlaying(true);
        } catch {
          // ignore
        }
        switchingRef.current = false;
      }
      return;
    }
    loadRequested();
  }, [song.youtubeId, loadRequested, setPlaying]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    if (playingRef.current) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  useImperativeHandle(ref, () => ({ togglePlay, isPlaying: () => playingRef.current }), [togglePlay]);

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
