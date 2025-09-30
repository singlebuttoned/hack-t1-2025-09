import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import DashboardLayout from '../layout';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'true' })
  })
}));

// Mock the layout components with default export
vi.mock('@/components/layout/app-sidebar', () => ({
  default: () => <nav data-testid='app-sidebar'>Sidebar</nav>
}));

vi.mock('@/components/layout/header', () => ({
  default: () => <header data-testid='header'>Header</header>
}));

// Mock KBar component
vi.mock('@/components/kbar', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='kbar'>{children}</div>
  )
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sidebar-provider'>{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sidebar-inset'>{children}</div>
  )
}));

describe('DashboardLayout', () => {
  const mockChildren = <div data-testid='page-content'>Dashboard Content</div>;

  it('renders all layout components', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    // Check for KBar wrapper
    expect(screen.getByTestId('kbar')).toBeInTheDocument();

    // Check for sidebar provider wrapper
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();

    // Check for main layout components
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders children content', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('has proper layout structure', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    // Check that sidebar provider wraps everything
    const sidebarProvider = screen.getByTestId('sidebar-provider');
    expect(sidebarProvider).toContainElement(screen.getByTestId('app-sidebar'));
    expect(sidebarProvider).toContainElement(
      screen.getByTestId('sidebar-inset')
    );
  });

  it('maintains responsive layout', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    // Check for main structural elements
    expect(screen.getByTestId('sidebar-provider')).toBeVisible();
    expect(screen.getByTestId('app-sidebar')).toBeVisible();
    expect(screen.getByTestId('header')).toBeVisible();
  });

  it('provides proper semantic structure', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    // Navigation should be present (from mocked sidebar)
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Header should be present (from mocked header)
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('handles empty children gracefully', async () => {
    const AsyncLayout = await DashboardLayout({ children: null });
    render(AsyncLayout);

    // Layout structure should still be present
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
  });

  it('preserves layout hierarchy', async () => {
    const AsyncLayout = await DashboardLayout({ children: mockChildren });
    render(AsyncLayout);

    const sidebarInset = screen.getByTestId('sidebar-inset');
    const header = screen.getByTestId('header');

    // Header and children should be within sidebar inset
    expect(sidebarInset).toContainElement(header);
    expect(sidebarInset).toContainElement(screen.getByTestId('page-content'));
  });
});
