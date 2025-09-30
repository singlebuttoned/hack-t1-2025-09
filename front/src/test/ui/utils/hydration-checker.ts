import { Page, expect } from '@playwright/test';

export interface HydrationErrorChecker {
  consoleErrors: string[];
  pageErrors: Error[];
  startListening: () => void;
  checkForHydrationErrors: () => Promise<void>;
}

export function createHydrationErrorChecker(page: Page): HydrationErrorChecker {
  const consoleErrors: string[] = [];
  const pageErrors: Error[] = [];

  const startListening = () => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });
  };

  const checkForHydrationErrors = async () => {
    // Give time for hydration errors to surface
    await page.waitForTimeout(1000);

    // Check console errors for hydration issues
    const consoleHydrationErrors = consoleErrors.filter(
      (error) =>
        error.toLowerCase().includes('hydration failed') ||
        error.toLowerCase().includes('hydration') ||
        error.toLowerCase().includes("server rendered html didn't match")
    );

    // Check page errors (uncaught exceptions) for hydration issues
    const pageHydrationErrors = pageErrors.filter(
      (error) =>
        error.message.toLowerCase().includes('hydration failed') ||
        error.message.toLowerCase().includes('hydration') ||
        error.message
          .toLowerCase()
          .includes("server rendered html didn't match")
    );

    // Log errors for debugging
    if (consoleHydrationErrors.length > 0) {
      console.log('Console hydration errors found:', consoleHydrationErrors);
    }
    if (pageHydrationErrors.length > 0) {
      console.log(
        'Page hydration errors found:',
        pageHydrationErrors.map((e) => e.message)
      );
    }

    // Assert no hydration errors
    expect(
      consoleHydrationErrors,
      'Console should have no hydration errors'
    ).toHaveLength(0);
    expect(
      pageHydrationErrors,
      'Page should have no hydration errors'
    ).toHaveLength(0);
  };

  return {
    consoleErrors,
    pageErrors,
    startListening,
    checkForHydrationErrors
  };
}
