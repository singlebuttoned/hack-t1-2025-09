import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mockBackend } from '../mock-backend';
import { usePaginationStore } from '../stores/usePaginationStore';
import { useSearchStore } from '../stores/useSearchStore';

// ...

export function useLogAggregations(aggregation: 'level' | 'time') {
  const query = useSearchStore((state) => state.query);
  const timeRange = useSearchStore((state) => state.timeRange);
  const fieldFilters = useSearchStore((state) => state.fieldFilters);

  const searchParams = useMemo(() => {
    const fieldFilterQueries = Object.entries(fieldFilters)
      .flatMap(([field, values]) =>
        values.map((value) => `${field}:"${value}"`)
      )
      .join(' AND ');

    const finalQuery = [query, fieldFilterQueries]
      .filter(Boolean)
      .join(' AND ');

    return {
      query: finalQuery,
      timeRange: timeRange
    };
  }, [query, timeRange, fieldFilters]);

  const { cursor, limit } = usePaginationStore();

  return useQuery({
    queryKey: ['logs-aggregation', aggregation, searchParams],
    queryFn: () =>
      mockBackend.getAggregations(
        { ...searchParams, cursor, limit },
        aggregation
      )
  });
}
