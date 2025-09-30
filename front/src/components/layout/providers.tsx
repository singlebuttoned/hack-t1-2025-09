'use client';
import { useTheme } from 'next-themes';
import React from 'react';

import { EditionSwitcher } from '@/components/edition-switcher';
import { AuthProvider } from '@/lib/mock-auth';
import { EditionProvider } from '@/mfes/lib/edition-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Theme is handled by ThemeProvider (next-themes)
  useTheme(); // Keep for theme system compatibility

  return (
    <EditionProvider>
      <AuthProvider appearance={{}}>{children}</AuthProvider>
      {process.env.NODE_ENV === 'development' ? <EditionSwitcher /> : null}
    </EditionProvider>
  );
}
