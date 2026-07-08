/**
 * Walk the component tiers and gather each component's raw source files into
 * RawComponents. The filesystem is injected (DocgenFs) so this is unit-testable
 * without touching disk.
 */

import type { RawComponent } from './types.js';

/** Minimal filesystem surface docgen needs (injectable for tests). */
export interface DocgenFs {
  /** Directory entry names (component folders), or [] if the dir is absent. */
  readonly readdir: (dir: string) => readonly string[];
  /** File contents, or null when the file does not exist. */
  readonly readFileIfExists: (path: string) => string | null;
}

/** A source tier and the doc category its components belong to. */
export interface Tier {
  readonly dir: string;
  readonly category: string;
}

/** The component tiers HyperKit documents, in display order. */
export const DEFAULT_TIERS: readonly Tier[] = [
  { dir: 'primitives', category: 'Primitives' },
  { dir: 'composites', category: 'Composites' },
];

const join = (...parts: string[]): string => parts.join('/');

export function collectRawComponents(
  fs: DocgenFs,
  srcDir: string,
  tiers: readonly Tier[] = DEFAULT_TIERS
): RawComponent[] {
  const out: RawComponent[] = [];
  for (const tier of tiers) {
    const tierPath = join(srcDir, tier.dir);
    for (const name of fs.readdir(tierPath)) {
      const dir = join(tierPath, name);
      const typesSrc = fs.readFileIfExists(join(dir, 'types.ts'));
      const mainSrc = fs.readFileIfExists(join(dir, `${name}.tsx`));
      if (typesSrc === null && mainSrc === null) continue; // not a component dir
      out.push({
        name,
        category: tier.category,
        sourcePath: join(tier.dir, name, mainSrc !== null ? `${name}.tsx` : 'types.ts'),
        propsSource: `${typesSrc ?? ''}\n${mainSrc ?? ''}`,
        propsInterface: `${name}Props`,
        cssText: fs.readFileIfExists(join(dir, `${name}.css`)) ?? '',
        storiesText: fs.readFileIfExists(join(dir, `${name}.stories.tsx`)) ?? '',
        metaText: fs.readFileIfExists(join(dir, 'meta.docs.md')) ?? '',
      });
    }
  }
  return out;
}
