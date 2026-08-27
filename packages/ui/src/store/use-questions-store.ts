"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import type { QuestionsState } from "./questions-store";
import { QuestionsStoreContext } from "./questions-provider";

export function useQuestionsStore<T>(selector: (state: QuestionsState) => T): T {
  const store = useContext(QuestionsStoreContext);

  if (!store) {
    throw new Error("useQuestionsStore must be used within a <QuestionsProvider>");
  }

  return useStore(store, selector);
}
