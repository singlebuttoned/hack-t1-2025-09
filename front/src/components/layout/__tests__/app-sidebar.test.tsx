import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '../app-sidebar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditionNavItems } from '@/hooks/use-edition-nav-items';
import { useCurrentPage } from '@/hooks/use-current-page';
import { useMediaQuery } from '@/hooks/use-media-query';

vi.mock('@/hooks/use-edition-nav-items', () => ({
  useEditionNavItems: vi.fn()
}));

vi.mock('@/hooks/use-current-page', () => ({
  useCurrentPage: vi.fn()
}));

vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn()
}));

const navItems = [
  { title: 'Overview', url: '/dashboard/overview', icon: 'dashboard' },
  { title: 'Product', url: '/dashboard/product', icon: 'product' }
];

const renderSidebar = () =>
  render(
    <SidebarProvider defaultOpen>
      <AppSidebar />
    </SidebarProvider>
  );

beforeEach(() => {
  vi.mocked(useEditionNavItems).mockReturnValue(navItems);
  vi.mocked(useCurrentPage).mockReturnValue(navItems[0]);
  vi.mocked(useMediaQuery).mockReturnValue({ isOpen: false });
});

describe('AppSidebar', () => {
  it('renders navigation entries from the current edition', async () => {
    renderSidebar();

    expect(
      await screen.findByRole('link', { name: 'Overview' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Product' })).toBeInTheDocument();
  });

  it('marks the current page as active', async () => {
    vi.mocked(useCurrentPage).mockReturnValue(navItems[1]);

    renderSidebar();

    const activeLink = await screen.findByRole('link', { name: 'Product' });
    expect(activeLink.getAttribute('data-active')).toBe('true');

    const inactiveLink = screen.getByRole('link', { name: 'Overview' });
    expect(inactiveLink.getAttribute('data-active')).not.toBe('true');
  });

  it('toggles between open and closed labels when clicking the menu control', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const closeButton = await screen.findByRole('button', {
      name: /close menu/i
    });
    expect(closeButton).toBeVisible();

    await user.click(closeButton);

    const openButton = await screen.findByRole('button', {
      name: /open menu/i
    });
    expect(openButton).toBeVisible();
  });
});
