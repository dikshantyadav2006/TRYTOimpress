"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import { getMelodySrc } from "../lib/melody";
import {
  createMusicStore,
  type MusicStoreApi,
  type MusicStoreState,
} from "../store/music-store";

export const MusicStoreContext = createContext<MusicStoreApi | null>(null);

export interface MusicProviderProps {
  children: ReactNode;
  backgroundMusicUrl?: string;
}

export function MusicProvider({ children, backgroundMusicUrl }: MusicProviderProps) {
  const storeRef = useRef<MusicStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createMusicStore();
  }

  const store = storeRef.current;
  const enabled = useStore(store, (state) => state.enabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const source = backgroundMusicUrl?.trim() || getMelodySrc();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (enabled) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, [enabled, source]);

  return (
    <MusicStoreContext.Provider value={store}>
      <audio ref={audioRef} src={source} loop preload="none" aria-hidden />
      {children}
    </MusicStoreContext.Provider>
  );
}

export function useMusicStore<T>(selector: (state: MusicStoreState) => T): T {
  const store = useContext(MusicStoreContext);

  if (!store) {
    throw new Error("useMusicStore must be used within a <MusicProvider>");
  }

  return useStore(store, selector);
}
