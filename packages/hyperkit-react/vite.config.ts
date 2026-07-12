import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], exclude: ['**/*.test.*', 'src/test'] })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // CSS lives in hyperkit-styles — keep those imports (and Radix) external
      // so consumers' bundlers resolve them and tree-shake unused styles.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^react-dom\//,
        /^@radix-ui\//,
        /^@ybouhjira\/hyperkit-styles/,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
