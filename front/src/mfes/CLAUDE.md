# Micro Frontend Architecture Guide

This document explains how the dashboard shell boots micro frontends (MFEs), how single-spa is configured, and what to touch when you add or modify an MFE. The current implementation keeps every bundle inside the Next.js project, but the wiring is ready for external builds once we adopt import maps.

---

## Runtime Overview

1. **Configuration** – `src/mfes/config.ts` lists every MFE, its route prefix, icon, and the async loader that returns single-spa lifecycles.
2. **Host route** – `src/app/dashboard/[[...slug]]/page.tsx` validates incoming URLs and renders the runtime layer (`<SingleSpaRoot />`).
3. **Runtime layer** – `SingleSpaRoot` registers MFEs with single-spa, creates container `<div>` nodes, and starts the single-spa orchestrator.
4. **Mounting** – When the current location matches an MFE's `pathPrefix`, single-spa calls `mount`. Each MFE is a React app bootstrapped through `createReactMfe`, which attaches to the container and passes down runtime props (`basename`, `containerId`).
5. **Error funnel** – Runtime errors are reported to `mfe-runtime-error-store` and re-thrown by `WithMfeHostBoundary`, so Next.js error boundaries and the dev overlay still catch issues.

### Key Files At A Glance

```text
src/mfes/
├─ config.ts            # Registry of MFEs + edition configs
├─ lib/
│  ├─ create-react-mfe.tsx      # Factory around single-spa-react
│  ├─ single-spa-root.tsx       # Registers and renders MFEs
│  ├─ edition-context.tsx       # Edition state + provider
│  ├─ mfe-helpers.ts            # Lookup helpers (build nav, etc.)
│  ├─ mfe-runtime-error-store.ts# Zustand store for runtime errors
│  ├─ mfe-host-boundary.tsx     # Host-side error boundary shim
│  └─ path-prefix-helper.ts     # Type-safe path prefixes
├─ shared/               # Utilities/components shared between MFEs
└─ <mfe-key>/            # Individual React apps (overview, product, ...)
```

---

## Configuration & Editions

Each MFE is registered once inside `microFrontendDefinitions`. A minimal entry looks like this:

```ts
// src/mfes/config.ts
import { validPathPrefix } from './lib/path-prefix-helper';

export const microFrontendDefinitions = [
  {
    key: 'overview',
    title: 'Dashboard',
    icon: 'dashboard',
    pathPrefix: validPathPrefix('/dashboard/overview'),
    containerId: 'mfe-dashboard-overview-container',
    loader: () => import('./overview')
  }
] as const;
```

Editions group MFEs into bundles that control navigation and runtime registration. Update `editionConfigurations` to expose new features or create bespoke experiences:

```ts
export const editionConfigurations = [
  {
    key: 'default',
    label: 'Full Experience',
    mfes: ['overview', 'product', 'profile']
  },
  {
    key: 'ops',
    label: 'Operations',
    mfes: ['overview', 'storyboard']
  }
] as const;
```

The active edition lives in `EditionProvider` (a React context). During development we persist the selection in `localStorage` and expose a draggable `EditionSwitcher` so engineers can swap bundles on the fly.

```tsx
// src/components/layout/providers.tsx
return (
  <EditionProvider>
    <AuthProvider appearance={{}}>{children}</AuthProvider>
    {process.env.NODE_ENV === 'development' ? <EditionSwitcher /> : null}
  </EditionProvider>
);
```

---

## Host Route & Single-Spa Root

The Next.js catch-all route delegates rendering to single-spa only if the URL matches a known `pathPrefix`, to properly handle 404s:

```tsx
// src/app/dashboard/[[...slug]]/page.tsx
const fullPath = `/dashboard/${slug.join('/')}`;
if (!isKnownMfe(fullPath)) {
  notFound();
}

return (
  <div className='flex flex-1 flex-col overflow-hidden'>
    <WithMfeHostBoundary>
      <SingleSpaRoot />
    </WithMfeHostBoundary>
  </div>
);
```

`SingleSpaRoot` registers the MFEs for the active edition and starts the orchestrator once.

---

## Creating a New MFE

