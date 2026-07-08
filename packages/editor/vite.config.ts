import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    solid(),
    dts({ include: ['src'], exclude: ['**/*.test.*', '**/*.stories.*'] }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'effect',
        /^effect\//,
        'solid-js',
        /^solid-js\//,
        '@ybouhjira/hyperkit',
        '@kobalte/core',
        /^@kobalte\//,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    transformMode: { web: [/\.[jt]sx$/] },
  },
});
