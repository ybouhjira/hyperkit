import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  root: resolve(__dirname),
  resolve: {
    alias: {
      // Point @ybouhjira/diagram-solid to the local src so no rebuild needed
      '@ybouhjira/diagram-solid': resolve(__dirname, '../src/index.ts'),
      // Point @ybouhjira/hyperkit to the root hyperkit src so no rebuild needed
      '@ybouhjira/hyperkit': resolve(__dirname, '../../../src/index.ts'),
    },
  },
  server: {
    port: 4200,
    open: false,
  },
});
