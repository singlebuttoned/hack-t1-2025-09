import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation with proper hoisting
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }),
  redirect: mockRedirect,
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({})
}));

// Mock server auth
const mockAuth = vi.fn().mockResolvedValue({ userId: 'test-user-id' });
vi.mock('@/lib/mock-auth-server', () => ({
  auth: mockAuth
}));

// Import after mocks are set up
const DashboardPage = await import('../page').then((m) => m.default);

describe('DashboardPage', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockAuth.mockClear();
    mockAuth.mockResolvedValue({ userId: 'test-user-id' });
  });

  it('redirects to overview when user is authenticated', async () => {
    await DashboardPage();
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/overview');
  });

  it('redirects to sign-in when user is not authenticated', async () => {
    // Mock auth to return no userId
    mockAuth.mockResolvedValueOnce({ userId: null });

    await DashboardPage();
    expect(mockRedirect).toHaveBeenCalledWith('/auth/sign-in');
  });

  it('handles auth check correctly', async () => {
    await DashboardPage();
    expect(mockAuth).toHaveBeenCalled();
  });

  it('does not render any content - just redirects', async () => {
    // Since the page immediately redirects, it shouldn't render any content
    const result = await DashboardPage();
    expect(result).toBeUndefined(); // redirect() doesn't return JSX
  });

  it('handles authentication flow properly', async () => {
    await DashboardPage();
    // Should redirect to overview for authenticated user
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/overview');
  });

  it('maintains proper async behavior', async () => {
    const start = Date.now();
    await DashboardPage();
    const end = Date.now();

    // Should complete quickly (no actual rendering)
    expect(end - start).toBeLessThan(100);
    expect(mockRedirect).toHaveBeenCalled();
  });

  it('does not throw console errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await DashboardPage();

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
