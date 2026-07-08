#!/usr/bin/env tsx
/**
 * Tree-Shaking Verification Script
 *
 * Verifies that tree-shaking works correctly for @ybouhjira/hyperkit.
 * A minimal consumer importing only `Button` must not include heavy
 * components (Report, DashboardContainer, KanbanBoard) in its bundle.
 *
 * Strategy: bundle from dist/index.js using Rollup (the same bundler
 * consumers use via Vite). esbuild alone cannot DCE within a single
 * pre-compiled ESM file the way Rollup can.
 *
 * Usage:
 *   npm run tree-shake:test
 *   tsx scripts/tree-shake-test.ts
 *
 * Exit code 0 = all checks pass
 * Exit code 1 = tree-shaking is broken
 */

import { rollup } from 'rollup';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const ROOT = resolve(import.meta.dirname, '..');
const DIST_INDEX = join(ROOT, 'dist', 'index.js');

// ── Markers ────────────────────────────────────────────────────────────────
//
// Each entry maps a heavy module/component name to a unique string that
// appears in dist/index.js only when that component is included.
// These are verified to be present in the full dist before the test runs.
//
// If tree-shaking works: none of these should appear in a Button-only bundle.
const HEAVY_MARKERS: Record<string, string> = {
  Report: 'reportDarkTheme', // unique re-export from the report preset system
  DashboardContainer: 'useDashboardLayout', // internal hook bound to DashboardContainer
  KanbanBoard: 'KanbanBoard', // export name in the dist bundle
};

// ── Helpers ────────────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

function formatStatus(passed: boolean): string {
  return passed ? '✓ PASS' : '✗ FAIL';
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n── Tree-Shaking Verification ────────────────────────────────\n');

  // Ensure the library is built first
  let distCode: string;
  try {
    distCode = readFileSync(DIST_INDEX, 'utf8');
  } catch {
    console.error('ERROR: dist/index.js not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Pre-flight: confirm all heavy markers are actually present in the full dist.
  // If a marker is wrong, the test would silently pass for the wrong reason.
  const missingMarkers = Object.entries(HEAVY_MARKERS).filter(
    ([, marker]) => !distCode.includes(marker)
  );
  if (missingMarkers.length > 0) {
    console.error('ERROR: The following heavy markers were NOT found in dist/index.js.');
    console.error('Update HEAVY_MARKERS in this script to match current dist output:');
    for (const [component, marker] of missingMarkers) {
      console.error(`  ${component}: "${marker}"`);
    }
    process.exit(1);
  }

  // Write a minimal consumer entry that only imports Button
  const tmpDir = join(tmpdir(), 'hyperkit-tree-shake-test');
  mkdirSync(tmpDir, { recursive: true });
  const entryPath = join(tmpDir, 'button-only.js');
  writeFileSync(
    entryPath,
    `// Minimal hyperkit consumer — imports only Button.
// If tree-shaking is working, heavy modules (Report, DashboardContainer,
// KanbanBoard) must be absent from the resulting bundle.
import { Button } from '${DIST_INDEX}';
export { Button };
`
  );

  // Bundle using Rollup (same bundler as Vite) with full tree-shaking
  let bundleCode: string;
  try {
    const bundle = await rollup({
      input: entryPath,
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        '@kobalte/core',
        'effect',
        '@ybouhjira/hyperkit-devtools',
      ],
      treeshake: true,
      onwarn: () => {
        // Suppress rollup warnings for cleaner output
      },
    });
    const { output } = await bundle.generate({ format: 'esm' });
    const chunk = output[0];
    if (!chunk || chunk.type !== 'chunk') throw new Error('Rollup produced no chunk output');
    bundleCode = chunk.code;
    await bundle.close();
  } catch (err) {
    console.error('ERROR: Rollup bundling failed:', err);
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  const results: CheckResult[] = [];

  // ── Check 1: Heavy modules tree-shaken out ─────────────────────────────
  for (const [component, marker] of Object.entries(HEAVY_MARKERS)) {
    const present = bundleCode.includes(marker);
    results.push({
      name: `${component} tree-shaken out`,
      passed: !present,
      detail: present
        ? `Marker "${marker}" found in bundle — NOT tree-shaken (sideEffects or top-level code issue)`
        : `Marker "${marker}" absent — correctly eliminated`,
    });
  }

  // ── Check 2: Button IS present ─────────────────────────────────────────
  // The Button component sets a CSS class "sk-btn" in its template.
  const buttonPresent = bundleCode.includes('sk-btn') || bundleCode.includes('"Button"');
  results.push({
    name: 'Button included in bundle',
    passed: buttonPresent,
    detail: buttonPresent
      ? 'Button code ("sk-btn") found in bundle'
      : 'WARNING: Button CSS class not found — check build output',
  });

  // ── Check 3: package.json sideEffects field ────────────────────────────
  // Must be ["*.css"] so JS modules are side-effect-free for tree-shaking.
  const pkgJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    sideEffects?: unknown;
  };
  const sideEffects = pkgJson['sideEffects'];
  const sideEffectsOk =
    Array.isArray(sideEffects) && sideEffects.length === 1 && sideEffects[0] === '*.css';
  results.push({
    name: 'package.json sideEffects: ["*.css"]',
    passed: sideEffectsOk,
    detail: sideEffectsOk
      ? 'sideEffects correctly set to ["*.css"]'
      : `sideEffects is ${JSON.stringify(sideEffects)} — should be ["*.css"]`,
  });

  // ── Report ──────────────────────────────────────────────────────────────
  let allPassed = true;
  for (const { name, passed, detail } of results) {
    console.log(`  ${formatStatus(passed)}  ${name}`);
    console.log(`         ${detail}`);
    if (!passed) allPassed = false;
  }

  console.log('\n── Summary ──────────────────────────────────────────────────\n');

  const passedCount = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`  ${passedCount}/${total} checks passed`);

  if (!allPassed) {
    console.log('\n  Tree-shaking is BROKEN or configuration is incorrect.');
    console.log('  Common causes:');
    console.log('    • Top-level code with side effects in heavy component files');
    console.log('    • Missing or incorrect "sideEffects" field in package.json');
    console.log('    • Heavy components imported unconditionally at module init\n');
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  console.log('\n  All checks passed. Tree-shaking is working correctly.\n');
  rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
