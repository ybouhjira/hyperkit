import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:6007',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],

  // Serve the built explorer: on-demand vite dev compilation of the full
  // module graph exceeds test timeouts on slow CI runners.
  webServer: {
    command: 'pnpm --filter @ybouhjira/explorer build && pnpm --filter @ybouhjira/explorer preview',
    url: 'http://localhost:6007',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
