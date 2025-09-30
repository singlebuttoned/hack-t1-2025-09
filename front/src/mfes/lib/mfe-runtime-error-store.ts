'use client';

import { create } from 'zustand';

export type MfeRuntimeError = Error & { mfeKey?: string };

export type MfeRuntimeErrorStore = {
  error: MfeRuntimeError | null;
  setError: (error: Error, mfeKey: string) => void;
  clearError: () => void;
};

const useMfeRuntimeErrorStore = create<MfeRuntimeErrorStore>((set) => ({
  error: null,
  setError: (error, mfeKey) => {
    const taggedError = error as Error & { mfeKey?: string };
    taggedError.mfeKey = mfeKey;
    set({ error: taggedError });
  },
  clearError: () => set({ error: null })
}));

export const selectMfeRuntimeError = (state: MfeRuntimeErrorStore) =>
  state.error;

export function useMfeRuntimeError(): MfeRuntimeError | null {
  return useMfeRuntimeErrorStore(selectMfeRuntimeError);
}

export function reportMfeRuntimeError(mfeKey: string, error: Error) {
  useMfeRuntimeErrorStore.getState().setError(error, mfeKey);
}

export function clearMfeRuntimeError() {
  useMfeRuntimeErrorStore.getState().clearError();
}

export { useMfeRuntimeErrorStore };
