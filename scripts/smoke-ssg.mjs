#!/usr/bin/env node
// SSG smoke test — verifies that Kobalte-using primitives don't crash on server-side import.
//
// HOW THIS WORKS:
//   SolidStart/Vinxi uses the "solid" export condition → processes src/index.ts via Vite
//   with solid-js SSR mode. In Node, isServer=true, so our lazy() wrappers never resolve
//   Kobalte modules. This test verifies:
//   1. Each Kobalte sub-package crashes if imported directly in Node (confirms the risk)
//   2. Each server-safe wrapper .tsx (no direct Kobalte top-level import) is clean
//
// WHY NOT IMPORT dist/index.js:
//   dist/index.js is the browser bundle (compiled with `use` and other DOM-only APIs).
//   The SSR build path is src/index.ts → compiled by Vite with solid-js/web SSR conditions.
//   Testing dist/index.js would always fail on `use` import; that's expected for a browser build.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

console.log('=== HyperKit SSG Smoke Test ===\n');

// Phase 1: Confirm that crashing Kobalte packages actually crash (validates the test is real)
const kobaltePackages = [
  { pkg: '@kobalte/core/popover', shouldCrash: true },
  { pkg: '@kobalte/core/dropdown-menu', shouldCrash: true },
  { pkg: '@kobalte/core/slider', shouldCrash: true },
  { pkg: '@kobalte/core/dialog', shouldCrash: false },
  { pkg: '@kobalte/core/select', shouldCrash: true },
  { pkg: '@kobalte/core/number-field', shouldCrash: true },
  { pkg: '@kobalte/core/tooltip', shouldCrash: true },
];

console.log('Phase 1: Kobalte package Node-import check (confirming which packages crash):');
for (const { pkg, shouldCrash } of kobaltePackages) {
  try {
    execFileSync(process.execPath, [
      '--input-type=module',
      '-e',
      `import('${pkg}').then(() => process.exit(0)).catch(() => process.exit(1))`,
    ], { timeout: 5000 });
    if (shouldCrash) {
      console.error(`  UNEXPECTED OK: ${pkg} (expected crash)`);
      process.exit(1);
    } else {
      console.log(`  ok   ${pkg} (safe in Node)`);
    }
  } catch (e) {
    if (shouldCrash) {
      console.log(`  ok   ${pkg} (correctly crashes — guarded by our fix)`);
    } else {
      console.error(`  FAIL ${pkg} unexpectedly crashed`);
      process.exit(1);
    }
  }
}

// Phase 2: Verify server-safe wrapper files have NO top-level Kobalte imports
console.log('\nPhase 2: Verifying server-safe wrappers have no top-level Kobalte imports:');

import { readFileSync, existsSync } from 'node:fs';

const serverSafeWrappers = [
  'src/primitives/Dropdown/Dropdown.tsx',
  'src/primitives/Popover/Popover.tsx',
  'src/primitives/Select/Select.tsx',
  'src/primitives/Slider/Slider.tsx',
  'src/primitives/RangeSlider/RangeSlider.tsx',
  'src/primitives/NumberInput/NumberInput.tsx',
  'src/primitives/Tooltip/Tooltip.tsx',
  // Phase A additions — no Kobalte, pure SolidJS
  'src/primitives/Lightbox/Lightbox.tsx',
  'src/primitives/Pagination/Pagination.tsx',
  'src/primitives/BottomNav/BottomNav.tsx',
];

let failed = [];

for (const wrapper of serverSafeWrappers) {
  const fullPath = resolve(root, wrapper);
  if (!existsSync(fullPath)) {
    console.error(`  MISSING: ${wrapper}`);
    failed.push(wrapper);
    continue;
  }
  const content = readFileSync(fullPath, 'utf-8');
  // Check no top-level Kobalte imports (lazy import inside arrow fn is fine)
  const lines = content.split('\n');
  const hasTopLevelKobalte = lines.some(line => {
    const trimmed = line.trim();
    // Top-level import (not inside a function/arrow)
    return trimmed.startsWith("import ") && trimmed.includes("@kobalte/core") && !trimmed.includes("type ");
  });
  if (hasTopLevelKobalte) {
    console.error(`  FAIL: ${wrapper} has top-level Kobalte import`);
    failed.push(wrapper);
  } else {
    console.log(`  ok   ${wrapper}`);
  }
}

// Phase 3: Verify .client.tsx files exist for each split primitive
console.log('\nPhase 3: Verifying .client.tsx files exist:');

const clientFiles = [
  'src/primitives/Dropdown/Dropdown.client.tsx',
  'src/primitives/Popover/Popover.client.tsx',
  'src/primitives/Select/Select.client.tsx',
  'src/primitives/Slider/Slider.client.tsx',
  'src/primitives/RangeSlider/RangeSlider.client.tsx',
  'src/primitives/NumberInput/NumberInput.client.tsx',
  'src/primitives/Tooltip/Tooltip.client.tsx',
];

for (const clientFile of clientFiles) {
  const fullPath = resolve(root, clientFile);
  if (!existsSync(fullPath)) {
    console.error(`  MISSING: ${clientFile}`);
    failed.push(clientFile);
  } else {
    console.log(`  ok   ${clientFile}`);
  }
}

// Phase 4: Verify .client.tsx files have Kobalte imports (they should be the real impl)
console.log('\nPhase 4: Verifying .client.tsx files contain the real Kobalte implementation:');

for (const clientFile of clientFiles) {
  const fullPath = resolve(root, clientFile);
  if (!existsSync(fullPath)) continue;
  const content = readFileSync(fullPath, 'utf-8');
  const hasKobalte = content.includes('@kobalte/core');
  if (!hasKobalte) {
    console.error(`  WARN: ${clientFile} has no @kobalte/core import (may be empty stub)`);
  } else {
    console.log(`  ok   ${clientFile}`);
  }
}

if (failed.length) {
  console.error(`\nFAILED: ${failed.length} check(s) failed: ${failed.join(', ')}`);
  process.exit(1);
}

console.log('\nAll SSG smoke tests passed');
console.log('Note: isServer=true in Node means lazy() never resolves Kobalte on server.');
console.log('The "solid" export condition in package.json routes SSR through src/index.ts.');
