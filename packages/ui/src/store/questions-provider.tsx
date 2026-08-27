"use client";

import { createContext, useRef, type ReactNode } from "react";

import {
  createQuestionsStore,
  type QuestionsStoreApi,
  type QuestionsState,
} from "./questions-store";

export const QuestionsStoreContext = createContext<QuestionsStoreApi | null>(null);

export interface QuestionsProviderProps {
  children: ReactNode;
}

export function QuestionsProvider({ children }: QuestionsProviderProps) {
  const storeRef = useRef<QuestionsStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createQuestionsStore();
  }

  return (
    <QuestionsStoreContext.Provider value={storeRef.current}>
      {children}
    </QuestionsStoreContext.Provider>
  );
}

export type { QuestionsState };
