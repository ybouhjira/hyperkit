import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  // hot:false — vitest transforms run in vite dev mode, which would inject
  // solid-refresh HMR scaffolding (`if (import.meta.hot)`) into every module.
  // That scaffolding is dead code under test and pollutes branch coverage.
  plugins: [solidPlugin({ hot: false })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ybouhjira/hyperkit-devtools': resolve(__dirname, './packages/devtools/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    setupFiles: ['./src/test-setup.ts'],
    exclude: [
      'tests/visual/**',
      '**/node_modules/**',
      'website/**',
      'packages/**',
      'apps/**',
    ],
    server: {
      deps: {
        inline: [
          /@kobalte\/core/,
          /solid-prevent-scroll/,
          /solid-presence/,
          /@corvu\/utils/,
          /@ybouhjira\/hyperkit-devtools/,
          /solid-motionone/,
        ],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',
        'src/__fixtures__/**',
        'src/test-setup.ts',
      ],
    },
  },
});
