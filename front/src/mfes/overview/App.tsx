'use client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import OverviewPage from './components/overview';
import { NotFound } from '../shared/not-found';

import type { MicroFrontendRuntimeProps } from '../lib/types';

export function App({ basename }: MicroFrontendRuntimeProps) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
