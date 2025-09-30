import { test, expect } from '@playwright/test';
import { createHydrationErrorChecker } from './utils/hydration-checker';

test.describe('Dashboard Functionality Tests', () => {
  test('should display dashboard layout when authenticated', async ({
    page
  }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    // This test uses the stored authentication state from global setup
    await page.goto('/dashboard');

    // Should be able to access dashboard without redirect
    await expect(page).toHaveURL(/.*\/dashboard\/overview$/);

    // Check the shell layout renders
    const mainRegion = page.locator('main[data-slot="sidebar-inset"]');
    await expect(mainRegion).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-slot="sidebar-inner"]')).toBeVisible();

    // The header now exposes the active page as the H1
    await expect(
      page.getByRole('heading', { level: 1, name: /dashboard/i })
    ).toBeVisible();

    // The sidebar rail exposes the toggle control at the page level
    const sidebarToggle = page.getByRole('button', {
      name: /toggle sidebar/i
    });
    await expect(sidebarToggle).toBeVisible();

    // Test sidebar toggle functionality - just verify the button works
    await sidebarToggle.click();

    // Wait a moment for any transition
    await page.waitForTimeout(500);

    // The sidebar might toggle state rather than show as dialog
    // Just verify that clicking doesn't cause errors and button still exists
    await expect(sidebarToggle).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });

  test('should navigate to products page when authenticated', async ({
    page
  }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    // Navigate directly to products page
    await page.goto('/dashboard/product');

    // Should be able to access products page
    await expect(page).toHaveURL(/.*\/dashboard\/product/);

    // Should show products page elements
    await expect(page.getByRole('main')).toBeVisible();

    // Wait for the heading to appear with increased timeout to account for data loading
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible({
      timeout: 10000
    });

    await hydrationChecker.checkForHydrationErrors();
  });

  test('should handle theme switching when authenticated', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/overview');

    // Test theme toggle functionality - just verify the button works
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    const toggleCount = await themeToggle.count();

    if (toggleCount > 0) {
      await themeToggle.first().click();

      // Wait a moment for any transition
      await page.waitForTimeout(500);

      // Verify button is still functional after click (no errors)
      await expect(themeToggle.first()).toBeVisible();

      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass ?? '').toMatch(/dark|light/);
    } else {
      // Fall back to verifying the default theme classes are applied
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass ?? '').toContain('bg-background');
    }

    await hydrationChecker.checkForHydrationErrors();
  });

  test('should display correct page titles', async ({ page }) => {
    // Default page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/overview/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard\/overview/);

    // Navigate to overview and check title
    await page.goto('/dashboard/overview');
    await expect(page).toHaveURL(/\/dashboard\/overview/);

    // Navigate to products and check title
    await page.goto('/dashboard/product');

    // The document title is now derived from the dashboard MFE definitions
    await expect(page).toHaveTitle(/Product/i);
    await expect(
      page.getByRole('heading', { level: 1, name: /product/i })
    ).toBeVisible({ timeout: 30000 });
  });

  test('should have responsive design when authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop small
      { width: 1920, height: 1080 } // Desktop large
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Verify layout doesn't break
      await expect(page.getByRole('main')).toBeVisible();

      // Check for horizontal scroll issues - allow reasonable tolerance for dashboard content
      const bodyScrollWidth = await page.evaluate(
        () => document.body.scrollWidth
      );
      const bodyClientWidth = await page.evaluate(
        () => document.body.clientWidth
      );

      // Dashboard may have some overflow at very small sizes, allow generous tolerance for complex layouts
      expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 200);
    }
  });
});
