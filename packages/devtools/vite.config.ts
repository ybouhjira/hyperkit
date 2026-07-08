import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin(), dts({ include: ['src'], exclude: ['**/*.test.*'] })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'explorer/index': resolve(__dirname, 'src/explorer/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', /^solid-js\//, '@ybouhjira/hyperkit', '@ybouhjira/hyperkit-timeline', /^@ybouhjira\/hyperkit-timeline\//],
    },
    sourcemap: true,
  },
});
