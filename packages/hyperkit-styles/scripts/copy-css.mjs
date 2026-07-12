/**
 * Copies every stylesheet from src/ into dist/ preserving the directory tree,
 * so deep imports like `@ybouhjira/hyperkit-styles/primitives/Button/Button.css`
 * resolve through the `"./*": "./dist/*"` export map. tsc emits the theme
 * engine JS/DTS alongside; this script owns the CSS half of the artifact.
 */
import { cpSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(pkgRoot, 'src');
const distDir = join(pkgRoot, 'dist');

let count = 0;
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.css')) {
      const dest = join(distDir, relative(srcDir, full));
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(full, dest);
      count += 1;
    }
  }
};
walk(srcDir);
console.log(`copied ${count} css files to dist/`);
