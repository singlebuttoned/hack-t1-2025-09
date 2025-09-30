import { test, expect } from '@playwright/test';

import { createHydrationErrorChecker } from './utils/hydration-checker';

test.describe('Dashboard routing & MFEs', () => {
  test('redirects /dashboard to overview', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/dashboard\/overview$/);
    await expect(
      page.locator('#mfe-dashboard-overview-container')
    ).toBeAttached();
    await expect(
      page.getByRole('heading', { name: /hi, welcome back/i })
    ).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });

  test('renders product MFE routes including nested views', async ({
    page
  }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/product');
    await expect(
      page.locator('#mfe-dashboard-product-container')
    ).toBeAttached();
    await expect(
      page.getByRole('heading', { name: /products/i })
    ).toBeVisible();

    await page.goto('/dashboard/product/new');
    await expect(
      page.getByRole('heading', { name: /create product/i })
    ).toBeVisible();

    await page.goto('/dashboard/product/123');
    await expect(
      page.getByRole('heading', { name: /edit product/i })
    ).toBeVisible();

    await page.goto('/dashboard/product/123/extra');
    await expect(page.getByText(/we couldn't find that url/i)).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });

  test('resolves shell-level 404 for unknown dashboards', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/unknown');
    await expect(
      page.getByRole('heading', { name: /something's missing/i })
    ).toBeVisible();

    await page.goto('/dashboard/overviewxxx');
    await expect(
      page.getByRole('heading', { name: /something's missing/i })
    ).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });

  test('exposes the default edition navigation set', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/overview');

    const navTexts = await page
      .locator('[data-slot="sidebar-menu-button"] span')
      .allTextContents();

    const visibleNavItems = navTexts
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .filter((text) => !/open menu|close menu/i.test(text));

    const expectedNavItems = ['Dashboard', 'Storyboard', 'Product', 'Profile'];

    expect(visibleNavItems).toEqual(expect.arrayContaining(expectedNavItems));
    expect(visibleNavItems).toHaveLength(expectedNavItems.length);

    await hydrationChecker.checkForHydrationErrors();
  });
});
