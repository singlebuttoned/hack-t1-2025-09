'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import LogViewerPage from './page';

import type { MicroFrontendRuntimeProps } from '../lib/types';

const queryClient = new QueryClient();

export function App({ basename }: MicroFrontendRuntimeProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename ?? '/'}>
        <Routes>
          <Route index element={<LogViewerPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
