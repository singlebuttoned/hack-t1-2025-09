import { resolveChromeExecutable } from './scripts/chrome';
import { defineConfig } from '@playwright/test';

// Custom browser configuration to use our Chrome installation
const customChromeConfig = {
  name: 'chromium',
  launchOptions: {
    executablePath: resolveChromeExecutable(),
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  }
};

export default defineConfig({
  testDir: './src/test/ui',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Limit workers for speed
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30000,
  use: {
    headless: !process.argv.includes('--headed'), // Default to headless for SSH compatibility
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 30000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
      use: customChromeConfig
    },
    // Authenticated tests
    {
      name: 'authenticated',
      testMatch: /.*authenticated.*\.spec\.ts/,
      use: {
        ...customChromeConfig,
        storageState: '.test-data/mock-auth/user.json'
      },
      dependencies: ['global setup']
    },
    // Not authenticated tests
    {
      name: 'auth-less',
      testMatch: /^(?!.*authenticated).*\.spec\.ts$/, // Exclude authenticated tests
      use: customChromeConfig,
      dependencies: ['global setup']
    }
  ],
  webServer: {
    command: 'pnpm build && PORT=3100 pnpm start',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 100000, // allow slower first production build when booting test server
    env: {
      NEXT_PUBLIC_TEST_MODE: 'true'
    }
  }
});
