import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  plugins: [solidPlugin()],
  server: {
    port: 5555,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@hyperkit/views': resolve(__dirname, '../src'),
      '@ybouhjira/hyperkit': resolve(__dirname, '../../../src'),
    },
  },
});
