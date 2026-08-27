"use client";

import { createStore, type StoreApi } from "zustand/vanilla";

export type AnimationState = "idle" | "proposing" | "accepted";

export interface NoButtonPosition {
  x: number;
  y: number;
}

export interface ProposalStoreState {
  proposalAccepted: boolean;
  animationState: AnimationState;
  noButtonPosition: NoButtonPosition | null;
  noButtonFleeCount: number;
  accept: () => void;
  moveNoButton: (position: NoButtonPosition) => void;
  setAnimationState: (animationState: AnimationState) => void;
  replay: () => void;
}

export type ProposalStoreApi = StoreApi<ProposalStoreState>;

export function createProposalStore(): ProposalStoreApi {
  return createStore<ProposalStoreState>()((set) => ({
    proposalAccepted: false,
    animationState: "idle",
    noButtonPosition: null,
    noButtonFleeCount: 0,
    accept: () => set({ proposalAccepted: true, animationState: "accepted" }),
    moveNoButton: (position) =>
      set((state) => ({
        noButtonPosition: position,
        noButtonFleeCount: state.noButtonFleeCount + 1,
      })),
    setAnimationState: (animationState) => set({ animationState }),
    replay: () =>
      set({
        proposalAccepted: false,
        animationState: "idle",
        noButtonPosition: null,
        noButtonFleeCount: 0,
      }),
  }));
}
