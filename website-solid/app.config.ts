import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  server: {
    preset: 'static',
    baseURL: '/hyperkit',
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
  vite: {
    resolve: {
      alias: {
        // Node builtin used by @babel/helper-module-imports in the in-browser
        // compiler; Vite does not polyfill node builtins.
        assert: '/src/shims/assert.ts',
      },
    },
    define: {
      'process.env.BABEL_TYPES_8_BREAKING': 'false',
    },
    build: {
      // Keep chunks deterministic; avoids the hydration-order issues seen in
      // other HyperKit SolidStart apps when vendor chunks split unpredictably.
      rollupOptions: {
        output: {
          manualChunks: {
            hyperkit: ['@ybouhjira/hyperkit'],
          },
        },
      },
    },
  },
});
