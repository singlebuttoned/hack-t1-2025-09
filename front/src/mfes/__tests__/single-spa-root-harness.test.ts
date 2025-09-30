import { beforeEach, describe, expect, it, vi } from 'vitest';

declare global {
  interface Window {
    __mfeTestUtils?: unknown;
  }
}

const originalEnv = process.env.NEXT_PUBLIC_TEST_MODE;

const resetGlobals = () => {
  delete window.__mfeTestUtils;
  if (typeof document !== 'undefined') {
    document.body.removeAttribute('data-mfe-active-error');
  }
};

describe('SingleSpaRoot test harness gating', () => {
  beforeEach(() => {
    resetGlobals();
    vi.resetModules();
    process.env.NEXT_PUBLIC_TEST_MODE = originalEnv;
  });

  it('does not install the harness when NEXT_PUBLIC_TEST_MODE is not true', async () => {
    resetGlobals();
    process.env.NEXT_PUBLIC_TEST_MODE = undefined;
    const module = await import('../lib/single-spa-root');

    expect(window.__mfeTestUtils).toBeUndefined();

    module.__resetMfeTestHarnessForTesting();
  });

  it('installs the harness when NEXT_PUBLIC_TEST_MODE is true', async () => {
    resetGlobals();
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    const module = await import('../lib/single-spa-root');

    expect(window.__mfeTestUtils).toBeDefined();

    module.__resetMfeTestHarnessForTesting();
  });
});

afterAll(() => {
  process.env.NEXT_PUBLIC_TEST_MODE = originalEnv;
  resetGlobals();
});
