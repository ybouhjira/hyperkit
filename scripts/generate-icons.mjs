import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const ICONS_DIR = join(PROJECT_ROOT, 'node_modules/lucide-static/icons');
const OUT_DIR = join(PROJECT_ROOT, 'src/icons');

// SolidKit component names that would conflict with generated icon named exports.
// These icons are still registered in the registry (accessible via <Icon name="..." />),
// but we skip generating a top-level named export to avoid ambiguity.
const SOLIDKIT_COMPONENT_NAMES = new Set([
  'Badge', 'Box', 'Container', 'FileInput', 'Grid', 'Section', 'Sidebar', 'Table', 'Text',
  // Additional layout/input primitives that exist as SolidKit components
  'Accordion', 'Card', 'Center', 'Checkbox', 'Collapsible', 'Dialog', 'Dropdown',
  'Filter', 'Flex', 'Image', 'Input', 'Layers', 'List', 'Markdown', 'Monitor',
  'Popover', 'Select', 'Separator', 'Slider', 'Spinner', 'Stack', 'Switch',
  'Tabs', 'Timeline', 'Toast', 'Tooltip', 'Wrap',
]);

function kebabToPascal(str) {
  // Handle numeric parts: '0-1' → '01', '1-0' → '10' by collapsing digit-only segments
  // First replace digit-hyphen-digit sequences to avoid spurious PascalCase splits
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function extractSvgContent(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) return '';
  let inner = match[1].trim();
  // Remove XML comments
  inner = inner.replace(/<!--[\s\S]*?-->/g, '').trim();
  return inner;
}

// Read all SVG files
const files = readdirSync(ICONS_DIR)
  .filter((f) => f.endsWith('.svg'))
  .sort();

console.log(`Found ${files.length} Lucide icons`);

const iconEntries = [];
const namedEntries = [];
const seenPascalNames = new Map(); // pascal → first kebab name seen
let skippedContent = 0;
let skippedDuplicate = 0;
let skippedConflict = 0;

for (const file of files) {
  const name = basename(file, '.svg');
  const pascal = kebabToPascal(name);
  const svg = readFileSync(join(ICONS_DIR, file), 'utf-8');
  const content = extractSvgContent(svg);

  if (!content) {
    console.warn(`Skipping ${file} — could not extract SVG content`);
    skippedContent++;
    continue;
  }

  // Always add to the icon registry (accessible via <Icon name="..." />)
  iconEntries.push(`  '${name}': (): JSX.Element => (\n    <>${content}</>\n  )`);

  // Skip named export if it conflicts with an existing SolidKit component
  if (SOLIDKIT_COMPONENT_NAMES.has(pascal)) {
    skippedConflict++;
    continue;
  }

  // Skip named export if this PascalCase name was already emitted by an earlier icon
  if (seenPascalNames.has(pascal)) {
    console.warn(`Duplicate PascalCase '${pascal}': '${seenPascalNames.get(pascal)}' wins over '${name}'`);
    skippedDuplicate++;
    continue;
  }

  seenPascalNames.set(pascal, name);
  namedEntries.push(`export const ${pascal} = createNamedIcon('${name}');`);
}

console.log(
  `Registry: ${iconEntries.length} icons | Named exports: ${namedEntries.length} | ` +
  `Skipped (content): ${skippedContent}, (duplicate PascalCase): ${skippedDuplicate}, (SolidKit conflict): ${skippedConflict}`
);

// Write icons.generated.tsx
const iconsFile = `// Auto-generated from Lucide icons — do not edit manually
// Run: node scripts/generate-icons.mjs
// Icon count: ${iconEntries.length}
import type { JSX } from 'solid-js';
import type { IconDefinition } from './icons';

export const generatedIcons: Record<string, IconDefinition> = {
${iconEntries.join(',\n')},
};
`;

writeFileSync(join(OUT_DIR, 'icons.generated.tsx'), iconsFile);
console.log(`Written icons.generated.tsx`);

// Write named.generated.tsx
const namedFile = `// Auto-generated from Lucide icons — do not edit manually
// Run: node scripts/generate-icons.mjs
import { createNamedIcon } from './named';

${namedEntries.join('\n')}
`;

writeFileSync(join(OUT_DIR, 'named.generated.tsx'), namedFile);
console.log(`Written named.generated.tsx`);
