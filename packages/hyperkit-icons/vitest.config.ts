import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    globals: true,
    // Default environment — pure data/logic tests run in node
    environment: 'node',
    environmentMatchGlobs: [
      // Renderer tests need a DOM because SolidJS JSX creates real DOM nodes
      ['src/tests/styles.test.ts', 'jsdom'],
    ],
  },
});
