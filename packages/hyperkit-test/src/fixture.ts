import { test as base, type Page } from '@playwright/test';
import { HyperkitApp } from './app';

/**
 * Playwright fixture that yields a ready-to-drive `HyperkitApp` handle.
 *
 * Usage:
 *   import { test, expect } from '@ybouhjira/hyperkit-test/playwright';
 *   test('editor accepts drop action', async ({ page, app }) => {
 *     await page.goto('/');
 *     await app.ready();
 *     const r = await app.dispatch('hyperkit-editor', 'drop', { component: 'Button', targetId: 'root' });
 *     expect(r.ok).toBe(true);
 *   });
 */
export const test = base.extend<{ app: HyperkitApp }>({
  app: async ({ page }: { page: Page }, use: (v: HyperkitApp) => Promise<void>) => {
    await use(new HyperkitApp(page));
  },
});

export { expect } from '@playwright/test';
export { HyperkitApp };
