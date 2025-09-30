'use client';
import { useTheme } from 'next-themes';
import React from 'react';

import { AuthProvider } from '@/lib/mock-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Theme is handled by ThemeProvider (next-themes)
  useTheme(); // Keep for theme system compatibility

  return (
    <>
      <AuthProvider appearance={{}}>{children}</AuthProvider>
    </>
  );
}
