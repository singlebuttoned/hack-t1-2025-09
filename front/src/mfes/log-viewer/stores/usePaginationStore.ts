import { create } from 'zustand';

interface PaginationStore {
  cursor: number;
  limit: number;
  history: number[];
  nextCursor: number | null;
  setNextCursor: (cursor: number | null) => void;
  goNext: () => void;
  goPrevious: () => void;
  canGoPrevious: () => boolean;
}

export const usePaginationStore = create<PaginationStore>((set, get) => ({
  cursor: 0,
  limit: 20,
  history: [0],
  nextCursor: null,
  setNextCursor: (cursor) => set({ nextCursor: cursor }),
  goNext: () => {
    const { nextCursor, history } = get();
    if (nextCursor !== null) {
      set({ cursor: nextCursor, history: [...history, nextCursor] });
    }
  },
  goPrevious: () => {
    const { history } = get();
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousCursor = newHistory[newHistory.length - 1];
      set({ cursor: previousCursor, history: newHistory });
    }
  },
  canGoPrevious: () => get().history.length > 1
}));
