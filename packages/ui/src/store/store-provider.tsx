"use client";

import { createContext, useRef, type ReactNode } from "react";

import {
  createProposalStore,
  type ProposalStoreApi,
  type ProposalStoreState,
} from "./proposal-store";

export const ProposalStoreContext = createContext<ProposalStoreApi | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<ProposalStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createProposalStore();
  }

  return (
    <ProposalStoreContext.Provider value={storeRef.current}>
      {children}
    </ProposalStoreContext.Provider>
  );
}

export type { ProposalStoreState };
