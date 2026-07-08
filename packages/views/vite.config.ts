import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ include: ['src'], exclude: ['**/*.test.*'] })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vite: resolve(__dirname, 'src/vite.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'effect',
        /^effect\//,
        'vite',
        'node:fs',
        'node:path',
        'node:fs/promises',
        /^node:/,
        'solid-js',
        /^solid-js\//,
      ],
    },
    sourcemap: true,
  },
});
