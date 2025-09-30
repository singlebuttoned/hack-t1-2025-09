'use client';

import { App } from './App';
import { createReactMfe } from '../lib/create-react-mfe';

import type { MicroFrontendRuntimeProps } from '../lib/types';

const lifecycles = createReactMfe<MicroFrontendRuntimeProps>({
  name: 'dashboard-product',
  RootComponent: App
});

export const { bootstrap, mount, unmount, update } = lifecycles;
