import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WithMfeHostBoundary } from '../lib/mfe-host-boundary';
import { useMfeRuntimeErrorStore } from '../lib/mfe-runtime-error-store';

let capturedError: Error | null = null;

class TestErrorBoundary extends React.Component<React.PropsWithChildren> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    capturedError = error;
  }

  render() {
    if (this.state.error) {
      return <div data-testid='caught-error'>{this.state.error.message}</div>;
    }

    return this.props.children;
  }
}

describe('WithMfeHostBoundary', () => {
  beforeEach(() => {
    capturedError = null;
    useMfeRuntimeErrorStore.setState({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useMfeRuntimeErrorStore.setState({ error: null });
  });

  it('rethrows runtime errors so the parent boundary can capture them', () => {
    const rendered = render(
      <TestErrorBoundary>
        <WithMfeHostBoundary>
          <span>child</span>
        </WithMfeHostBoundary>
      </TestErrorBoundary>
    );

    const store = useMfeRuntimeErrorStore.getState();

    act(() => {
      store.setError(new Error('overview failed'), 'overview');
    });

    expect(rendered.getByTestId('caught-error')).toHaveTextContent(
      'overview failed'
    );
    expect(capturedError).not.toBeNull();
    expect(capturedError?.message).toBe('overview failed');
    expect((capturedError as Error & { mfeKey?: string }).mfeKey).toBe(
      'overview'
    );
  });

  it('clears stored errors when unmounted', () => {
    const clearSpy = vi.spyOn(useMfeRuntimeErrorStore.getState(), 'clearError');

    const { unmount } = render(
      <WithMfeHostBoundary>
        <span>child</span>
      </WithMfeHostBoundary>
    );

    unmount();

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