Follow this workflow to add a new feature surface.

### 1. Scaffold the directory

```
src/mfes/orders/
├─ App.tsx
├─ components/
├─ index.tsx
└─ screens/
```

### 2. Implement the React app

Every MFE owns its own `BrowserRouter`. Use the injected `basename` so the app works when mounted under `/dashboard/<slug>`:

```tsx
// src/mfes/orders/App.tsx
'use client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OrdersList } from './screens/OrdersList';
import { OrderDetails } from './screens/OrderDetails';
import { NotFound } from '../shared/not-found';
import type { MicroFrontendRuntimeProps } from '../lib/types';

export function App({ basename }: MicroFrontendRuntimeProps) {
  return (
    <BrowserRouter basename={basename ?? '/'}>
      <Routes>
        <Route index element={<OrdersList />} />
        <Route path=':orderId' element={<OrderDetails />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. Export single-spa lifecycles

Wrap the React app with `createReactMfe`. The `name` should be globally unique and match the container IDs you plan to use.

```ts
// src/mfes/orders/index.tsx
'use client';
import { App } from './App';
import { createReactMfe } from '../lib/create-react-mfe';

const lifecycles = createReactMfe({
  name: 'dashboard-orders',
  RootComponent: App
});

export const { bootstrap, mount, unmount, update } = lifecycles;
```

### 4. Register the MFE in the host config

Add an entry to `microFrontendDefinitions` and link it to editions that should expose it:

```ts
// src/mfes/config.ts
microFrontendDefinitions.push({
  key: 'orders',
  title: 'Orders',
  icon: 'billing',
  pathPrefix: validPathPrefix('/dashboard/orders'),
  containerId: 'mfe-dashboard-orders-container',
  loader: () => import('./orders')
});
```

> **Tip:** `validPathPrefix` enforces “starts with /” and “no trailing /” at runtime in development so broken routes fail fast.

### 5. (Optional) Share utilities

If you need cross-MFE helpers, add them under `src/mfes/shared` or move them to the higher-level shared folders (`src/components`, `src/lib`, etc.). Keep MFE bundles import-clean so they can be extracted later without pulling Next.js-only dependencies.

---

## Runtime Error Handling

Errors thrown while booting or rendering an MFE are captured and surfaced through the host:

```ts
// src/mfes/lib/mfe-runtime-error-store.ts
reportMfeRuntimeError(appName, originalError);

// src/mfes/lib/mfe-host-boundary.tsx
useEffect(() => {
  if (error !== null) {
    throw error;
  }
}, [error]);
```

Because the boundary rethrows the error, the standard Next.js error page (or dev overlay) still appears, preserving the usual debugging experience.

---

## Debugging & Tips

- **Inspect registrations** – `singleSpa.getAppNames()` in the browser console shows which MFEs were registered. If your app is missing, check `editionConfigurations` and the `containerId`.
- **Route checks** – If `isKnownMfe` rejects your path, make sure the `pathPrefix` you registered matches the actual URL (no trailing slash, include `/dashboard`).
- **Hot reloading** – Since MFEs live in the same Next.js process, Turbopack hot reload works without extra setup.
- **Local persistence** – Edition selection is only persisted in development. In production every user will get the `DEFAULT_EDITION` (currently `default`).
- **Future remotes** – Keep dependencies limited to shared packages; avoid importing Next.js-only modules (e.g., `next/navigation`) from inside MFEs so we can decouple them into standalone bundles down the line.

---

## Quick Reference Checklist

1. Create `src/mfes/<key>/` with an `App` component that renders your feature.
2. Wrap it with `createReactMfe` and export the single-spa lifecycles.
3. Register the MFE in `microFrontendDefinitions` and add it to the proper editions.
4. Verify navigation updates (sidebar entries come from `useEditionNavItems`).
5. Add smoke tests or Playwright coverage to exercise the new routes.
6. When in doubt, mirror the existing MFEs (`overview`, `product`, `profile`, `storyboard`).

This workflow keeps the host shell stable while allowing us to grow feature surfaces independently—and, in the future, host them from separate repos or pipelines with minimal changes.
