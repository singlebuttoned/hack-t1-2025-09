import { expect, test } from '@playwright/test';

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

test.describe('Global error fallback', () => {
  test('renders the production error page when an MFE fails', async ({
    page
  }) => {
    await page.goto('/dashboard/overview');
    await expect(page.locator('[data-mfe-container="overview"]')).toBeVisible();

    await page.evaluate(() => {
      window.__mfeTestUtils?.injectError(
        'overview',
        'Injected overview failure'
      );
    });

    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /Application error: a client-side exception has occurred/i
      })
    ).toBeVisible();

    await page.evaluate(() => {
      window.__mfeTestUtils?.clearLastError();
    });
  });
});
