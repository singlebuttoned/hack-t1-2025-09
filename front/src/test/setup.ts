import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn()
}));

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation(({ src, alt, ...props }) => ({
    type: 'img',
    props: { src, alt, ...props }
  }))
}));

// Mock our custom auth hooks for unit tests
vi.mock('@/lib/mock-auth', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      username: 'testuser',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      imageUrl: 'https://example.com/avatar.jpg',
      emailAddresses: [
        {
          id: 'email_test',
          emailAddress: 'test@example.com',
          verification: { status: 'verified' }
        }
      ]
    }
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn().mockResolvedValue('mock-token'),
    signOut: vi.fn()
  }),
  SignOutButton: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(
      'button',
      { 'data-testid': 'sign-out-button' },
      children || 'Sign Out'
    ),
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-auth-provider' },
      children
    ),
  auth: vi.fn().mockResolvedValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id'
  })
}));

// Mock server-side auth
vi.mock('@/lib/mock-auth-server', () => ({
  auth: vi.fn().mockResolvedValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id'
  }),
  currentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    username: 'testuser',
    primaryEmailAddress: { emailAddress: 'test@example.com' },
    imageUrl: 'https://example.com/avatar.jpg',
    emailAddresses: [
      {
        id: 'email_test',
        emailAddress: 'test@example.com',
        verification: { status: 'verified' }
      }
    ]
  })
}));

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.location for tests that need it
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    replace: vi.fn(),
    assign: vi.fn()
  },
  writable: true
});

// JSDOM reports zero width/height for elements which causes recharts to warn.
// Provide a deterministic fallback size so chart components render without noise.
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect =
  function getBoundingClientRectOverride() {
    if (this instanceof HTMLElement) {
      const width = Number(this.getAttribute('data-test-width')) || 1024;
      const height = Number(this.getAttribute('data-test-height')) || 768;

      const rect = {
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
        toJSON() {
          return {
            width,
            height,
            top: 0,
            left: 0,
            right: width,
            bottom: height,
            x: 0,
            y: 0
          };
        }
      };

      return rect as DOMRect;
    }

    return originalGetBoundingClientRect.call(this);
  };
