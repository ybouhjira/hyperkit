#!/usr/bin/env node
/**
 * Generates src/engine/component-map.generated.ts — the complete
 * `.sk-{block}` → PascalCase component-name map for the DevTools
 * ComponentIdentifier.
 *
 * Source of truth: the colocated `.css` files in the HyperKit source tree.
 * Every component dir under src/primitives/* and src/composites/* uses
 * flat-BEM `.sk-{block}` selectors; the dir name IS the component name.
 * System roots (panels, report, keyboard, …) hold multi-component CSS files,
 * so their blocks are named by PascalCasing the block itself, with manual
 * overrides where the public export name differs.
 *
 * Run: node scripts/generate-component-map.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const outFile = join(here, '..', 'src', 'engine', 'component-map.generated.ts');

/**
 * Scan roots in priority order — on block conflicts the FIRST mapping wins
 * (e.g. `.sk-dialog` appears in both primitives/Dialog and
 * composites/ThemePickerModal; Dialog is the owner).
 *
 * naming:
 *  - 'dir'   → component name = the directory under the root (PascalCase already)
 *  - 'block' → component name = PascalCase of the block class itself
 */
const ROOTS = [
  { dir: 'src/primitives', naming: 'dir' },
  { dir: 'src/composites', naming: 'dir' },
  { dir: 'src/layouts', naming: 'dir' },
  { dir: 'src/animation', naming: 'dir' },
  { dir: 'src/panels', naming: 'block' },
  { dir: 'src/report', naming: 'block' },
  { dir: 'src/keyboard', naming: 'block' },
  { dir: 'src/icons', naming: 'block' },
];

/**
 * Blocks whose public export name differs from the PascalCased block, plus
 * blocks emitted only from TSX (no colocated CSS) and the schema-driven view
 * shapes rendered by @ybouhjira/hyperkit-views. Applied last — always wins.
 */
const MANUAL_BLOCKS = {
  // Panel system — public exports are Panel-prefixed
  'sk-resize-handle': 'PanelResizeHandle',
  'sk-drop-zone': 'PanelDropZone',
  'sk-collapsed-strip': 'PanelCollapsedStrip',
  // Inline-styled primitives that emit no .css (class set in TSX or none)
  'sk-box': 'Box',
  'sk-flex': 'Flex',
  'sk-stack': 'Stack',
  'sk-grid': 'Grid',
  'sk-table': 'Table',
  'sk-text': 'Text',
  'sk-theme': 'ThemeProvider',
  'sk-model-selector': 'ModelSelector',
  'sk-devtoolbar': 'DevToolbar',
  'sk-doc-page': 'DocumentPage',
  'sk-doc-page-container': 'DocumentPage',
  'sk-annotation': 'AnnotationLayer',
  // Schema-driven view shapes (@ybouhjira/hyperkit-views)
  'sk-view-card': 'ViewCard',
  'sk-view-row': 'ViewRow',
  'sk-view-detail': 'ViewDetail',
  'sk-view-table': 'ViewTable',
  'sk-view-board': 'ViewBoard',
  'sk-view-gallery': 'ViewGallery',
  'sk-view-timeline': 'ViewTimeline',
  'sk-view-calendar': 'ViewCalendar',
  'sk-slot': 'ViewSlot',
};

/** "sk-tag-input" → "TagInput" */
function pascalFromBlock(block) {
  return block
    .replace(/^sk-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Extract every `.sk-{block}` class from a CSS source (block = no __, no --). */
function extractBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = new Set();
  // [a-z0-9] required after each "-" so "sk-btn--sm" yields only "sk-btn",
  // and "_" is excluded so "sk-card__header" yields only "sk-card".
  const re = /\.(sk-[a-z0-9]+(?:-[a-z0-9]+)*)/g;
  let m;
  while ((m = re.exec(clean)) !== null) blocks.add(m[1]);
  return blocks;
}

function walk(dir, onCss, componentDir = null) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, onCss, componentDir ?? entry.name);
    else if (entry.name.endsWith('.css')) onCss(p, componentDir);
  }
}

const map = new Map();
for (const { dir, naming } of ROOTS) {
  const abs = join(repoRoot, dir);
  if (!existsSync(abs)) {
    throw new Error(`Scan root missing: ${dir} — repo layout changed, update the generator.`);
  }
  walk(abs, (cssPath, componentDir) => {
    const css = readFileSync(cssPath, 'utf8');
    for (const block of extractBlocks(css)) {
      if (map.has(block)) continue; // first (highest-priority) mapping wins
      const name =
        naming === 'dir' && componentDir ? componentDir : pascalFromBlock(block);
      map.set(block, name);
    }
  });
}
for (const [block, name] of Object.entries(MANUAL_BLOCKS)) {
  map.set(block, name);
}

const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
const lines = sorted.map(([block, name]) => `  '${block}': '${name}',`).join('\n');

const banner = `// GENERATED FILE — do not edit by hand.
// Built by ${relative(join(here, '..'), fileURLToPath(import.meta.url))} from the
// HyperKit source tree (colocated .sk-* BEM CSS under src/primitives,
// src/composites, and the system roots). Re-run:
//   node scripts/generate-component-map.mjs

/** Complete map of \`.sk-{block}\` class → HyperKit component name (${sorted.length} blocks). */
export const COMPONENT_MAP: Readonly<Record<string, string>> = {
${lines}
};
`;

writeFileSync(outFile, banner);
console.log(`Wrote ${relative(repoRoot, outFile)} with ${sorted.length} blocks.`);
