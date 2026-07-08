import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin(), dts({ include: ['src'], exclude: ['**/*.test.*', '**/*.stories.*'], rollupTypes: true })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', '@kobalte/core', 'effect', '@ybouhjira/hyperkit-devtools'],
    },
    sourcemap: true,
  },
});
