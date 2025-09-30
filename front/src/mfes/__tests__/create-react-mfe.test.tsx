import { afterEach, describe, expect, it, vi } from 'vitest';

const singleSpaReactMock = vi.fn();
const reportMfeRuntimeErrorMock = vi.fn();

vi.mock('single-spa-react', () => ({
  __esModule: true,
  default: singleSpaReactMock
}));

vi.mock('../lib/mfe-runtime-error-store', () => ({
  reportMfeRuntimeError: reportMfeRuntimeErrorMock
}));

const { createReactMfe } = await import('../lib/create-react-mfe');

afterEach(() => {
  document.body.innerHTML = '';
});

describe('createReactMfe', () => {
  it('configures single-spa-react with the provided component and name', () => {
    singleSpaReactMock.mockReset();
    reportMfeRuntimeErrorMock.mockReset();
    singleSpaReactMock.mockImplementation((options) => options as never);

    const RootComponent = () => <div>root</div>;

    createReactMfe({ name: 'product', RootComponent });

    expect(singleSpaReactMock).toHaveBeenCalledTimes(1);
    const options = singleSpaReactMock.mock.calls[0][0];

    expect(options.rootComponent).toBe(RootComponent);
    expect(typeof options.domElementGetter).toBe('function');
    expect(typeof options.errorBoundary).toBe('function');

    document.body.innerHTML = '<div id="existing"></div>';
    const existing = options.domElementGetter({
      containerId: 'existing'
    } as never);
    expect(existing?.id).toBe('existing');

    document.body.innerHTML = '';
    const created = options.domElementGetter({} as never);
    expect(created?.id).toBe('product-container');
  });

  it('reports runtime errors via the error boundary hook', () => {
    singleSpaReactMock.mockReset();
    reportMfeRuntimeErrorMock.mockReset();
    singleSpaReactMock.mockImplementation((options) => options as never);

    const RootComponent = () => <div>root</div>;

    createReactMfe({ name: 'overview', RootComponent });

    const options = singleSpaReactMock.mock.calls[0][0];

    const error = new Error('render failed');
    options.errorBoundary(error);

    expect(reportMfeRuntimeErrorMock).toHaveBeenCalledWith('overview', error);
  });
});
