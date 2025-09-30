import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure Playwright for mock auth
setup.describe.configure({ mode: 'serial' });

setup('global setup', async ({}) => {
  // Mock auth setup - no external services needed
  console.log('Setting up mock authentication for UI tests');
});

// Define the path to the storage file for authenticated tests
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(
  __dirname,
  '../../../.test-data/mock-auth/user.json'
);

setup('authenticate and save state', async ({ page }) => {
  // Only run if we need authenticated tests
  if (!process.env.SKIP_AUTH_SETUP) {
    // Navigate to sign-in page
    await page.goto('/auth/sign-in');

    // Fill in mock credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard (matches /dashboard or /dashboard/* or /dashboard/*/*/*...)
    await page.waitForURL('**/dashboard{,/**}', { timeout: 30000 }); // here entire dashboard compiles, long wait

    // Verify we can access protected routes by waiting for the new sidebar shell
    await page.waitForSelector('[data-slot="sidebar-inner"]', {
      timeout: 30000
    });

    // Save the authenticated state
    await page.context().storageState({ path: authFile });
  }
});
