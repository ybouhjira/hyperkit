import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { treeToTsx, CodegenError } from './codegen';
import type { TreeNode } from './types';

const run = <A, E>(eff: Effect.Effect<A, E>): A =>
  Effect.runSync(eff as Effect.Effect<A, never>);

describe('treeToTsx', () => {
  it('generates import and function for a single node', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: { gap: 'md' },
      children: [],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toContain("import { Stack } from '@ybouhjira/hyperkit'");
    expect(result).toContain('export default function MyLayout()');
    expect(result).toContain('<Stack');
  });

  it('self-closes leaf nodes with no children or text', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: {},
      children: [
        { id: 'n1', component: 'Separator', props: {}, children: [] },
      ],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toContain('<Separator />');
  });

  it('renders text children inline', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: {},
      children: [
        { id: 'n1', component: 'Button', props: { children: 'Save' }, children: [] },
      ],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toContain('"Save"');
    expect(result).toContain('</Button>');
  });

  it('renders boolean props without value', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: {},
      children: [
        { id: 'n1', component: 'Button', props: { children: 'X', disabled: true }, children: [] },
      ],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toMatch(/disabled(?!\s*=)/);
  });

  it('renders number props', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Grid',
      props: { columns: 3 },
      children: [],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toContain('columns=3');
  });

  it('collects all unique components for import', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: {},
      children: [
        { id: 'n1', component: 'Button', props: { children: 'A' }, children: [] },
        { id: 'n2', component: 'Text', props: { children: 'B' }, children: [] },
      ],
    };
    const result = Effect.runSync(treeToTsx(tree));
    expect(result).toContain('Button');
    expect(result).toContain('Text');
    expect(result).toContain('Stack');
    // Should appear once in import
    const importLine = result.split('\n')[0] ?? '';
    expect(importLine).toContain('Button');
    expect(importLine).toContain('Stack');
    expect(importLine).toContain('Text');
  });

  it('returns Effect that succeeds', () => {
    const tree: TreeNode = {
      id: 'root',
      component: 'Stack',
      props: {},
      children: [],
    };
    const result = treeToTsx(tree);
    expect(Effect.isEffect(result)).toBe(true);
  });

  it('CodegenError has correct tag', () => {
    const err = new CodegenError('test error');
    expect(err._tag).toBe('CodegenError');
    expect(err.message).toBe('test error');
  });
});
