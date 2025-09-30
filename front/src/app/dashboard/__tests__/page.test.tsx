import React from 'react';
import { render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const redirectMock = vi.fn((url: string) => {
  const error = new Error('NEXT_REDIRECT');
  (error as Error & { digest?: string }).digest = 'NEXT_REDIRECT';
  throw error;
});
const notFoundMock = vi.fn(() => {
  const error = new Error('NEXT_NOT_FOUND');
  (error as Error & { digest?: string }).digest = 'NEXT_NOT_FOUND';
  throw error;
});

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  notFound: notFoundMock
}));

vi.mock('../../../mfes/lib/mfe-host-boundary', () => ({
  WithMfeHostBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='host-boundary'>{children}</div>
  ),
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='host-boundary'>{children}</div>
  )
}));

vi.mock('../../../mfes/lib/single-spa-root', () => ({
  default: () => <div data-testid='single-spa-root' />
}));

const dashboardModule = await import('../[[...slug]]/page');
const DashboardMicroFrontendPage = dashboardModule.default;
const { generateMetadata } = dashboardModule;

describe('DashboardMicroFrontendPage', () => {
  beforeEach(() => {
    redirectMock.mockClear();
    notFoundMock.mockClear();
  });

  it('redirects /dashboard to /dashboard/overview', async () => {
    await expect(
      DashboardMicroFrontendPage({ params: Promise.resolve({}) })
    ).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' });

    expect(redirectMock).toHaveBeenCalledWith('/dashboard/overview');
  });

  it('calls notFound for routes that are not registered MFEs', async () => {
    await expect(
      DashboardMicroFrontendPage({
        params: Promise.resolve({ slug: ['xxx'] })
      })
    ).rejects.toMatchObject({ digest: 'NEXT_NOT_FOUND' });

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('rejects prefixes that only partially match an MFE', async () => {
    await expect(
      DashboardMicroFrontendPage({
        params: Promise.resolve({ slug: ['overviewxxx'] })
      })
    ).rejects.toMatchObject({ digest: 'NEXT_NOT_FOUND' });

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('renders the single-spa host for a registered MFE prefix', async () => {
    const element = await DashboardMicroFrontendPage({
      params: Promise.resolve({ slug: ['overview'] })
    });

    render(element);

    expect(screen.getByTestId('host-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('single-spa-root')).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('keeps rendering the host for nested MFE routes', async () => {
    const element = await DashboardMicroFrontendPage({
      params: Promise.resolve({ slug: ['overview', 'details'] })
    });

    render(element);

    expect(screen.getByTestId('host-boundary')).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  it('returns a title for the matched micro frontend', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: ['product'] })
    });

    expect(metadata.title).toContain('Product');
  });

  it('falls back to Dashboard when no match is found', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: ['not-real'] })
    });

    expect(metadata.title).toContain('Dashboard');
  });

  it('returns dashboard metadata when the base route is requested', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({}) });

    expect(metadata.title).toContain('Dashboard');
  });
});
