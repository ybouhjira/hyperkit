/** Pure assembly of RawComponents into the docs manifest. */

import { extractTokens, extractExamples, parseMeta } from './extract.js';
import { extractProps } from './props.js';
import type { DocEntry, DocsManifest, RawComponent } from './types.js';

/** Assemble one component's raw files into a finished DocEntry. */
export function toDocEntry(raw: RawComponent): DocEntry {
  const meta = parseMeta(raw.metaText);
  return {
    name: raw.name,
    category: raw.category,
    status: meta.status,
    summary: meta.summary,
    description: meta.description,
    props: extractProps(raw.propsSource, raw.propsInterface),
    examples: extractExamples(raw.storiesText),
    tokens: extractTokens(raw.cssText),
    ...(meta.a11y !== undefined ? { a11y: meta.a11y } : {}),
    ...(meta.dosAndDonts !== undefined ? { dosAndDonts: meta.dosAndDonts } : {}),
    sourcePath: raw.sourcePath,
  };
}

/** Build the manifest: DocEntries sorted by category then name, plus stats. */
export function buildManifest(raw: readonly RawComponent[]): DocsManifest {
  const entries = raw
    .map(toDocEntry)
    .sort((a, b) =>
      a.category === b.category
        ? a.name.localeCompare(b.name)
        : a.category.localeCompare(b.category)
    );
  const byCategory: Record<string, number> = {};
  for (const entry of entries) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
  }
  return { version: 1, entries, stats: { total: entries.length, byCategory } };
}
