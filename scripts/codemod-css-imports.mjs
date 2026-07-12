/**
 * One-shot codemod for the hyperkit-styles extraction: rewrites every relative
 * `.css` import in src/**\/*.{ts,tsx} to the package deep path, resolving the
 * specifier against the importing file so `./X.css` and `../X.css` both map to
 * the mirrored tree in @ybouhjira/hyperkit-styles.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SRC = resolve('src');
const PKG = '@ybouhjira/hyperkit-styles';

const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.tsx?$/.test(e)) files.push(f);
  }
};
walk(SRC);

let changedFiles = 0;
let changedImports = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(
    /(['"])(\.{1,2}\/[^'"]+\.css)\1/g,
    (match, quote, spec) => {
      const abs = resolve(dirname(file), spec);
      const rel = relative(SRC, abs);
      if (rel.startsWith('..')) return match; // outside src — leave alone
      changedImports += 1;
      return `${quote}${PKG}/${rel.split('\\').join('/')}${quote}`;
    }
  );
  if (after !== before) {
    writeFileSync(file, after);
    changedFiles += 1;
  }
}
console.log(`rewrote ${changedImports} css imports across ${changedFiles} files`);
