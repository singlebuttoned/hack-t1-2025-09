import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { microFrontendDefinitions } from '../config';
import { getEditionMicroFrontends } from '../lib/mfe-helpers';

const registerApplicationMock = vi.fn();
const startMock = vi.fn();
const getAppNamesMock = vi.fn(() => []);
const addErrorHandlerMock = vi.fn();
const removeErrorHandlerMock = vi.fn();

vi.mock('single-spa', () => ({
  registerApplication: registerApplicationMock,
  start: startMock,
  getAppNames: getAppNamesMock,
  addErrorHandler: addErrorHandlerMock,
  removeErrorHandler: removeErrorHandlerMock
}));

const clearMfeRuntimeErrorMock = vi.fn();
const reportMfeRuntimeErrorMock = vi.fn();

vi.mock('../lib/mfe-runtime-error-store', () => ({
  clearMfeRuntimeError: clearMfeRuntimeErrorMock,
  reportMfeRuntimeError: reportMfeRuntimeErrorMock,
  useMfeRuntimeErrorStore: () => ({ error: null, clearError: vi.fn() })
}));

const useEditionMock = vi.fn(() => ({
  edition: 'default',
  setEdition: vi.fn()
}));

vi.mock('../lib/edition-context', () => ({
  useEdition: useEditionMock
}));

const { default: SingleSpaRoot } = await import('../lib/single-spa-root');

describe('SingleSpaRoot', () => {
  beforeEach(() => {
    registerApplicationMock.mockClear();
    startMock.mockClear();
    getAppNamesMock.mockClear();
    clearMfeRuntimeErrorMock.mockClear();
    reportMfeRuntimeErrorMock.mockClear();
    addErrorHandlerMock.mockClear();
    removeErrorHandlerMock.mockClear();
    useEditionMock.mockReturnValue({ edition: 'default', setEdition: vi.fn() });
  });

  it('registers each micro frontend exactly once and renders their containers', async () => {
    render(<SingleSpaRoot />);

    const expectedDefinitions = getEditionMicroFrontends('default');

    expectedDefinitions.forEach((definition) => {
      const container = document.getElementById(definition.containerId);
      expect(container).toBeInTheDocument();
      expect(container?.dataset.mfeContainer).toBe(definition.key);
    });

    await waitFor(() => {
      expect(registerApplicationMock).toHaveBeenCalledTimes(
        expectedDefinitions.length
      );
      expect(startMock).toHaveBeenCalledTimes(1);
    });

    expect(clearMfeRuntimeErrorMock).toHaveBeenCalled();
  });

  it('registers the micro frontends belonging to the active edition', async () => {
    useEditionMock.mockReturnValue({ edition: 'v1', setEdition: vi.fn() });

    render(<SingleSpaRoot />);

    const expectedDefinitions = getEditionMicroFrontends('v1');
    const unexpectedDefinitions = microFrontendDefinitions.filter(
      (definition) => !expectedDefinitions.includes(definition)
    );

    expectedDefinitions.forEach((definition) => {
      const container = document.getElementById(definition.containerId);
      expect(container).toBeInTheDocument();
    });

    unexpectedDefinitions.forEach((definition) => {
      expect(document.getElementById(definition.containerId)).toBeNull();
    });

    await waitFor(() => {
      expect(registerApplicationMock).toHaveBeenCalledTimes(
        expectedDefinitions.length
      );
    });

    const registeredNames = registerApplicationMock.mock.calls.map(
      ([options]) => options.name
    );

    expect(registeredNames).toEqual(expectedDefinitions.map((def) => def.key));
  });

  it('forwards single-spa runtime errors to the error store', () => {
    render(<SingleSpaRoot />);

    expect(addErrorHandlerMock).toHaveBeenCalledTimes(1);
    const handler = addErrorHandlerMock.mock.calls[0][0];

    const originalError = new Error('mount failure');
    handler({ appOrParcelName: 'product', originalError });

    expect(reportMfeRuntimeErrorMock).toHaveBeenCalledWith(
      'product',
      originalError
    );
  });

  it('clears runtime errors when the active edition changes', () => {
    const { rerender } = render(<SingleSpaRoot edition='default' />);

    // initial mount triggers a clear
    expect(clearMfeRuntimeErrorMock).toHaveBeenCalledTimes(1);
    clearMfeRuntimeErrorMock.mockClear();

    rerender(<SingleSpaRoot edition='v1' />);

    expect(clearMfeRuntimeErrorMock).toHaveBeenCalledTimes(1);
  });
});
