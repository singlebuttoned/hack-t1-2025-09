'use client';

import { useEffect, type ReactNode } from 'react';

import { useMfeRuntimeErrorStore } from './mfe-runtime-error-store';

interface WithMfeHostBoundaryProps {
  children: ReactNode;
}

export function WithMfeHostBoundary({ children }: WithMfeHostBoundaryProps) {
  const { error, clearError } = useMfeRuntimeErrorStore();

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    if (error !== null) {
      // rethrow the error to be handled by the global error boundary
      throw error;
    }
  }, [error]);

  return <>{children}</>;
}

export default WithMfeHostBoundary;
