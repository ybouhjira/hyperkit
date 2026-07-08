import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ include: ['src'], exclude: ['**/*.test.*'] })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'layout/hierarchical/dagre': resolve(__dirname, 'src/layout/hierarchical/dagre.ts'),
        'layout/hierarchical/elk': resolve(__dirname, 'src/layout/hierarchical/elk.ts'),
        'layout/force/d3-force': resolve(__dirname, 'src/layout/force/d3-force.ts'),
        'edge/straight': resolve(__dirname, 'src/edge/straight.ts'),
        'edge/bezier': resolve(__dirname, 'src/edge/bezier.ts'),
        'edge/step': resolve(__dirname, 'src/edge/step.ts'),
        'edge/bundled': resolve(__dirname, 'src/edge/bundled.ts'),
        'edge/manhattan': resolve(__dirname, 'src/edge/manhattan.ts'),
        'edge/astar': resolve(__dirname, 'src/edge/astar.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['effect', /^effect\//, '@dagrejs/dagre', 'd3-force', /^elkjs/],
    },
    sourcemap: true,
  },
});
