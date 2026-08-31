"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: {
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
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
    onError?: () => void;
  };
}

interface YtPlayer {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
}

interface YtPlayerState {
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
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
}

export interface PlaylistPlayerProps {
  videoId: string;
  onEnded: () => void;
  onPlayingChange?: (playing: boolean) => void;
}

export const PlaylistPlayer = forwardRef<PlaylistPlayerHandle, PlaylistPlayerProps>(
  function PlaylistPlayer({ videoId, onEnded, onPlayingChange }, ref) {
    const containerIdRef = useRef<string>(`yt-${Math.random().toString(36).slice(2, 10)}`);
    const playerRef = useRef<YtPlayer | null>(null);
    const ytStatesRef = useRef<YtPlayerState | null>(null);
    const requestedVideoRef = useRef<string>(videoId);
    const currentVideoRef = useRef<string | null>(null);
    const readyRef = useRef(false);
    const switchingRef = useRef(false);
    const onEndedRef = useRef(onEnded);
    const onPlayingChangeRef = useRef(onPlayingChange);
    const playerStateRef = useRef<"playing" | "paused" | "ended">("paused");
    const [playing, setPlaying] = useState(true);

    onEndedRef.current = onEnded;
    onPlayingChangeRef.current = onPlayingChange;

    const setPlayingState = useCallback((next: boolean) => {
      setPlaying(next);
      onPlayingChangeRef.current?.(next);
    }, []);

    // Keep track of the latest desired video id as the prop changes.
    useEffect(() => {
      requestedVideoRef.current = videoId;
    }, [videoId]);

    // Load the desired video once the player is ready, and ensure it plays.
    const loadRequested = useCallback(() => {
      const player = playerRef.current;
      const id = requestedVideoRef.current;
      if (!player || !readyRef.current || id == null) return;
      switchingRef.current = true;
      currentVideoRef.current = id;
      try {
        player.loadVideoById(id);
        player.playVideo();
        setPlayingState(true);
        playerStateRef.current = "playing";
      } catch {
        // Ignore transient API errors during a switch; the track change will be
        // recalculated via onStateChange. Scheduling a retry keeps things robust.
        window.setTimeout(() => {
          if (requestedVideoRef.current !== id) return;
          try {
            player.loadVideoById(id);
            player.playVideo();
            setPlayingState(true);
          } catch {
            // leave it; onError/onStateChange will settle state
          }
        }, 400);
      }
      switchingRef.current = false;
    }, [setPlayingState]);

    useEffect(() => {
      let disposed = false;
      let retryTimer: number | undefined;
      void loadYouTubeScript().then(() => {
        if (disposed || !window.YT || playerRef.current) return;
        const states = window.YT.PlayerState;
        ytStatesRef.current = states;
        const onStateChange = (event: { data: number }) => {
          try {
            if (!ytStatesRef.current) return;
            if (event.data === ytStatesRef.current.ENDED) {
              playerStateRef.current = "ended";
              setPlayingState(false);
              onEndedRef.current();
            } else if (event.data === ytStatesRef.current.PLAYING) {
              playerStateRef.current = "playing";
              setPlayingState(true);
            } else if (event.data === ytStatesRef.current.PAUSED) {
              playerStateRef.current = "paused";
              setPlayingState(false);
            }
          } catch {
            // Swallow DOM-related errors from YouTube player to prevent
            // cascading React reconciliation failures.
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
              origin: typeof window !== "undefined" ? window.location.origin : undefined,
            },
            events: {
              onReady: () => {
                if (disposed) return;
                readyRef.current = true;
                currentVideoRef.current = requestedVideoRef.current;
                loadRequested();
              },
              onStateChange,
              onError: () => {
                // Only auto-advance when the error concerns the video the user
                // actually asked for and the player isn't mid-switch. Ignoring
                // errors during a track change prevents skipping two songs.
                if (switchingRef.current || !readyRef.current) return;
                if (
                  currentVideoRef.current == null ||
                  currentVideoRef.current === requestedVideoRef.current
                ) {
                  onEndedRef.current();
                }
              },
            },
          });
        } catch {
          // If player construction fails, skip to the next song once.
          onEndedRef.current();
        }
      });
      return () => {
        disposed = true;
        if (retryTimer !== undefined) window.clearTimeout(retryTimer);
        try {
          playerRef.current?.destroy();
        } catch {
          // Ignore destroy errors during cleanup.
        }
        playerRef.current = null;
        readyRef.current = false;
      };
      // Mount once; further songs reuse the same player instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // React to videoId changes. If the player isn't ready yet (rapid skip right
    // after start), stash the id and it will be loaded once onReady fires.
    useEffect(() => {
      requestedVideoRef.current = videoId;
      if (currentVideoRef.current === videoId) {
        // Same video but the track changed — replay it from the start.
        const player = playerRef.current;
        if (player && readyRef.current) {
          switchingRef.current = true;
          try {
            player.loadVideoById(videoId);
            player.playVideo();
            setPlayingState(true);
            playerStateRef.current = "playing";
          } catch {
            // ignore
          }
          switchingRef.current = false;
        }
        return;
      }
      loadRequested();
    }, [videoId, loadRequested, setPlayingState]);

    const togglePlay = useCallback(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      if (playerStateRef.current === "playing" && playing) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }, [playing]);

    useImperativeHandle(ref, () => ({ togglePlay, isPlaying: () => playing }), [togglePlay, playing]);

    return (
      <div className="relative flex h-full w-full min-h-0 items-center justify-center">
        <div className="relative aspect-video h-full max-w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/15">
          <div id={containerIdRef.current} className="absolute inset-0" />
        </div>
      </div>
    );
  },
);
