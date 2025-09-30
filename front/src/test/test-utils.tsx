import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/mock-auth';
import { vi } from 'vitest';

// Mock Next.js router for testing
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn()
};

// Mock Next.js App Router context
const mockAppRouterContext = {
  ...mockRouter,
  pathname: '/dashboard',
  route: '/dashboard',
  query: {},
  asPath: '/dashboard'
};

// Mock auth provider for testing
const mockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // For component tests, we use our mock auth provider
  return <AuthProvider>{children}</AuthProvider>;
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      {mockAuthProvider({ children })}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Export test utilities for authentication mocking
export const mockAuthenticatedUser = {
  id: 'test-user-id',
  primaryEmailAddress: { emailAddress: 'test@example.com' },
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  fullName: 'Test User',
  username: 'testuser',
  emailAddresses: [
    {
      id: 'email_test',
      emailAddress: 'test@example.com',
      verification: { status: 'verified' }
    }
  ]
};

export const mockUnauthenticatedUser = null;

// Export mock router for tests that need it
export { mockRouter, mockAppRouterContext };
