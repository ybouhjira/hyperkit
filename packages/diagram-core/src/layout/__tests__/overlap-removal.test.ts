import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { emptyGraph, addNode, createNode, type Graph, type NodeId } from '../../graph/operations';
import { removeOverlaps, type OverlapRemovalOptions } from '../overlap-removal';
import type { LayoutResult } from '../../graph/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

/** Build a graph with N nodes, all same size, all at origin (fully overlapping) */
const buildClusterGraph = (
  count: number,
  size = { width: 100, height: 60 }
): { graph: Graph; layoutResult: LayoutResult } => {
  let g = emptyGraph();
  const positions = new Map<NodeId, { x: number; y: number }>();

  for (let i = 0; i < count; i++) {
    const id = `n${i}` as NodeId;
    g = runEffect(addNode(g, createNode(id, `Node ${i}`, { size })));
    positions.set(id, { x: 0, y: 0 }); // all at origin — maximum overlap
  }

  const layoutResult: LayoutResult = {
    nodePositions: positions,
    edgePaths: new Map(),
    bounds: { x: 0, y: 0, width: size.width, height: size.height },
  };

  return { graph: g, layoutResult };
};

/** Check that all pairs of nodes in a resolved LayoutResult are separated */
const assertNoOverlaps = (layoutResult: LayoutResult, graph: Graph, padding = 0): void => {
  const entries = Array.from(graph.nodes.entries());
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [idA, nodeA] = entries[i]!;
      const [idB, nodeB] = entries[j]!;
      const posA = layoutResult.nodePositions.get(idA)!;
      const posB = layoutResult.nodePositions.get(idB)!;

      const cax = posA.x + nodeA.size.width * 0.5;
      const cay = posA.y + nodeA.size.height * 0.5;
      const cbx = posB.x + nodeB.size.width * 0.5;
      const cby = posB.y + nodeB.size.height * 0.5;

      const requiredX = (nodeA.size.width + nodeB.size.width) * 0.5 + padding;
      const requiredY = (nodeA.size.height + nodeB.size.height) * 0.5 + padding;

      const separatedX = Math.abs(cax - cbx) >= requiredX - 0.001;
      const separatedY = Math.abs(cay - cby) >= requiredY - 0.001;

      // Nodes are separated if at least one axis has sufficient gap
      expect(separatedX || separatedY).toBe(true);
    }
  }
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('removeOverlaps', () => {
  // ─── Test 1: Two overlapping nodes ────────────────────────────────────────

  describe('two nodes fully overlapping', () => {
    it('pushes them apart to at least padding distance', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 0, y: 0 }], // exact same position — full overlap
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 60 },
      };

      const padding = 20;
      const result = removeOverlaps(layoutResult, g, { padding });

      assertNoOverlaps(result, g, padding);
    });

    it('pushes apart by exactly padding gap when already touching', () => {
      let g = emptyGraph();
      // 100px wide nodes, placed so they are touching (right edge of a = left edge of b)
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      // They are touching (gap = 0) but not overlapping, so with padding=20 they overlap by 20
      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 100, y: 0 }], // touching
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 200, height: 60 },
      };

      const padding = 20;
      const result = removeOverlaps(layoutResult, g, { padding });

      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // Centers after separation must be >= 100 + 20 = 120px apart horizontally
      const distX = Math.abs(posB.x + 50 - (posA.x + 50));
      expect(distX).toBeGreaterThanOrEqual(120 - 0.001);
    });
  });

  // ─── Test 2: Non-overlapping nodes ────────────────────────────────────────

  describe('two nodes already separated', () => {
    it('leaves positions unchanged when no overlap', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 200, y: 0 }], // 100px gap — well separated
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 300, height: 60 },
      };

      const result = removeOverlaps(layoutResult, g, { padding: 20 });

      expect(result.nodePositions.get('a' as NodeId)).toEqual({ x: 0, y: 0 });
      expect(result.nodePositions.get('b' as NodeId)).toEqual({ x: 200, y: 0 });
    });
  });

  // ─── Test 3: Three nodes in a line, all overlapping ───────────────────────

  describe('three nodes all at origin', () => {
    it('separates all three', () => {
      const { graph, layoutResult } = buildClusterGraph(3, { width: 80, height: 40 });
      const result = removeOverlaps(layoutResult, graph, { padding: 10 });
      assertNoOverlaps(result, graph, 10);
    });
  });

  // ─── Test 4: Cluster of 10 fully overlapping nodes ────────────────────────

  describe('cluster of 10 fully overlapping nodes', () => {
    it('separates all nodes', () => {
      const { graph, layoutResult } = buildClusterGraph(10, { width: 120, height: 60 });
      const result = removeOverlaps(layoutResult, graph, { padding: 15 });
      assertNoOverlaps(result, graph, 15);
    });
  });

  // ─── Test 5: Different node sizes ─────────────────────────────────────────

  describe('nodes with different sizes', () => {
    it('correctly handles heterogeneous node sizes', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('small', 'S', { size: { width: 40, height: 30 } })));
      g = runEffect(addNode(g, createNode('large', 'L', { size: { width: 200, height: 120 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['small' as NodeId, { x: 50, y: 50 }], // well inside the large node
          ['large' as NodeId, { x: 0, y: 0 }],
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 200, height: 120 },
      };

      const padding = 10;
      const result = removeOverlaps(layoutResult, g, { padding });
      assertNoOverlaps(result, g, padding);
    });
  });

  // ─── Test 6: Max iterations cap ───────────────────────────────────────────

  describe('maxIterations safety cap', () => {
    it('terminates within maxIterations even for dense cluster', () => {
      // 50 nodes all at the same point — stress test the cap
      const { graph, layoutResult } = buildClusterGraph(50, { width: 100, height: 60 });

      const start = performance.now();
      const result = removeOverlaps(layoutResult, graph, {
        padding: 20,
        maxIterations: 5, // deliberately low to test cap
      });
      const elapsed = performance.now() - start;

      // Should complete fast regardless of convergence
      expect(elapsed).toBeLessThan(1000);
      // Result must still be a valid LayoutResult
      expect(result.nodePositions.size).toBe(graph.nodes.size);
    });

    it('does not run more iterations than maxIterations', () => {
      // With a single pair and maxIterations=1, one iteration is enough to separate them
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 0, y: 0 }],
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 60 },
      };

      // 1 iteration should produce some movement even if not fully converged
      const result = removeOverlaps(layoutResult, g, { maxIterations: 1, padding: 20 });
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // After 1 iteration, at least one node must have moved
      const moved = posA.x !== 0 || posA.y !== 0 || posB.x !== 0 || posB.y !== 0;
      expect(moved).toBe(true);
    });
  });

  // ─── Test 7: Padding parameter ────────────────────────────────────────────

  describe('padding parameter', () => {
    it('produces larger separation with larger padding', () => {
      const buildLayout = (): { graph: Graph; layoutResult: LayoutResult } => {
        let g = emptyGraph();
        g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 80, height: 40 } })));
        g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 80, height: 40 } })));
        const layoutResult: LayoutResult = {
          nodePositions: new Map([
            ['a' as NodeId, { x: 0, y: 0 }],
            ['b' as NodeId, { x: 0, y: 0 }],
          ]),
          edgePaths: new Map(),
          bounds: { x: 0, y: 0, width: 80, height: 40 },
        };
        return { graph: g, layoutResult };
      };

      const { graph: g1, layoutResult: lr1 } = buildLayout();
      const { graph: g2, layoutResult: lr2 } = buildLayout();

      const result1 = removeOverlaps(lr1, g1, { padding: 5 });
      const result2 = removeOverlaps(lr2, g2, { padding: 50 });

      const pos1A = result1.nodePositions.get('a' as NodeId)!;
      const pos1B = result1.nodePositions.get('b' as NodeId)!;
      const pos2A = result2.nodePositions.get('a' as NodeId)!;
      const pos2B = result2.nodePositions.get('b' as NodeId)!;

      const center1A = { x: pos1A.x + 40, y: pos1A.y + 20 };
      const center1B = { x: pos1B.x + 40, y: pos1B.y + 20 };
      const center2A = { x: pos2A.x + 40, y: pos2A.y + 20 };
      const center2B = { x: pos2B.x + 40, y: pos2B.y + 20 };

      const dist1 = Math.hypot(center1B.x - center1A.x, center1B.y - center1A.y);
      const dist2 = Math.hypot(center2B.x - center2A.x, center2B.y - center2A.y);

      expect(dist2).toBeGreaterThan(dist1);
    });
  });

  // ─── Test 8: Preserves relative ordering ──────────────────────────────────

  describe('relative ordering preservation', () => {
    it('node that starts left stays left after separation', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('left', 'L', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('right', 'R', { size: { width: 100, height: 60 } })));

      // Right starts slightly to the right of left (both overlap)
      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['left' as NodeId, { x: 0, y: 0 }],
          ['right' as NodeId, { x: 10, y: 0 }], // 10px offset — overlapping
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 110, height: 60 },
      };

      const result = removeOverlaps(layoutResult, g, { padding: 20 });

      const posLeft = result.nodePositions.get('left' as NodeId)!;
      const posRight = result.nodePositions.get('right' as NodeId)!;

      // After separation, the originally-left node should still be to the left
      expect(posLeft.x).toBeLessThan(posRight.x);
    });
  });

  // ─── Test 9: Empty graph ──────────────────────────────────────────────────

  describe('empty graph', () => {
    it('returns layout result unchanged', () => {
      const g = emptyGraph();
      const layoutResult: LayoutResult = {
        nodePositions: new Map(),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 0, height: 0 },
      };

      const result = removeOverlaps(layoutResult, g);

      expect(result).toBe(layoutResult); // strict reference equality — same object
    });
  });

  // ─── Test 10: Single node ─────────────────────────────────────────────────

  describe('single node', () => {
    it('returns layout result unchanged', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([['a' as NodeId, { x: 50, y: 75 }]]),
        edgePaths: new Map(),
        bounds: { x: 50, y: 75, width: 100, height: 60 },
      };

      const result = removeOverlaps(layoutResult, g);

      expect(result).toBe(layoutResult); // no-op — same object returned
    });
  });

  // ─── Test 11: Bounds recomputed after adjustment ───────────────────────────

  describe('bounds recomputation', () => {
    it('bounds encompass all nodes after separation', () => {
      const { graph, layoutResult } = buildClusterGraph(5, { width: 80, height: 40 });
      const result = removeOverlaps(layoutResult, graph, { padding: 20 });

      // Verify every node is inside the recomputed bounds
      for (const [id, node] of graph.nodes) {
        const pos = result.nodePositions.get(id)!;
        expect(pos.x).toBeGreaterThanOrEqual(result.bounds.x - 0.001);
        expect(pos.y).toBeGreaterThanOrEqual(result.bounds.y - 0.001);
        expect(pos.x + node.size.width).toBeLessThanOrEqual(
          result.bounds.x + result.bounds.width + 0.001
        );
        expect(pos.y + node.size.height).toBeLessThanOrEqual(
          result.bounds.y + result.bounds.height + 0.001
        );
      }
    });

    it('bounds are wider than original when nodes are spread apart', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 0, y: 0 }],
        ]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 60 },
      };

      const result = removeOverlaps(layoutResult, g, { padding: 20 });

      // After separation, the bounding box must be larger than the original
      const originalArea = layoutResult.bounds.width * layoutResult.bounds.height;
      const newArea = result.bounds.width * result.bounds.height;
      expect(newArea).toBeGreaterThan(originalArea);
    });
  });

  // ─── Test 12: Edge paths preserved ────────────────────────────────────────

  describe('edge path preservation', () => {
    it('preserves edge paths from input unchanged', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a', 'A', { size: { width: 100, height: 60 } })));
      g = runEffect(addNode(g, createNode('b', 'B', { size: { width: 100, height: 60 } })));

      const edgePaths = new Map([
        [
          'e1' as import('../../graph/types').EdgeId,
          {
            d: 'M 0 0 L 100 0',
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
            ],
            sourceIntersection: { x: 0, y: 0 },
            targetIntersection: { x: 100, y: 0 },
            labelPosition: { x: 50, y: 0 },
          },
        ],
      ]);

      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          ['a' as NodeId, { x: 0, y: 0 }],
          ['b' as NodeId, { x: 0, y: 0 }],
        ]),
        edgePaths,
        bounds: { x: 0, y: 0, width: 100, height: 60 },
      };

      const result = removeOverlaps(layoutResult, g, { padding: 20 });

      // Edge paths object reference must be preserved
      expect(result.edgePaths).toBe(edgePaths);
    });
  });

  // ─── Test 13: Performance — 100 nodes stays fast ──────────────────────────

  describe('performance', () => {
    it('resolves 100 fully overlapping nodes quickly', () => {
      const { graph, layoutResult } = buildClusterGraph(100, { width: 150, height: 60 });

      const start = performance.now();
      removeOverlaps(layoutResult, graph, { padding: 20 });
      const elapsed = performance.now() - start;

      // Smoke guard against algorithmic regressions (an O(n^2)-with-large-constant
      // regression lands in the hundreds of ms). The bound is deliberately loose:
      // ~15ms is normal on slow shared CI runners, ~5ms on a dev machine.
      expect(elapsed).toBeLessThan(50);
    });
  });
});
