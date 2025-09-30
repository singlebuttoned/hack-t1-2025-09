import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import Header from '../header';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

vi.mock('@/hooks/use-current-page', () => ({
  useCurrentPage: vi.fn()
}));

import { useRouter } from 'next/navigation';
import { useCurrentPage } from '@/hooks/use-current-page';

const pushMock = vi.fn();

beforeEach(() => {
  pushMock.mockReset();
  vi.mocked(useRouter).mockReturnValue({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn()
  } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(useCurrentPage).mockReturnValue({
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard'
  });
});

describe('Header', () => {
  it('renders the current page heading and its icon container', async () => {
    render(<Header />);

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Dashboard'
    });

    expect(heading).toBeVisible();
    expect(heading.previousElementSibling?.querySelector('svg')).not.toBeNull();
  });

  it('shows user menu items when the dropdown is opened', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const trigger = await screen.findByRole('button', { name: /test/i });
    await user.click(trigger);

    expect(await screen.findByText('Profile')).toBeVisible();
    expect(screen.getByText('Billing')).toBeVisible();
    expect(screen.getByText('Notifications')).toBeVisible();
    expect(screen.getByTestId('sign-out-button')).toBeVisible();
  });

  it('navigates to the profile page from the dropdown', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const trigger = await screen.findByRole('button', { name: /test/i });
    await user.click(trigger);

    const profileItem = await screen.findByText('Profile');
    await user.click(profileItem);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard/profile');
    });
  });
});
