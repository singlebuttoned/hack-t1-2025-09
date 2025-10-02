'use client';
import { App } from './App';
import { createReactMfe } from '../lib/create-react-mfe';

const lifecycles = createReactMfe({
  name: 'dashboard-log-viewer',
  RootComponent: App
});

export const { bootstrap, mount, unmount, update } = lifecycles;
