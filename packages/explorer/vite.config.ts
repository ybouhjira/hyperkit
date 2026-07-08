import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 6007,
    fs: {
      allow: ['../..'],
    },
  },
  resolve: {
    alias: {
      '@hyperkit-src': path.resolve(__dirname, '../../src'),
      '@ybouhjira/hyperkit/dist/index.css': path.resolve(__dirname, '../../dist/index.css'),
      '@ybouhjira/hyperkit': path.resolve(__dirname, '../../src/index.ts'),
      '@ybouhjira/diagram-solid': path.resolve(__dirname, '../diagram-solid/src/index.ts'),
      '@ybouhjira/diagram-svg': path.resolve(__dirname, '../diagram-svg/src/index.ts'),
      '@ybouhjira/diagram-core/layout/hierarchical/elk': path.resolve(
        __dirname,
        '../diagram-core/src/layout/hierarchical/elk.ts'
      ),
      '@ybouhjira/diagram-core/layout/hierarchical/dagre': path.resolve(
        __dirname,
        '../diagram-core/src/layout/hierarchical/dagre.ts'
      ),
      '@ybouhjira/diagram-core/layout/force/d3-force': path.resolve(
        __dirname,
        '../diagram-core/src/layout/force/d3-force.ts'
      ),
      '@ybouhjira/diagram-core/edge/bezier': path.resolve(
        __dirname,
        '../diagram-core/src/edge/bezier.ts'
      ),
      '@ybouhjira/diagram-core/edge/straight': path.resolve(
        __dirname,
        '../diagram-core/src/edge/straight.ts'
      ),
      '@ybouhjira/diagram-core/edge/step': path.resolve(
        __dirname,
        '../diagram-core/src/edge/step.ts'
      ),
      '@ybouhjira/diagram-core': path.resolve(__dirname, '../diagram-core/src/index.ts'),
      'solid-js': path.resolve(__dirname, '../../node_modules/solid-js'),
      'solid-js/web': path.resolve(__dirname, '../../node_modules/solid-js/web'),
      'solid-js/store': path.resolve(__dirname, '../../node_modules/solid-js/store'),
    },
    conditions: ['development', 'browser'],
  },
  optimizeDeps: {
    include: [
      'solid-motionone',
      '@motionone/dom',
      '@solid-primitives/props',
      '@solid-primitives/refs',
      '@solid-primitives/transition-group',
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, '../../src/test-setup.ts')],
    // Only run the explorer's own tests. The hyperkit-src and diagram-solid
    // symlinks exist for dev-server story discovery; their test suites belong
    // to the root package and @ybouhjira/diagram-solid respectively and run
    // there with their own configs.
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
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
  },
});
