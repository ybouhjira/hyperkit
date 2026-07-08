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
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', /^solid-js\//, '@ybouhjira/hyperkit'],
    },
    sourcemap: true,
  },
});
