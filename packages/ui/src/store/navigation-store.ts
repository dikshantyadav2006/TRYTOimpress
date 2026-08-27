import { create } from "zustand";

interface NavigationStoreState {
  pending: boolean;
  start: () => void;
  done: () => void;
}

export const useNavigationStore = create<NavigationStoreState>()((set) => ({
  pending: false,
  start: () => set({ pending: true }),
  done: () => set({ pending: false }),
}));
