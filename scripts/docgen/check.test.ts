import { describe, it, expect } from 'vitest';
import { checkDocs } from './check.js';
import type { DocEntry, DocsManifest } from './types.js';

function entry(over: Partial<DocEntry> = {}): DocEntry {
  return {
    name: 'Button',
    category: 'Primitives',
    status: 'stable',
    summary: 'A button.',
    description: '',
    props: [{ name: 'label', type: 'string', required: true, description: 'lbl' }],
    examples: [{ name: 'Default', source: 'x', storyId: 'Default' }],
    tokens: [],
    dosAndDonts: { do: ['a'], dont: [] },
    sourcePath: 'p',
    ...over,
  };
}
const manifest = (entries: DocEntry[]): DocsManifest => ({
  version: 1,
  entries,
  stats: { total: entries.length, byCategory: {} },
});

describe('checkDocs', () => {
  it('passes a fully documented component', () => {
    const r = checkDocs(manifest([entry()]));
    expect(r.ok).toBe(true);
    expect(r.failures).toEqual([]);
    expect(r.propDocCoverage).toBe(1);
  });

  it('flags missing summary, examples and dos/donts', () => {
    const r = checkDocs(manifest([entry({ summary: ' ', examples: [], dosAndDonts: undefined })]));
    expect(r.ok).toBe(false);
    expect(r.failures[0]).toMatchObject({ name: 'Button' });
    expect(r.failures[0]?.issues).toHaveLength(3);
  });

  it('computes prop-doc coverage; 1 when a component has no props', () => {
    const undoc = entry({
      name: 'X',
      props: [{ name: 'a', type: 't', required: true, description: '' }],
    });
    expect(checkDocs(manifest([entry(), undoc])).propDocCoverage).toBe(0.5);
    expect(checkDocs(manifest([entry({ props: [] })])).propDocCoverage).toBe(1);
  });
});
