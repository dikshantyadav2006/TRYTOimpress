"use client";

import { createStore, type StoreApi } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";

export interface MusicStoreState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
}

export type MusicStoreApi = StoreApi<MusicStoreState>;

export function createMusicStore(): MusicStoreApi {
  return createStore<MusicStoreState>()(
    persist(
      (set) => ({
        enabled: false,
        toggle: () => set((state) => ({ enabled: !state.enabled })),
        setEnabled: (enabled) => set({ enabled }),
      }),
      {
        name: "proposal-music",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
}
