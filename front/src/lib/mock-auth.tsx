'use client';

import { createContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for mock auth
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  imageUrl: string;
  primaryEmailAddress: { emailAddress: string };
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification: { status: string };
  }>;
}

export interface MockAuthState {
  user: MockUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  sessionId: string | null;
  userId: string | null;
}

export interface MockAuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

// Default test user
const defaultUser: MockUser = {
  id: 'test-user-id',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  username: 'testuser',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryEmailAddress: { emailAddress: 'test@example.com' },
  emailAddresses: [
    {
      id: 'email_test',
      emailAddress: 'test@example.com',
      verification: { status: 'verified' }
    }
  ]
};

// Create mock auth store
const useMockAuthStore = create<MockAuthState & MockAuthActions>()(
  persist(
    (set, get) => ({
      // Initial state - check if there's a session cookie
      user:
        typeof window !== 'undefined' &&
        document.cookie.includes('mock-auth-session')
          ? defaultUser
          : null,
      isSignedIn:
        typeof window !== 'undefined' &&
        document.cookie.includes('mock-auth-session'),
      isLoaded: true,
      sessionId:
        typeof window !== 'undefined' &&
        document.cookie.includes('mock-auth-session')
          ? 'mock-session-id'
          : null,
      userId:
        typeof window !== 'undefined' &&
        document.cookie.includes('mock-auth-session')
          ? 'test-user-id'
          : null,

      // Actions
      signIn: async (email: string, _password: string) => {
        // Simple mock sign in - any email/password works
        const newState = {
          user: {
            ...defaultUser,
            primaryEmailAddress: { emailAddress: email },
            emailAddresses: [
              {
                id: 'email_test',
                emailAddress: email,
                verification: { status: 'verified' }
              }
            ]
          },
          isSignedIn: true,
          sessionId: 'mock-session-id',
          userId: 'test-user-id'
        };

        // Set cookie for middleware to read
        if (typeof window !== 'undefined') {
          document.cookie =
            'mock-auth-session=authenticated; path=/; max-age=86400'; // 24 hours
        }

        set(newState);
      },

      signUp: async (email: string, password: string) => {
        // Same as sign in for mock
        await get().signIn(email, password);
      },

      signOut: async () => {
        // Clear cookie
        if (typeof window !== 'undefined') {
          document.cookie =
            'mock-auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        set({
          user: null,
          isSignedIn: false,
          sessionId: null,
          userId: null
        });
      },

      getToken: async () => {
        return 'mock-jwt-token';
      }
    }),
    {
      name: 'mock-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isSignedIn: state.isSignedIn,
        sessionId: state.sessionId,
        userId: state.userId
      })
    }
  )
);

// Context for mock auth
const MockAuthContext = createContext<{
  store: typeof useMockAuthStore;
} | null>(null);

// Provider component
export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthContext.Provider value={{ store: useMockAuthStore }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Custom hooks for mock auth
export function useUser() {
  const store = useMockAuthStore();
  return {
    isLoaded: store.isLoaded,
    isSignedIn: store.isSignedIn,
    user: store.user
  };
}

export function useAuth() {
  const store = useMockAuthStore();
  return {
    isLoaded: store.isLoaded,
    isSignedIn: store.isSignedIn,
    userId: store.userId,
    sessionId: store.sessionId,
    getToken: store.getToken,
    signOut: store.signOut
  };
}

// Mock auth components
export function SignOutButton({
  children,
  redirectUrl
}: {
  children?: ReactNode;
  redirectUrl?: string;
}) {
  const { signOut } = useMockAuthStore();

  const handleSignOut = async () => {
    await signOut();
    if (
      typeof redirectUrl === 'string' &&
      redirectUrl.length > 0 &&
      typeof window !== 'undefined'
    ) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <button
      onClick={handleSignOut}
      data-testid='sign-out-button'
      className='w-full text-left'
    >
      {children ?? 'Sign Out'}
    </button>
  );
}

export function AuthProvider({
  children
}: {
  children: ReactNode;
  appearance?: unknown;
}) {
  return <MockAuthProvider>{children}</MockAuthProvider>;
}

export function SignIn({
  initialValues
}: {
  initialValues?: { emailAddress?: string };
}) {
  const { signIn } = useMockAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signIn(email, password);
    // Redirect to dashboard after sign in
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Sign In</h1>
        <p className='text-gray-600'>
          Mock authentication - any credentials work
        </p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium'>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            defaultValue={initialValues?.emailAddress ?? 'test@example.com'}
            className='w-full rounded-md border border-gray-300 px-3 py-2'
            required
          />
        </div>
        <div>
          <label htmlFor='password' className='block text-sm font-medium'>
            Password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            defaultValue='password'
            className='w-full rounded-md border border-gray-300 px-3 py-2'
            required
          />
        </div>
        <button
          type='submit'
          className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export function SignUp({
  initialValues
}: {
  initialValues?: { emailAddress?: string };
}) {
  const { signUp } = useMockAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signUp(email, password);
    // Redirect to dashboard after sign up
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Sign Up</h1>
        <p className='text-gray-600'>
          Mock authentication - any credentials work
        </p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium'>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            defaultValue={initialValues?.emailAddress ?? 'test@example.com'}
            className='w-full rounded-md border border-gray-300 px-3 py-2'
            required
          />
        </div>
        <div>
          <label htmlFor='password' className='block text-sm font-medium'>
            Password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            defaultValue='password'
            className='w-full rounded-md border border-gray-300 px-3 py-2'
            required
          />
        </div>
        <button
          type='submit'
          className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export function UserProfile() {
  const { user } = useUser();
  const { signOut } = useMockAuthStore();

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div className='w-full max-w-2xl space-y-6'>
      <h1 className='text-2xl font-bold'>Profile</h1>
      <div className='space-y-4 rounded-lg border p-6'>
        <div className='flex items-center space-x-4'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.imageUrl}
            alt={user.fullName}
            className='h-16 w-16 rounded-full'
          />
          <div>
            <h2 className='text-xl font-semibold'>{user.fullName}</h2>
            <p className='text-gray-600'>
              {user.primaryEmailAddress.emailAddress}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>First Name</label>
            <input
              type='text'
              value={user.firstName}
              className='w-full rounded-md border border-gray-300 px-3 py-2'
              readOnly
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Last Name</label>
            <input
              type='text'
              value={user.lastName}
              className='w-full rounded-md border border-gray-300 px-3 py-2'
              readOnly
            />
          </div>
          <div className='col-span-2'>
            <label className='mb-1 block text-sm font-medium'>Email</label>
            <input
              type='email'
              value={user.primaryEmailAddress.emailAddress}
              className='w-full rounded-md border border-gray-300 px-3 py-2'
              readOnly
            />
          </div>
        </div>
        <div className='border-t pt-4'>
          <button
            onClick={signOut}
            className='rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700'
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Server-side auth mock - for development, always authenticated
export function auth() {
  // Mock server-side auth - always return authenticated user for development
  // This is not async in mock mode since we don't need to check actual tokens
  return Promise.resolve({
    userId: 'test-user-id',
    sessionId: 'mock-session-id'
  });
}
