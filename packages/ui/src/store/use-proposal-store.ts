"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import type { ProposalStoreState } from "./proposal-store";
import { ProposalStoreContext } from "./store-provider";

export function useProposalStore<T>(selector: (state: ProposalStoreState) => T): T {
  const store = useContext(ProposalStoreContext);

  if (!store) {
    throw new Error("useProposalStore must be used within a <StoreProvider>");
  }

  return useStore(store, selector);
}
