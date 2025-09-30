import { render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest';

const reloadMock = vi.fn();
let reloadSpy: vi.SpyInstance;
let DevErrorPage: (typeof import('../dev-error'))['default'];

beforeAll(() => {
  reloadSpy = vi
    .spyOn(window.location, 'reload')
    .mockImplementation(reloadMock as unknown as Location['reload']);
});

beforeAll(async () => {
  ({ default: DevErrorPage } = await import('../dev-error'));
});

afterEach(() => {
  reloadMock.mockClear();
});

afterAll(() => {
  reloadSpy.mockRestore();
});

describe('DevErrorPage', () => {
  it('falls back to a generic name when the error name is blank', () => {
    const error = new Error('boom');
    error.name = '   ';

    render(<DevErrorPage error={error} timestamp='2024-01-01 00:00' />);

    const message = screen.getByText(
      (_, element) => element?.classList.contains('message') ?? false
    );

    expect(message).toHaveTextContent('Error: boom');
  });

  it('renders stack trace lines when present on the error object', () => {
    const error = new Error('stacked');
    error.stack = 'Error: stacked\n    at first\n    at second';

    render(<DevErrorPage error={error} timestamp='2024-01-01 00:00' />);

    expect(screen.getByText('at first')).toBeVisible();
    expect(screen.getByText('at second')).toBeVisible();
  });

  it('invokes window.location.reload when the reload link handler runs', () => {
    const error = new Error('reload');

    render(<DevErrorPage error={error} timestamp='2024-01-01 00:00' />);

    const reloadLink = screen.getByRole('link', { name: /reload page/i });

    const reactEventKey = Object.keys(reloadLink).find((key) =>
      key.startsWith('__reactProps$')
    );
    expect(reactEventKey).toBeDefined();

    const reactProps = reactEventKey
      ? (
          reloadLink as unknown as Record<
            string,
            { onClick?: (...args: unknown[]) => void }
          >
        )[reactEventKey]
      : undefined;

    expect(reactProps?.onClick).toBeTypeOf('function');

    reactProps?.onClick?.({ preventDefault: () => {} } as unknown as {
      preventDefault: () => void;
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
