import { create } from 'zustand';

import { LogEntry } from '../mock-backend/types';

interface LogDataStore {
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  total: number;
  setLogs: (logs: LogEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotal: (total: number) => void;
}

export const useLogDataStore = create<LogDataStore>((set) => ({
  logs: [],
  loading: false,
  error: null,
  total: 0,
  setLogs: (logs) => set({ logs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTotal: (total) => set({ total })
}));
