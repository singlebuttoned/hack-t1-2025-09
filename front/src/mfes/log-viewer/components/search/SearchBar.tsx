'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { Input } from '@/components/ui/input';

import { useSearchStore } from '../../stores/useSearchStore';

export function SearchBar() {
  const { query, setQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [debouncedQuery] = useDebounce(localQuery, 300);

  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

  return (
    <div className='border-b p-4'>
      <Input
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder='Search logs...'
      />
    </div>
  );
}
