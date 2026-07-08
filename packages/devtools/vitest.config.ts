import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solid({ hot: false })],
  resolve: {
    alias: {
      // The hyperkit dep is `file:../../` — point straight at the live
      // monorepo source instead of the pnpm-copied snapshot so the solid
      // export condition resolves to real files vitest can transform.
      '@ybouhjira/hyperkit': resolve(__dirname, '../../src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        // hyperkit's solid-condition deps ship untranspiled .jsx — inline
        // them (same list as the root vitest config) so vitest transforms
        // them like local source.
        inline: [
          /@kobalte\/core/,
          /solid-prevent-scroll/,
          /solid-presence/,
          /@corvu\/utils/,
          /solid-motionone/,
        ],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.*', '**/__tests__/**'],
    },
  },
});
