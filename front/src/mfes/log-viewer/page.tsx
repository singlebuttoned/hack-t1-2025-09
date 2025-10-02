'use client';

import { ChartsPanel } from './components/charts/ChartsPanel';
import { FilterBar } from './components/filters/FilterBar';
import { LogList } from './components/logs/LogList';
import { PaginationControls } from './components/logs/PaginationControls';
import { SearchBar } from './components/search/SearchBar';
import { useLogSearch } from './hooks/useLogSearch';
import { useLogDataStore } from './stores/useLogDataStore';

export default function LogViewerPage() {
  const { isLoading, error } = useLogSearch();
  const { logs } = useLogDataStore();

  return (
    <div className='flex h-full flex-col'>
      <SearchBar />
      <FilterBar />
      <div className='flex-grow p-4'>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {!isLoading && !error && (
          <>
            <LogList logs={logs} />
            <PaginationControls />
            <ChartsPanel />
          </>
        )}
      </div>
    </div>
  );
}
