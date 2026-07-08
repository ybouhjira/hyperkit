import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
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
