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
    onReady?: (event: { target: YtPlayer }) => void;
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
    const videoIdRef = useRef(videoId);
    const onEndedRef = useRef(onEnded);
    const onPlayingChangeRef = useRef(onPlayingChange);
    const [playing, setPlaying] = useState(true);

    onEndedRef.current = onEnded;
    onPlayingChangeRef.current = onPlayingChange;

    const setPlayingState = useCallback((next: boolean) => {
      setPlaying(next);
      onPlayingChangeRef.current?.(next);
    }, []);

    useEffect(() => {
      videoIdRef.current = videoId;
    }, [videoId]);

    useEffect(() => {
      let disposed = false;
      void loadYouTubeScript().then(() => {
        if (disposed || !window.YT || playerRef.current) return;
        const onStateChange = (event: { data: number }) => {
          if (!window.YT) return;
          if (event.data === window.YT.PlayerState.ENDED) {
            setPlayingState(false);
            onEndedRef.current();
          } else if (event.data === window.YT.PlayerState.PLAYING) {
            setPlayingState(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setPlayingState(false);
          }
        };
        playerRef.current = new window.YT.Player(containerIdRef.current, {
          videoId,
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
          },
          events: {
            onReady: () => {
              if (!disposed) setPlayingState(true);
            },
            onStateChange,
            onError: () => {
              onEndedRef.current();
            },
          },
        });
      });
      return () => {
        disposed = true;
        playerRef.current?.destroy();
        playerRef.current = null;
      };
      // Mount once; further songs reuse the same player instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (videoIdRef.current === videoId) return;
      videoIdRef.current = videoId;
      playerRef.current?.loadVideoById(videoId);
      setPlayingState(true);
    }, [videoId, setPlayingState]);

    const togglePlay = useCallback(() => {
      const player = playerRef.current;
      if (!player) return;
      if (playing) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }, [playing]);

    useImperativeHandle(ref, () => ({ togglePlay, isPlaying: () => playing }), [togglePlay, playing]);

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/15">
        <div id={containerIdRef.current} className="absolute inset-0" />
      </div>
    );
  },
);