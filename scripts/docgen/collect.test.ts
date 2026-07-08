import { describe, it, expect } from 'vitest';
import { collectRawComponents, DEFAULT_TIERS, type DocgenFs } from './collect.js';

function fakeFs(tree: Record<string, string | null>, dirs: Record<string, string[]>): DocgenFs {
  return {
    readdir: (d) => dirs[d] ?? [],
    readFileIfExists: (p) => (p in tree ? tree[p] : null),
  };
}

describe('collectRawComponents', () => {
  it('collects a full component directory', () => {
    const dirs = { 'src/primitives': ['Button'], 'src/composites': [] };
    const tree: Record<string, string | null> = {
      'src/primitives/Button/types.ts': null,
      'src/primitives/Button/Button.tsx': 'export interface ButtonProps {}',
      'src/primitives/Button/Button.css': '.b{}',
      'src/primitives/Button/Button.stories.tsx': 'export const Default: Story = {};',
      'src/primitives/Button/meta.docs.md': '---\nsummary: x\n---',
    };
    const [c] = collectRawComponents(fakeFs(tree, dirs), 'src');
    expect(c).toMatchObject({
      name: 'Button',
      category: 'Primitives',
      sourcePath: 'primitives/Button/Button.tsx',
      propsInterface: 'ButtonProps',
      cssText: '.b{}',
      storiesText: 'export const Default: Story = {};',
      metaText: '---\nsummary: x\n---',
    });
    expect(c?.propsSource).toContain('ButtonProps');
  });

  it('uses types.ts as the sourcePath when there is no .tsx', () => {
    const dirs = { 'src/primitives': ['Tokens'], 'src/composites': [] };
    const tree = { 'src/primitives/Tokens/types.ts': 'export interface TokensProps {}' };
    const [c] = collectRawComponents(fakeFs(tree, dirs), 'src');
    expect(c?.sourcePath).toBe('primitives/Tokens/types.ts');
    expect(c?.cssText).toBe('');
    expect(c?.storiesText).toBe('');
  });

  it('skips a directory with neither types.ts nor a .tsx', () => {
    const dirs = { 'src/primitives': ['NotAComponent'], 'src/composites': [] };
    expect(collectRawComponents(fakeFs({}, dirs), 'src')).toEqual([]);
  });

  it('exposes the default tiers', () => {
    expect(DEFAULT_TIERS.map((t) => t.dir)).toEqual(['primitives', 'composites']);
  });
});
