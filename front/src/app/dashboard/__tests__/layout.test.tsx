import React from 'react';
import { render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookiesMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: cookiesMock
}));

const sidebarProviderSpy = vi
  .fn()
  .mockImplementation(
    ({
      children,
      defaultOpen
    }: {
      children: React.ReactNode;
      defaultOpen?: boolean;
    }) => (
      <div
        data-testid='sidebar-provider'
        data-default-open={String(Boolean(defaultOpen))}
      >
        {children}
      </div>
    )
  );

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: sidebarProviderSpy,
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sidebar-inset'>{children}</div>
  )
}));

vi.mock('@/components/layout/app-sidebar', () => ({
  default: () => <nav data-testid='app-sidebar'>Sidebar</nav>
}));

vi.mock('@/components/layout/header', () => ({
  default: () => <header data-testid='header'>Header</header>
}));

const DashboardLayout = await import('../layout').then((m) => m.default);

describe('DashboardLayout', () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    sidebarProviderSpy.mockClear();
  });

  it('renders sidebar, header and content within the provider', async () => {
    cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(null) });
    const element = await DashboardLayout({
      children: <div data-testid='page-content'>Content</div>
    });

    render(element);

    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('passes defaultOpen=true when sidebar cookie is set', async () => {
    cookiesMock.mockResolvedValue({
      get: vi
        .fn()
        .mockImplementation((key: string) =>
          key === 'sidebar_state' ? { value: 'true' } : null
        )
    });

    const element = await DashboardLayout({ children: null });
    render(element);

    expect(screen.getByTestId('sidebar-provider')).toHaveAttribute(
      'data-default-open',
      'true'
    );
  });

  it('uses defaultOpen=false when cookie is missing or falsey', async () => {
    cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(null) });

    const element = await DashboardLayout({ children: null });
    render(element);

    expect(screen.getByTestId('sidebar-provider')).toHaveAttribute(
      'data-default-open',
      'false'
    );
  });
});
