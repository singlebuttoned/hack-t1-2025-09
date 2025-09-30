'use client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Storyboard } from './features/Storyboard';

import type { MicroFrontendRuntimeProps } from '../lib/types';

export function App({ basename }: MicroFrontendRuntimeProps) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route path='/' element={<Storyboard />} />
      </Routes>
    </BrowserRouter>
  );
}
