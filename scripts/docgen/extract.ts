/**
 * Pure, source-text extractors for docgen. No filesystem, no TS compiler here —
 * each takes raw file text and returns structured data, so they're trivially
 * testable to 100%.
 *
 * Non-null assertions below are on regex capture groups that the pattern
 * guarantees (group 1 of a matched alternation) and on array indices proven by
 * the surrounding bounds — safe by construction, like scripts/generate-ai-docs.ts.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { ExampleDoc, MetaDoc, DosAndDonts } from './types.js';

/** All distinct `--sk-*` tokens referenced in a component's CSS, sorted. */
export function extractTokens(cssText: string): string[] {
  const found = new Set<string>();
  for (const match of cssText.matchAll(/--sk-[a-z0-9-]+/g)) {
    found.add(match[0]);
  }
  return [...found].sort();
}

/** Story exports (`export const X: Story = …`) as examples, in file order. */
export function extractExamples(storiesText: string): ExampleDoc[] {
  const starts: Array<{ name: string; index: number }> = [];
  for (const match of storiesText.matchAll(/export const (\w+)\s*:\s*Story\b/g)) {
    starts.push({ name: match[1]!, index: match.index });
  }
  return starts.map((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1]!.index : storiesText.length;
    return {
      name: start.name,
      source: storiesText.slice(start.index, end).trim(),
      storyId: start.name,
    };
  });
}

/** Bullet items (`- …`) under a `## <heading>` section, until the next `##`/EOF. */
function bulletsUnder(md: string, heading: string): string[] {
  const lines = md.split('\n');
  const out: string[] = [];
  let inSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      inSection = trimmed.slice(3).trim().toLowerCase() === heading.toLowerCase();
      continue;
    }
    if (inSection && trimmed.startsWith('- ')) out.push(trimmed.slice(2).trim());
  }
  return out;
}

const STATUSES = new Set(['stable', 'beta', 'deprecated']);

/**
 * Parse a `meta.docs.md` — the only hand-authored doc input.
 *
 * Format: optional `--- key: value ---` frontmatter (summary / status / a11y),
 * a markdown body (everything up to the first `##`), and `## Do` / `## Don't`
 * bullet sections. Empty input → an undocumented entry (summary `''`).
 */
export function parseMeta(metaText: string): MetaDoc {
  const frontmatter: Record<string, string> = {};
  let body = metaText;

  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(metaText);
  if (fm !== null) {
    for (const line of fm[1]!.split('\n')) {
      const sep = line.indexOf(':');
      if (sep === -1) continue;
      frontmatter[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
    body = metaText.slice(fm[0].length);
  }

  const statusRaw = frontmatter['status'] ?? 'stable';
  const status = (STATUSES.has(statusRaw) ? statusRaw : 'stable') as MetaDoc['status'];

  const description = body.split('\n## ')[0]!.trim();
  const dos = bulletsUnder(body, 'Do');
  const donts = bulletsUnder(body, "Don't");
  const dosAndDonts: DosAndDonts | undefined =
    dos.length > 0 || donts.length > 0 ? { do: dos, dont: donts } : undefined;

  return {
    summary: frontmatter['summary'] ?? '',
    status,
    description,
    ...(frontmatter['a11y'] !== undefined ? { a11y: frontmatter['a11y'] } : {}),
    ...(dosAndDonts !== undefined ? { dosAndDonts } : {}),
  };
}
