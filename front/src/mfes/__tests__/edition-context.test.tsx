import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_EDITION } from '../config';

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_DASHBOARD_EDITION;

function clearEnv() {
  process.env.NEXT_PUBLIC_DASHBOARD_EDITION = ORIGINAL_ENV;
}

describe('EditionProvider environment configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    clearEnv();
  });

  afterEach(() => {
    clearEnv();
    vi.restoreAllMocks();
  });

  it('uses an env-configured edition when provided', async () => {
    process.env.NEXT_PUBLIC_DASHBOARD_EDITION = 'v1';

    const { EditionProvider, useEdition } = await import(
      '../lib/edition-context'
    );

    const TestConsumer = () => {
      const { edition } = useEdition();
      return <span data-testid='current-edition'>{edition}</span>;
    };

    render(
      <EditionProvider>
        <TestConsumer />
      </EditionProvider>
    );

    expect(screen.getByTestId('current-edition')).toHaveTextContent('v1');
  });

  it('falls back to the default edition when env value is invalid', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.NEXT_PUBLIC_DASHBOARD_EDITION = 'not-real';

    const { EditionProvider, useEdition } = await import(
      '../lib/edition-context'
    );

    const TestConsumer = () => {
      const { edition } = useEdition();
      return <span data-testid='current-edition'>{edition}</span>;
    };

    render(
      <EditionProvider>
        <TestConsumer />
      </EditionProvider>
    );

    expect(screen.getByTestId('current-edition')).toHaveTextContent(
      DEFAULT_EDITION
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid NEXT_PUBLIC_DASHBOARD_EDITION value')
    );
    warnSpy.mockRestore();
  });
});
