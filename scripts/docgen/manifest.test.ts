import { describe, it, expect } from 'vitest';
import { buildManifest, toDocEntry } from './manifest.js';
import type { RawComponent } from './types.js';

function raw(over: Partial<RawComponent> = {}): RawComponent {
  return {
    name: 'Button',
    category: 'Primitives',
    sourcePath: 'primitives/Button/Button.tsx',
    propsSource: 'export interface ButtonProps {\n  /** label */\n  label: string;\n}',
    propsInterface: 'ButtonProps',
    cssText: '.b{color:var(--sk-accent)}',
    storiesText: 'export const Default: Story = {};',
    metaText: '---\nsummary: A button.\nstatus: stable\na11y: focusable\n---\nBody.\n## Do\n- a\n',
    ...over,
  };
}

describe('toDocEntry', () => {
  it('assembles a full entry from the raw files', () => {
    const e = toDocEntry(raw());
    expect(e).toMatchObject({
      name: 'Button',
      category: 'Primitives',
      status: 'stable',
      summary: 'A button.',
      a11y: 'focusable',
    });
    expect(e.props).toEqual([
      { name: 'label', type: 'string', required: true, description: 'label' },
    ]);
    expect(e.examples.map((x) => x.name)).toEqual(['Default']);
    expect(e.tokens).toEqual(['--sk-accent']);
    expect(e.dosAndDonts).toEqual({ do: ['a'], dont: [] });
  });

  it('omits a11y and dosAndDonts when absent', () => {
    const e = toDocEntry(raw({ metaText: '---\nsummary: x\n---\n' }));
    expect(e.a11y).toBeUndefined();
    expect(e.dosAndDonts).toBeUndefined();
  });
});

describe('buildManifest', () => {
  it('sorts by category then name and counts per category', () => {
    const m = buildManifest([
      raw({ name: 'Zeta', category: 'Composites' }),
      raw({ name: 'Alpha', category: 'Primitives' }),
      raw({ name: 'Beta', category: 'Primitives' }),
    ]);
    expect(m.entries.map((e) => `${e.category}/${e.name}`)).toEqual([
      'Composites/Zeta',
      'Primitives/Alpha',
      'Primitives/Beta',
    ]);
    expect(m.stats).toEqual({ total: 3, byCategory: { Composites: 1, Primitives: 2 } });
    expect(m.version).toBe(1);
  });

  it('handles empty input', () => {
    expect(buildManifest([])).toEqual({
      version: 1,
      entries: [],
      stats: { total: 0, byCategory: {} },
    });
  });
});
