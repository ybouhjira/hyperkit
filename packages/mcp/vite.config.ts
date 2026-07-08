import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ include: ['src'], exclude: ['**/*.test.*'] })],
  build: {
    lib: {
      entry: { index: resolve(__dirname, 'src/index.ts') },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'effect',
        /^effect\//,
        '@modelcontextprotocol/sdk',
        /^@modelcontextprotocol\//,
        /^node:/,
      ],
    },
    sourcemap: true,
  },
});
