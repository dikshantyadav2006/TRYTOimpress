"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: {
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        CUED: number;
        BUFFERING: number;
        UNSTARTED: number;
      };
      Player: new (elementId: string, options: YtPlayerOptions) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

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
  getPlayerState: () => number;
}

let youtubeScriptPromise: Promise<void> | null = null;

function loadYouTubeScript(): Promise<void> {
  if (youtubeScriptPromise) return youtubeScriptPromise;
  youtubeScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-yt-iframesdk]");
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (existing) {
      if (window.YT) {
        delete window.onYouTubeIframeAPIReady;
        resolve();
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

export interface PlaylistPlayerHandle {
  togglePlay: () => void;
  isPlaying: () => boolean;
  isTransitioning: () => boolean;
}

export interface PlaylistPlayerProps {
  videoId: string;
  onEnded: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onTransitionChange?: (transitioning: boolean) => void;
}

export const PlaylistPlayer = forwardRef<PlaylistPlayerHandle, PlaylistPlayerProps>(
  function PlaylistPlayer({ videoId, onEnded, onPlayingChange, onTransitionChange }, ref) {
    const containerIdRef = useRef<string>(`yt-${Math.random().toString(36).slice(2, 10)}`);
    const playerRef = useRef<YtPlayer | null>(null);
    const requestedVideoRef = useRef<string>(videoId);
    const currentVideoRef = useRef<string | null>(null);
    const readyRef = useRef(false);
    const switchingRef = useRef(false);
    const onEndedRef = useRef(onEnded);
    const onPlayingChangeRef = useRef(onPlayingChange);
    const onTransitionChangeRef = useRef(onTransitionChange);
    const playerStateRef = useRef<"playing" | "paused" | "ended">("paused");
    const retryTimerRef = useRef<number | undefined>(undefined);
    const [playing, setPlaying] = useState(true);

    onEndedRef.current = onEnded;
    onPlayingChangeRef.current = onPlayingChange;
    onTransitionChangeRef.current = onTransitionChange;

    const setPlayingState = useCallback((next: boolean) => {
      setPlaying(next);
      onPlayingChangeRef.current?.(next);
    }, []);

    const setTransitioning = useCallback((value: boolean) => {
      switchingRef.current = value;
      onTransitionChangeRef.current?.(value);
    }, []);

    useEffect(() => {
      requestedVideoRef.current = videoId;
    }, [videoId]);

    const loadRequested = useCallback(() => {
      const player = playerRef.current;
      const id = requestedVideoRef.current;
      if (!player || !readyRef.current || id == null) return;

      if (switchingRef.current) return;

      setTransitioning(true);
      currentVideoRef.current = id;
      try {
        player.loadVideoById(id);
        player.playVideo();
        setPlayingState(true);
        playerStateRef.current = "playing";
      } catch {
        if (requestedVideoRef.current !== id) {
          setTransitioning(false);
          return;
        }
        if (retryTimerRef.current !== undefined) window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = undefined;
          if (requestedVideoRef.current !== id || !playerRef.current || !readyRef.current) {
            setTransitioning(false);
            return;
          }
          try {
            playerRef.current.loadVideoById(id);
            playerRef.current.playVideo();
            setPlayingState(true);
          } catch {
            setTransitioning(false);
          }
        }, 500);
      }
    }, [setPlayingState, setTransitioning]);

    useEffect(() => {
      let disposed = false;
      void loadYouTubeScript().then(() => {
        if (disposed || !window.YT || playerRef.current) return;
        const states = window.YT.PlayerState;
        const onStateChange = (event: { data: number }) => {
          if (disposed) return;
          if (event.data === states.ENDED) {
            playerStateRef.current = "ended";
            setTransitioning(false);
            setPlayingState(false);
            onEndedRef.current();
          } else if (event.data === states.PLAYING) {
            playerStateRef.current = "playing";
            setTransitioning(false);
            setPlayingState(true);
          } else if (event.data === states.PAUSED) {
            playerStateRef.current = "paused";
            setTransitioning(false);
            setPlayingState(false);
          } else if (event.data === states.BUFFERING || event.data === states.CUED) {
            playerStateRef.current = "paused";
          }
        };
        try {
          playerRef.current = new window.YT.Player(containerIdRef.current, {
            videoId: requestedVideoRef.current,
            playerVars: {
              autoplay: 1,
              rel: 0,
              controls: 0,
              modestbranding: 1,
              showinfo: 0,
              iv_load_policy: 3,
              playsinline: 1,
              enablejsapi: 1,
              loop: 0,
              origin: "*",
            },
            events: {
              onReady: () => {
                if (disposed) return;
                readyRef.current = true;
                currentVideoRef.current = requestedVideoRef.current;
                loadRequested();
              },
              onStateChange,
              onError: (event: { data: number }) => {
                if (disposed) return;
                const errCode = event.data;
                const vid = currentVideoRef.current;
                console.error(
                  `[YT Player Error] code=${errCode} video=${vid} requested=${requestedVideoRef.current}`,
                );
                if (switchingRef.current || !readyRef.current) {
                  setTransitioning(false);
                  return;
                }
                if (vid == null || vid === requestedVideoRef.current) {
                  onEndedRef.current();
                }
              },
            },
          });
        } catch {
          setTransitioning(false);
          onEndedRef.current();
        }
      });
      return () => {
        disposed = true;
        if (retryTimerRef.current !== undefined) window.clearTimeout(retryTimerRef.current);
        try {
          playerRef.current?.destroy();
        } catch {
          // Ignore destroy errors during cleanup.
        }
        playerRef.current = null;
        readyRef.current = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      requestedVideoRef.current = videoId;
      if (switchingRef.current) return;
      if (currentVideoRef.current === videoId) {
        const player = playerRef.current;
        if (player && readyRef.current) {
          setTransitioning(true);
          currentVideoRef.current = videoId;
          try {
            player.loadVideoById(videoId);
            player.playVideo();
            setPlayingState(true);
            playerStateRef.current = "playing";
          } catch {
            // onStateChange will handle
          }
        }
        return;
      }
      loadRequested();
    }, [videoId, loadRequested, setPlayingState, setTransitioning]);

    const togglePlay = useCallback(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current || switchingRef.current) return;
      if (playerStateRef.current === "playing" && playing) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }, [playing]);

    useImperativeHandle(
      ref,
      () => ({
        togglePlay,
        isPlaying: () => playing,
        isTransitioning: () => switchingRef.current,
      }),
      [togglePlay, playing],
    );

    return (
      <div className="relative flex h-full w-full min-h-0 items-center justify-center">
        <div className="relative aspect-video h-full max-w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/15">
          <div id={containerIdRef.current} className="absolute inset-0" />
        </div>
      </div>
    );
  },
);
