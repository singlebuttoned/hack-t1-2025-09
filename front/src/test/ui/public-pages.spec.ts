import { test, expect } from '@playwright/test';
import { createHydrationErrorChecker } from './utils/hydration-checker';

test.describe('Authentication Flow Tests', () => {
  test('should redirect unauthenticated users to sign-in from dashboard', async ({
    page
  }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/dashboard');

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/.*\/auth\/sign-in/);
    await expect(
      page.getByRole('heading', { name: /sign.?in/i })
    ).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });

  test('should redirect unauthenticated users to sign-in from products page', async ({
    page
  }) => {
    await page.goto('/dashboard/product');

    // Should redirect to sign-in page with redirect URL
    await expect(page).toHaveURL(/.*\/auth\/sign-in.*redirect_url/);
  });

  test('should display sign-in form correctly', async ({ page }) => {
    const hydrationChecker = createHydrationErrorChecker(page);
    hydrationChecker.startListening();

    await page.goto('/auth/sign-in');

    // Check form elements - be more specific to avoid multiple matches
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign In', exact: true })
    ).toBeVisible();

    await hydrationChecker.checkForHydrationErrors();
  });
});
