"use client";

import { createStore, type StoreApi } from "zustand/vanilla";

export interface QuestionsState {
  answers: Record<string, string>;
  setAnswer: (questionId: string, optionId: string) => void;
  reset: () => void;
}

export type QuestionsStoreApi = StoreApi<QuestionsState>;

export function createQuestionsStore(): QuestionsStoreApi {
  return createStore<QuestionsState>()((set) => ({
    answers: {},
    setAnswer: (questionId, optionId) =>
      set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),
    reset: () => set({ answers: {} }),
  }));
}
