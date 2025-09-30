import { test, expect } from '@playwright/test';
import { createHydrationErrorChecker } from './utils/hydration-checker';

test.describe('UI Quality & Accessibility Tests', () => {
  test('should have responsive design on sign-in page', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/auth/sign-in');

    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop small
      { width: 1920, height: 1080 } // Desktop large
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);

      // Main content visible
      await expect(page.locator('body')).toBeVisible();
    }

    await hydrationChecker.checkForHydrationErrors();
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/auth/sign-in');

    // Filter critical errors only
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('DevTools') &&
        !error.includes('development') &&
        !error.includes('Warning') &&
        !error.includes('401')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper semantic structure', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Basic HTML structure
    await expect(page.locator('html')).toHaveAttribute('lang');
    await expect(page.locator('title')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
  });
});
