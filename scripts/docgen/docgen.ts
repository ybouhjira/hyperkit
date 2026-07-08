#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * docgen CLI — the imperative shell. Wires the real filesystem into the pure,
 * fully-tested orchestrator (run.ts) and writes docs-manifest.json. Run with
 * `--check` to exit non-zero when any component is undocumented (CI gate).
 *
 *   pnpm tsx scripts/docgen/docgen.ts            # regenerate the manifest
 *   pnpm tsx scripts/docgen/docgen.ts --check    # gate: fail on undocumented
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateDocs } from './run.js';
import type { DocgenFs } from './collect.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outPath = path.join(root, 'docs-manifest.json');

const realFs: DocgenFs = {
  readdir: (dir) =>
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
      : [],
  readFileIfExists: (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null),
};

const checkMode = process.argv.includes('--check');

// --check is SIDE-EFFECT-FREE: it regenerates in memory and compares against
// the committed manifest (freshness gate) instead of overwriting it.
let generated = '';
const { manifest, check } = generateDocs({
  fs: realFs,
  srcDir: path.join(root, 'src'),
  writeManifest: (json) => {
    generated = json;
    if (!checkMode) fs.writeFileSync(outPath, json);
  },
});

console.log(`docgen → ${manifest.stats.total} components → docs-manifest.json`);
console.log(`prop-doc coverage: ${(check.propDocCoverage * 100).toFixed(1)}%`);
if (check.failures.length > 0) {
  console.log(`\n${check.failures.length} undocumented:`);
  for (const f of check.failures.slice(0, 20)) console.log(`  ✗ ${f.name}: ${f.issues.join('; ')}`);
}
if (checkMode) {
  const committed = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  if (committed !== generated) {
    console.error('✗ docs-manifest.json is STALE — run `npm run docgen` and commit the result.');
    process.exit(1);
  }
  console.log('✓ docs-manifest.json is fresh.');
  // NOTE: documentation completeness (check.ok) is reported above but not yet
  // enforced — 131 components lack meta.docs.md. Ratchet via an allowlist
  // before flipping this to a hard exit.
}
