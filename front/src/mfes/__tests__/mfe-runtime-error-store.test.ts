import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearMfeRuntimeError,
  reportMfeRuntimeError,
  useMfeRuntimeErrorStore
} from '../lib/mfe-runtime-error-store';

const resetStore = () => {
  useMfeRuntimeErrorStore.setState({ error: null });
};

describe('mfe-runtime-error-store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('tags reported errors with the MFE key', () => {
    const error = new Error('boot failure');

    reportMfeRuntimeError('product', error);

    const storedError = useMfeRuntimeErrorStore.getState().error;

    expect(storedError).not.toBeNull();
    expect(storedError?.message).toBe('boot failure');
    expect(storedError?.mfeKey).toBe('product');
  });

  it('overwrites previous errors when a new one is reported', () => {
    reportMfeRuntimeError('overview', new Error('first issue'));
    reportMfeRuntimeError('storyboard', new Error('second issue'));

    const storedError = useMfeRuntimeErrorStore.getState().error;

    expect(storedError?.message).toBe('second issue');
    expect(storedError?.mfeKey).toBe('storyboard');
  });

  it('clears the stored error when requested', () => {
    reportMfeRuntimeError('profile', new Error('unexpected error'));

    clearMfeRuntimeError();

    expect(useMfeRuntimeErrorStore.getState().error).toBeNull();
  });
});
