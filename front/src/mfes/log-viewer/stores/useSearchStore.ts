import { create } from 'zustand';

export interface SearchParams {
  query: string;
  timeRange: { start: Date; end: Date } | null;
}

interface SearchStore {
  query: string;
  queryMode: 'simple' | 'advanced';
  timeRange: { start: Date; end: Date } | null;
  fieldFilters: Record<string, string[]>;

  setQuery: (q: string) => void;
  setQueryMode: (mode: 'simple' | 'advanced') => void;
  setTimeRange: (range: { start: Date; end: Date } | null) => void;
  addFieldFilter: (field: string, value: string) => void;
  removeFieldFilter: (field: string, value: string) => void;
  clearFilters: () => void;

  getSearchParams: () => SearchParams;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '*',
  queryMode: 'simple',
  timeRange: null,
  fieldFilters: {},

  setQuery: (q) => set({ query: q }),
  setQueryMode: (mode) => set({ queryMode: mode }),
  setTimeRange: (range) => set({ timeRange: range }),

  addFieldFilter: (field, value) =>
    set((state) => ({
      fieldFilters: {
        ...state.fieldFilters,
        [field]: [...(state.fieldFilters[field] ?? []), value]
      }
    })),

  removeFieldFilter: (field, value) =>
    set((state) => ({
      fieldFilters: {
        ...state.fieldFilters,
        [field]: (state.fieldFilters[field] ?? []).filter((v) => v !== value)
      }
    })),

  clearFilters: () => set({ fieldFilters: {}, timeRange: null, query: '*' }),

  getSearchParams: () => {
    const state = get();
    const fieldFilterQueries = Object.entries(state.fieldFilters)
      .flatMap(([field, values]) =>
        values.map((value) => `${field}:"${value}"`)
      )
      .join(' AND ');

    const finalQuery = [state.query, fieldFilterQueries]
      .filter(Boolean)
      .join(' AND ');

    return {
      query: finalQuery,
      timeRange: state.timeRange
    };
  }
}));
