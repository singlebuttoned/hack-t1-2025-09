import { render, screen } from '@/test/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

let memoryEntries: string[] = ['/dashboard/overview'];

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    BrowserRouter: ({
      basename,
      children
    }: {
      basename?: string;
      children: React.ReactNode;
    }) => (
      <actual.MemoryRouter initialEntries={memoryEntries} basename={basename}>
        {children}
      </actual.MemoryRouter>
    )
  };
});

import { App as OverviewApp } from '../overview/App';
import { App as ProductApp } from '../product/App';

const setEntry = (path: string) => {
  memoryEntries = [path];
};

afterEach(() => {
  setEntry('/dashboard/overview');
});

describe('Overview MFE routing', () => {
  it('renders the overview dashboard on the base route', async () => {
    setEntry('/dashboard/overview');

    render(<OverviewApp basename='/dashboard/overview' />);

    expect(
      await screen.findByRole('heading', { name: 'Hi, Welcome back 👋' })
    ).toBeVisible();
  });

  it('shows the shared NotFound page for unknown child routes', async () => {
    setEntry('/dashboard/overview/missing');

    render(<OverviewApp basename='/dashboard/overview' />);

    expect(await screen.findByText(/We couldn't find that URL/i)).toBeVisible();
  });
});

describe('Product MFE routing', () => {
  afterEach(() => {
    setEntry('/dashboard/overview');
  });

  it('renders the product list on the base route', async () => {
    setEntry('/dashboard/product');

    render(<ProductApp basename='/dashboard/product' />);

    expect(
      await screen.findByRole('heading', { name: 'Products' })
    ).toBeVisible();
  });

  it('renders the create screen on /new', async () => {
    setEntry('/dashboard/product/new');

    render(<ProductApp basename='/dashboard/product' />);

    expect(
      await screen.findByRole('heading', { name: 'Create Product' })
    ).toBeVisible();
  });

  it('renders the edit screen for dynamic ids', async () => {
    setEntry('/dashboard/product/123');

    render(<ProductApp basename='/dashboard/product' />);

    expect(
      await screen.findByRole('heading', { name: 'Edit Product' })
    ).toBeVisible();
  });

  it('falls back to the shared NotFound component for unsupported nested routes', async () => {
    setEntry('/dashboard/product/123/extra');

    render(<ProductApp basename='/dashboard/product' />);

    expect(await screen.findByText(/We couldn't find that URL/i)).toBeVisible();
  });
});
