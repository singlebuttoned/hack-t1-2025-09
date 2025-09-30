'use client';

import { useEffect, useMemo } from 'react';
import {
  addErrorHandler,
  getAppNames,
  registerApplication,
  removeErrorHandler,
  start
} from 'single-spa';

import type { MicroFrontendEdition } from '@/mfes/config';
import { useEdition } from '@/mfes/lib/edition-context';
import { getEditionMicroFrontends } from '@/mfes/lib/mfe-helpers';
import {
  clearMfeRuntimeError,
  reportMfeRuntimeError
} from '@/mfes/lib/mfe-runtime-error-store';

type MfeTestErrorDetail = {
  mfeKey: string;
  message?: string;
};

declare global {
  interface Window {
    __mfeTestUtils?: {
      injectError: (mfeKey: string, message?: string) => void;
      getLastError: () => MfeTestErrorDetail | null;
      clearLastError: () => void;
    };
  }
}

const TEST_MODE_ENABLED = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

let testHarnessInstalled = false;
let testHarnessLastError: MfeTestErrorDetail | null = null;
let testHarnessHandler: ((event: Event) => void) | null = null;

export function installTestHarnessIfNeeded() {
  if (
    testHarnessInstalled ||
    typeof window === 'undefined' ||
    !TEST_MODE_ENABLED
  ) {
    return;
  }

  const setActiveError = (detail: MfeTestErrorDetail) => {
    testHarnessLastError = detail;
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-mfe-active-error', detail.mfeKey);
    }
  };

  const clearActiveError = () => {
    testHarnessLastError = null;
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-mfe-active-error');
    }
  };

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<MfeTestErrorDetail | undefined>;
    const detail = customEvent.detail;

    if (!detail || typeof detail.mfeKey !== 'string') {
      return;
    }

    const error = new Error(detail.message ?? 'Injected micro-frontend error');
    setActiveError({ mfeKey: detail.mfeKey, message: error.message });
    reportMfeRuntimeError(detail.mfeKey, error);
  };

  window.addEventListener('mfe:test:error', handler as EventListener);

  window.__mfeTestUtils = {
    injectError: (mfeKey: string, message?: string) => {
      window.dispatchEvent(
        new CustomEvent<MfeTestErrorDetail>('mfe:test:error', {
          detail: { mfeKey, message }
        })
      );
    },
    getLastError: () => testHarnessLastError,
    clearLastError: () => {
      clearActiveError();
    }
  };

  testHarnessHandler = handler;
  testHarnessInstalled = true;
}

if (typeof window !== 'undefined') {
  installTestHarnessIfNeeded();
}

export function __resetMfeTestHarnessForTesting() {
  testHarnessInstalled = false;
  testHarnessLastError = null;
  if (typeof document !== 'undefined') {
    document.body.removeAttribute('data-mfe-active-error');
  }
  if (typeof window !== 'undefined') {
    if (testHarnessHandler) {
      window.removeEventListener(
        'mfe:test:error',
        testHarnessHandler as EventListener
      );
    }
    delete window.__mfeTestUtils;
  }
  testHarnessHandler = null;
}

let singleSpaStarted = false;
let errorHandlerRegistered = false;

interface SingleSpaRootProps {
  edition?: MicroFrontendEdition;
}

type SingleSpaErrorHandler = (error: unknown) => void;

export function SingleSpaRoot({ edition }: SingleSpaRootProps) {
  const { edition: contextEdition } = useEdition();
  const activeEdition = edition ?? contextEdition;
  // keep the list of MFEs stable for the chosen edition so we only register
  // apps when the edition actually changes
  const definitions = useMemo(
    () => getEditionMicroFrontends(activeEdition),
    [activeEdition]
  );

  // register MFEs from editions list
  useEffect(() => {
    const registeredApps = new Set(getAppNames());

    definitions.forEach((definition) => {
      if (registeredApps.has(definition.key)) {
        return;
      }

      // defer loading the lifecycle bundle until the route becomes active
      registerApplication({
        name: definition.key,
        app: async () => definition.loader(),
        activeWhen: (location) =>
          location.pathname.startsWith(definition.pathPrefix),
        customProps: {
          basename: definition.pathPrefix,
          containerId: definition.containerId
        }
      });
    });

    if (!singleSpaStarted) {
      // start single-spa exactly once; urlRerouteOnly avoids double-pushing
      // history entries because Next already manages the outer router
      start({ urlRerouteOnly: true });
      singleSpaStarted = true;
    }
  }, [definitions]);

  // register error handler
  useEffect(() => {
    if (errorHandlerRegistered) {
      return;
    }

    const handler: SingleSpaErrorHandler = (error) => {
      const maybeError = error as {
        appOrParcelName?: unknown;
        originalError?: unknown;
      };
      const appName = maybeError.appOrParcelName;
      const originalError = maybeError.originalError;

      if (typeof appName === 'string' && originalError instanceof Error) {
        reportMfeRuntimeError(appName, originalError);
      }
    };

    addErrorHandler(handler);
    errorHandlerRegistered = true;

    return () => {
      removeErrorHandler(handler);
      errorHandlerRegistered = false;
    };
  }, []);

  useEffect(() => {
    clearMfeRuntimeError();
    if (TEST_MODE_ENABLED && typeof window !== 'undefined') {
      window.__mfeTestUtils?.clearLastError();
    }
  }, [activeEdition]);

  return (
    <div className='flex flex-1 flex-col'>
      {/* render a container DIV for each definition so mount() has a target */}
      {definitions.map((definition) => (
        <div
          key={definition.key}
          id={definition.containerId}
          data-mfe-container={definition.key}
          className='flex-1'
        />
      ))}
    </div>
  );
}

export default SingleSpaRoot;
