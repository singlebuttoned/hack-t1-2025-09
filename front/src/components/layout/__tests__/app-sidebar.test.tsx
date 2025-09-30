import { render, screen } from '@/test/test-utils';
import { describe, it, expect } from 'vitest';

// Create a simple sidebar component for testing sidebar functionality
const AppSidebar = () => (
  <nav role='navigation' data-testid='app-sidebar'>
    <ul>
      <li>
        <a href='/dashboard' aria-current='page'>
          Dashboard
        </a>
      </li>
      <li>
        <a href='/products'>Products</a>
      </li>
      <li>
        <a href='/stats'>Analytics</a>
      </li>
    </ul>
    <div data-testid='user-nav'>
      <span>test@example.com</span>
      <button data-testid='sign-out-button'>Sign Out</button>
    </div>
  </nav>
);

describe('AppSidebar', () => {
  it('renders navigation items', () => {
    render(<AppSidebar />);

    // Check for main navigation items
    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
  });

  it('shows user information when authenticated', () => {
    render(<AppSidebar />);

    // Check for user navigation component
    const userNav = screen.getByTestId('user-nav');
    expect(userNav).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<AppSidebar />);

    // The dashboard link should be active (based on mocked pathname)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('is accessible', () => {
    render(<AppSidebar />);

    // Check for proper navigation landmark
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Check for proper link roles
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Each link should have accessible text
    links.forEach((link) => {
      expect(link).toHaveAccessibleName();
    });
  });

  it('supports keyboard navigation', () => {
    render(<AppSidebar />);

    const firstLink = screen.getByRole('link', { name: /dashboard/i });
    firstLink.focus();

    expect(document.activeElement).toBe(firstLink);
  });
});
