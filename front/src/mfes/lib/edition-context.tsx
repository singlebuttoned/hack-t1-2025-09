'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { DEFAULT_EDITION, editionConfigurations } from '@/mfes/config';
import type { MicroFrontendEdition } from '@/mfes/config';

type EditionContextValue = {
  edition: MicroFrontendEdition;
  setEdition: (edition: MicroFrontendEdition) => void;
};

const EditionContext = createContext<EditionContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'dashboard:edition';
const IS_DEV = process.env.NODE_ENV === 'development';

function isValidEdition(value: string): value is MicroFrontendEdition {
  return editionConfigurations.some((config) => config.key === value);
}

export function resolveEditionFromEnv(
  rawValue = process.env.NEXT_PUBLIC_DASHBOARD_EDITION
): MicroFrontendEdition {
  if (typeof rawValue === 'string' && rawValue.length > 0) {
    if (isValidEdition(rawValue)) {
      return rawValue;
    }
    // eslint-disable-next-line no-console -- surface misconfiguration to developers
    console.warn(
      `Invalid NEXT_PUBLIC_DASHBOARD_EDITION value "${rawValue}". Falling back to "${DEFAULT_EDITION}".`
    );
  }

  return DEFAULT_EDITION;
}

const ENV_CONFIGURED_EDITION = resolveEditionFromEnv();

export function EditionProvider({ children }: { children: React.ReactNode }) {
  const [edition, setEditionState] = useState<MicroFrontendEdition>(() => {
    if (!IS_DEV || typeof window === 'undefined') {
      return ENV_CONFIGURED_EDITION;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      if (isValidEdition(stored)) {
        return stored;
      }

      window.localStorage.removeItem(STORAGE_KEY);
    }

    return ENV_CONFIGURED_EDITION;
  });

  useEffect(() => {
    if (!IS_DEV || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, edition);
  }, [edition]);

  const setEdition = useCallback((nextEdition: MicroFrontendEdition) => {
    setEditionState((current) =>
      current === nextEdition ? current : nextEdition
    );
  }, []);

  const value = useMemo(
    () => ({
      edition,
      setEdition
    }),
    [edition, setEdition]
  );

  return (
    <EditionContext.Provider value={value}>{children}</EditionContext.Provider>
  );
}

export function useEdition(): EditionContextValue {
  const context = useContext(EditionContext);
  if (!context) {
    throw new Error('useEdition must be used within an EditionProvider');
  }
  return context;
}
