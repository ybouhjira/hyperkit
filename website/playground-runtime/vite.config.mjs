import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

/**
 * Builds the self-contained playground runtime served from /playground/.
 *
 * Entries mirror the module specifiers that playground snippets may import
 * ('@ybouhjira/hyperkit', 'solid-js', 'solid-js/web', 'solid-js/store') plus
 * the iframe bootstrap. HyperKit is bundled straight from the repository's
 * src/ so the docs always demo the exact code in the working tree. Rollup
 * shares chunks between entries, so every entry uses the same solid-js
 * instance — required for Solid's reactivity to work across modules.
 */
export default defineConfig({
  root: dir,
  // Relative base: lazy chunks (Slider.client etc.) must resolve against the
  // importing module's URL, not the site root — the site is served under a
  // configurable baseUrl (/hyperkit/ on GitHub Pages).
  base: './',
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '@': resolve(dir, '../../src'),
    },
    dedupe: ['solid-js', 'solid-js/web', 'solid-js/store'],
  },
  build: {
    outDir: resolve(dir, '../static/playground'),
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      // Vite app builds default to preserveEntrySignatures: false, which
      // drops/mangles entry exports (and tree-shakes their CSS). These entries
      // ARE the public module surface of the playground, so keep them intact.
      preserveEntrySignatures: 'strict',
      // Keep every imported module — component `.css` imports are side-effect
      // only and would otherwise be tree-shaken out of the combined stylesheet.
      treeshake: {
        moduleSideEffects: true,
      },
      input: {
        hyperkit: resolve(dir, 'entry-hyperkit.ts'),
        'solid-js': resolve(dir, 'entry-solid-js.ts'),
        'solid-web': resolve(dir, 'entry-solid-web.ts'),
        'solid-store': resolve(dir, 'entry-solid-store.ts'),
        boot: resolve(dir, 'boot.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (info) =>
          info.names?.some((n) => n.endsWith('.css')) || info.name?.endsWith('.css')
            ? 'css/[name][extname]'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
