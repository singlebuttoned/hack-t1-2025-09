import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { mockBackend } from '../mock-backend';
import { useLogDataStore } from '../stores/useLogDataStore';
import { usePaginationStore } from '../stores/usePaginationStore';
import { useSearchStore } from '../stores/useSearchStore';

// ...

// ...

export function useLogSearch() {
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

  const { cursor, limit, setNextCursor } = usePaginationStore();
  const { setLogs, setLoading, setError, setTotal } = useLogDataStore();

  const { data, error, isLoading } = useQuery({
    queryKey: ['logs', searchParams, cursor, limit],
    queryFn: () =>
      mockBackend.search({
        ...searchParams,
        cursor,
        limit
      }),
    gcTime: 0
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  useEffect(() => {
    if (data) {
      setLogs(data.logs);
      setTotal(data.total);
      setNextCursor(data.nextCursor);
    }
  }, [data, setLogs, setTotal, setNextCursor]);

  return { isLoading, error };
}
