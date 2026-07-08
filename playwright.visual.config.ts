import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never', outputFolder: 'tests/visual/__report__' }], ['list']],

  use: {
    viewport: { width: 1280, height: 800 },
    screenshot: 'off',
    trace: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--font-render-hinting=none', '--disable-skia-runtime-opts'],
        },
      },
    },
  ],

  webServer: [
    {
      command: 'npm run storybook -- --no-open',
      port: 6006,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npx tsx tests/visual/serve-reference.ts',
      port: 8081,
      reuseExistingServer: true,
      timeout: 10_000,
    },
  ],
});
