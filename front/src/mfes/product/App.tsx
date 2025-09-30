'use client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ProductDetailsScreen } from './screens/ProductDetailsScreen';
import { ProductListScreen } from './screens/ProductListScreen';
import { NotFound } from '../shared/not-found';

import type { MicroFrontendRuntimeProps } from '../lib/types';

export function App({ basename }: MicroFrontendRuntimeProps) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route index element={<ProductListScreen />} />
        <Route path='new' element={<ProductDetailsScreen mode='create' />} />
        <Route
          path=':productId'
          element={<ProductDetailsScreen mode='edit' />}
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
