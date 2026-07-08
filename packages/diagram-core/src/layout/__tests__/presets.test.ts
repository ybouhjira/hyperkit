import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  emptyGraph,
  addNode,
  addEdge,
  createNode,
  createEdge,
} from '../../graph/operations';
import type { NodeId, EdgeId } from '../../graph/types';
import {
  LAYOUT_PRESETS,
  getLayoutPreset,
  type LayoutPreset,
} from '../presets';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const runEffect = async <A, E>(effect: Effect.Effect<A, E>): Promise<A> =>
  Effect.runPromise(effect);

const buildLinearGraph = async (nodeCount: number) => {
  let g = emptyGraph();
  for (let i = 0; i < nodeCount; i++) {
    g = await runEffect(
      addNode(g, createNode(`n${i}` as NodeId, `N${i}`, {}))
    );
  }
  // Linear chain: n0 → n1 → n2 → ...
  for (let i = 0; i < nodeCount - 1; i++) {
    g = await runEffect(
      addEdge(g, createEdge(`e${i}` as EdgeId, `n${i}`, `n${i + 1}`, {}))
    );
  }
  return g;
};

const buildDenseGraph = async (nodeCount: number) => {
  let g = emptyGraph();
  for (let i = 0; i < nodeCount; i++) {
    g = await runEffect(
      addNode(g, createNode(`n${i}` as NodeId, `N${i}`, {}))
    );
  }
  // Dense: every node connects to several others
  let edgeIdx = 0;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < Math.min(i + 4, nodeCount); j++) {
      g = await runEffect(
        addEdge(g, createEdge(`e${edgeIdx++}` as EdgeId, `n${i}`, `n${j}`, {}))
      );
    }
  }
  return g;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LAYOUT_PRESETS', () => {
  const nonAutoPresets: Array<Exclude<LayoutPreset, 'auto'>> = [
    'vertical',
    'horizontal',
    'tree',
    'force',
    'radial',
    'grid',
  ];

  it('defines all non-auto presets', () => {
    for (const preset of nonAutoPresets) {
      expect(LAYOUT_PRESETS[preset]).toBeDefined();
    }
  });

  it('all presets have padding ≥ 40', () => {
    for (const preset of nonAutoPresets) {
      const opts = LAYOUT_PRESETS[preset];
      expect(opts.padding).toBeGreaterThanOrEqual(40);
    }
  });

  it('all presets have a defined algorithm', () => {
    for (const preset of nonAutoPresets) {
      const opts = LAYOUT_PRESETS[preset];
      expect(opts.algorithm).toBeDefined();
      expect(typeof opts.algorithm).toBe('string');
    }
  });

  it('vertical preset uses layered algorithm with TB direction', () => {
    const opts = LAYOUT_PRESETS.vertical;
    expect(opts.algorithm).toBe('layered');
    expect(opts.direction).toBe('TB');
  });

  it('horizontal preset uses layered algorithm with LR direction', () => {
    const opts = LAYOUT_PRESETS.horizontal;
    expect(opts.algorithm).toBe('layered');
    expect(opts.direction).toBe('LR');
  });

  it('tree preset uses mrtree algorithm', () => {
    const opts = LAYOUT_PRESETS.tree;
    expect(opts.algorithm).toBe('mrtree');
  });

  it('force preset uses force algorithm', () => {
    const opts = LAYOUT_PRESETS.force;
    expect(opts.algorithm).toBe('force');
  });

  it('radial preset uses radial algorithm', () => {
    const opts = LAYOUT_PRESETS.radial;
    expect(opts.algorithm).toBe('radial');
  });
});

describe('getLayoutPreset', () => {
  it('returns the same options as LAYOUT_PRESETS for vertical', () => {
    expect(getLayoutPreset('vertical')).toEqual(LAYOUT_PRESETS.vertical);
  });

  it('returns the same options as LAYOUT_PRESETS for horizontal', () => {
    expect(getLayoutPreset('horizontal')).toEqual(LAYOUT_PRESETS.horizontal);
  });

  it('returns the same options as LAYOUT_PRESETS for tree', () => {
    expect(getLayoutPreset('tree')).toEqual(LAYOUT_PRESETS.tree);
  });

  it('returns the same options as LAYOUT_PRESETS for force', () => {
    expect(getLayoutPreset('force')).toEqual(LAYOUT_PRESETS.force);
  });

  it('returns the same options as LAYOUT_PRESETS for radial', () => {
    expect(getLayoutPreset('radial')).toEqual(LAYOUT_PRESETS.radial);
  });

  it('returns the same options as LAYOUT_PRESETS for grid', () => {
    expect(getLayoutPreset('grid')).toEqual(LAYOUT_PRESETS.grid);
  });

  it('auto without graph falls back to vertical', () => {
    const opts = getLayoutPreset('auto');
    expect(opts).toEqual(LAYOUT_PRESETS.vertical);
  });

  describe('auto preset selection', () => {
    it('selects tree for a tree-like graph (linear chain)', async () => {
      // Linear chain of 5 nodes: n0→n1→n2→n3→n4 is a tree (maxInDegree=1, edges=nodes-1)
      const graph = await buildLinearGraph(5);
      const opts = getLayoutPreset('auto', graph);
      expect(opts).toEqual(LAYOUT_PRESETS.tree);
    });

    it('selects vertical for a large graph (> 50 nodes)', async () => {
      const graph = await buildDenseGraph(55);
      const opts = getLayoutPreset('auto', graph);
      expect(opts).toEqual(LAYOUT_PRESETS.vertical);
    });

    it('selects force for a sparse graph (edges < nodes * 0.5)', async () => {
      // Build a sparse graph: 10 nodes, only 3 edges (< 10 * 0.5 = 5)
      // and not tree-like (edgeCount ≠ nodeCount - 1)
      let g = emptyGraph();
      for (let i = 0; i < 10; i++) {
        g = await runEffect(addNode(g, createNode(`n${i}` as NodeId, `N${i}`, {})));
      }
      // 3 edges — sparse but not a tree (tree would need 9 edges)
      g = await runEffect(addEdge(g, createEdge('e0' as EdgeId, 'n0', 'n5', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'n2', 'n7', {})));
      g = await runEffect(addEdge(g, createEdge('e2' as EdgeId, 'n4', 'n9', {})));

      const opts = getLayoutPreset('auto', g);
      expect(opts).toEqual(LAYOUT_PRESETS.force);
    });
  });
});
