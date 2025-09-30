import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const captureExceptionMock = vi.fn();
const nextErrorMock = vi.fn(({ statusCode }: { statusCode: number }) => (
  <div data-testid='next-error'>status:{statusCode}</div>
));

vi.mock('@sentry/nextjs', () => ({
  captureException: captureExceptionMock
}));

vi.mock('next/error', () => ({
  __esModule: true,
  default: nextErrorMock
}));

const { default: GlobalError } = await import('../global-error');

const originalEnv = process.env.NODE_ENV;

describe('GlobalError', () => {
  beforeEach(() => {
    captureExceptionMock.mockClear();
    nextErrorMock.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('renders the default Next.js error page outside development mode', async () => {
    process.env.NODE_ENV = 'test';
    const error = Object.assign(new Error('unexpected failure'), {
      digest: 'digest-id'
    });

    render(<GlobalError error={error} />);

    await waitFor(() => {
      expect(captureExceptionMock).toHaveBeenCalledWith(error);
    });

    const nextErrorProps = nextErrorMock.mock.calls[0]?.[0];
    expect(nextErrorProps).toEqual(expect.objectContaining({ statusCode: 0 }));
    expect(screen.getByTestId('next-error')).toHaveTextContent('status:0');
  });

  it('renders the development error page when NODE_ENV=development', async () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('dev failure');

    render(<GlobalError error={error} />);

    await waitFor(() => {
      expect(captureExceptionMock).toHaveBeenCalledWith(error);
    });

    expect(nextErrorMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Something went wrong.' })
    ).toBeVisible();
    expect(
      screen.getByText(/The error below is only visible in development/i)
    ).toBeVisible();
  });
});
