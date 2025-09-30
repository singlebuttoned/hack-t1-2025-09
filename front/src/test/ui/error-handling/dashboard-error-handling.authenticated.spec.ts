import { expect, test } from '@playwright/test';

import { createHydrationErrorChecker } from '../utils/hydration-checker';

type MfeTestErrorDetail = {
  mfeKey: string;
  message?: string;
};

declare global {
  interface Window {
    __mfeTestUtils?: {
      injectError: (mfeKey: string, message?: string) => void;
      getLastError: () => MfeTestErrorDetail | null;
      clearLastError: () => void;
    };
  }
}

const getLastErrorKey = (page: import('@playwright/test').Page) =>
  page.evaluate(() => window.__mfeTestUtils?.getLastError()?.mfeKey ?? null);

test.describe('Micro-frontend error handling', () => {
  test('surfaces runtime errors through the global shell', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/overview');
    await expect(page.locator('[data-mfe-container="overview"]')).toBeVisible();

    await page.evaluate(() => {
      window.__mfeTestUtils?.injectError(
        'overview',
        'Injected overview failure'
      );
    });

    await expect.poll(() => getLastErrorKey(page)).toBe('overview');
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /application error/i
      })
    ).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();

    await page.reload();

    await expect.poll(() => getLastErrorKey(page)).toBeNull();
    await expect(page.locator('[data-mfe-container="overview"]')).toBeVisible();
  });

  test('clears runtime errors when the active edition changes', async ({
    page
  }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard/product');
    await expect(page.locator('[data-mfe-container="product"]')).toBeVisible();

    await page.evaluate(() => {
      window.__mfeTestUtils?.injectError('product', 'Injected product failure');
    });

    await expect.poll(() => getLastErrorKey(page)).toBe('product');

    await page.evaluate(() => {
      localStorage.setItem('dashboard:edition', 'v1');
    });

    try {
      await page.reload();

      await hydrationChecker.checkForHydrationErrors();

      await expect.poll(() => getLastErrorKey(page)).toBeNull();
      await expect(
        page.locator('[data-mfe-container="product"]')
      ).toBeVisible();
    } finally {
      await page.evaluate(() => {
        localStorage.setItem('dashboard:edition', 'default');
      });
    }
  });
});
