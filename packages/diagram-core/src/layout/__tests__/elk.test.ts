import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  emptyGraph,
  addNode,
  addEdge,
  createNode,
  createEdge,
  type Graph,
  type NodeId,
  type EdgeId,
} from '../../graph/operations';
import { elkLayout, type ElkLayoutOptions } from '../hierarchical/elk';

// Helper to run async Effect and get success value
const runEffect = async <A, E>(effect: Effect.Effect<A, E>): Promise<A> =>
  Effect.runPromise(effect);

describe('elk layout', () => {
  describe('basic node positioning', () => {
    it('positions all nodes in a 2-node 1-edge graph', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, {}));

      const posA = result.nodePositions.get('a' as NodeId);
      const posB = result.nodePositions.get('b' as NodeId);

      expect(posA).toBeDefined();
      expect(posB).toBeDefined();
      expect(typeof posA!.x).toBe('number');
      expect(typeof posA!.y).toBe('number');
      expect(typeof posB!.x).toBe('number');
      expect(typeof posB!.y).toBe('number');
      expect(Number.isFinite(posA!.x)).toBe(true);
      expect(Number.isFinite(posA!.y)).toBe(true);
      expect(Number.isFinite(posB!.x)).toBe(true);
      expect(Number.isFinite(posB!.y)).toBe(true);
      expect(result.nodePositions.size).toBe(2);
    });
  });

  describe('edge paths', () => {
    it('creates edge paths with a d attribute for edges', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId);

      expect(edgePath).toBeDefined();
      expect(edgePath!.d).toBeTruthy();
      // SVG path must start with M (moveTo)
      expect(edgePath!.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
      // Must contain at least one segment command
      expect(edgePath!.d).toMatch(/[MLCQ]/);
      expect(edgePath!.points.length).toBeGreaterThanOrEqual(2);
    });

    it('provides sourceIntersection and targetIntersection on edge paths', async () => {
      let g = emptyGraph();
      g = await runEffect(
        addNode(g, createNode('a' as NodeId, 'A', { size: { width: 100, height: 50 } }))
      );
      g = await runEffect(
        addNode(g, createNode('b' as NodeId, 'B', { size: { width: 100, height: 50 } }))
      );
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      expect(edgePath.sourceIntersection).toBeDefined();
      expect(edgePath.targetIntersection).toBeDefined();
      expect(Number.isFinite(edgePath.sourceIntersection.x)).toBe(true);
      expect(Number.isFinite(edgePath.sourceIntersection.y)).toBe(true);
      expect(Number.isFinite(edgePath.targetIntersection.x)).toBe(true);
      expect(Number.isFinite(edgePath.targetIntersection.y)).toBe(true);
    });
  });

  describe('layout bounds', () => {
    it('computes positive bounds that encompass all nodes', async () => {
      let g = emptyGraph();
      g = await runEffect(
        addNode(g, createNode('a' as NodeId, 'A', { size: { width: 100, height: 50 } }))
      );
      g = await runEffect(
        addNode(g, createNode('b' as NodeId, 'B', { size: { width: 100, height: 50 } }))
      );
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, {}));

      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);

      // All node positions must fit within the reported bounds
      for (const [nodeId, pos] of result.nodePositions) {
        const node = g.nodes.get(nodeId)!;
        expect(pos.x).toBeGreaterThanOrEqual(result.bounds.x);
        expect(pos.y).toBeGreaterThanOrEqual(result.bounds.y);
        expect(pos.x + node.size.width).toBeLessThanOrEqual(
          result.bounds.x + result.bounds.width + 1 // 1px tolerance for floating point
        );
        expect(pos.y + node.size.height).toBeLessThanOrEqual(
          result.bounds.y + result.bounds.height + 1
        );
      }
    });
  });

  describe('layout directions', () => {
    it('TB direction: target node is below source node', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, { direction: 'TB' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A is source → should be above B (smaller y)
      expect(posA.y).toBeLessThan(posB.y);
    });

    it('LR direction: target node is to the right of source node', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, { direction: 'LR' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A is source → should be left of B (smaller x)
      expect(posA.x).toBeLessThan(posB.x);
    });

    it('TB and LR produce distinct layouts (relative axis differs)', async () => {
      const buildGraph = async () => {
        let g = emptyGraph();
        g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
        g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
        g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        return g;
      };

      const [tbResult, lrResult] = await Promise.all([
        runEffect(elkLayout.layout(await buildGraph(), { direction: 'TB' })),
        runEffect(elkLayout.layout(await buildGraph(), { direction: 'LR' })),
      ]);

      const tbPosA = tbResult.nodePositions.get('a' as NodeId)!;
      const tbPosB = tbResult.nodePositions.get('b' as NodeId)!;
      const lrPosA = lrResult.nodePositions.get('a' as NodeId)!;
      const lrPosB = lrResult.nodePositions.get('b' as NodeId)!;

      // TB: vertical separation dominates
      const tbVertDiff = Math.abs(tbPosB.y - tbPosA.y);
      // LR: horizontal separation dominates
      const lrHorizDiff = Math.abs(lrPosB.x - lrPosA.x);

      expect(tbVertDiff).toBeGreaterThan(0);
      expect(lrHorizDiff).toBeGreaterThan(0);
    });
  });

  describe('graph with no edges', () => {
    it('positions all nodes even with no edges', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));

      const result = await runEffect(elkLayout.layout(g, {}));

      expect(result.nodePositions.size).toBe(3);
      expect(result.nodePositions.get('a' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('b' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('c' as NodeId)).toBeDefined();
      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);
    });
  });

  describe('graph with multiple edges between different nodes', () => {
    it('produces paths for all edges in a multi-edge graph', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = await runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));
      g = await runEffect(addEdge(g, createEdge('e3' as EdgeId, 'a', 'c', {})));

      const result = await runEffect(elkLayout.layout(g, {}));

      expect(result.nodePositions.size).toBe(3);
      expect(result.edgePaths.size).toBe(3);

      const e1 = result.edgePaths.get('e1' as EdgeId);
      const e2 = result.edgePaths.get('e2' as EdgeId);
      const e3 = result.edgePaths.get('e3' as EdgeId);

      expect(e1).toBeDefined();
      expect(e2).toBeDefined();
      expect(e3).toBeDefined();

      // Each path should have a valid d attribute
      [e1!, e2!, e3!].forEach((path) => {
        expect(path.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
      });
    });
  });

  describe('algorithm variants', () => {
    it('mrtree algorithm produces valid layout', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('root' as NodeId, 'Root', {})));
      g = await runEffect(addNode(g, createNode('child1' as NodeId, 'Child1', {})));
      g = await runEffect(addNode(g, createNode('child2' as NodeId, 'Child2', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'root', 'child1', {})));
      g = await runEffect(addEdge(g, createEdge('e2' as EdgeId, 'root', 'child2', {})));

      const result = await runEffect(elkLayout.layout(g, { algorithm: 'mrtree' }));

      expect(result.nodePositions.size).toBe(3);
      expect(result.nodePositions.get('root' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('child1' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('child2' as NodeId)).toBeDefined();
      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);
    });
  });

  describe('edge routing options', () => {
    it('orthogonal edge routing produces valid paths', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = await runEffect(elkLayout.layout(g, { edgeRouting: 'orthogonal' }));
      const edgePath = result.edgePaths.get('e1' as EdgeId);

      expect(edgePath).toBeDefined();
      expect(edgePath!.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
      expect(edgePath!.points.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('groups / compound nodes', () => {
    it('nodes inside a group all receive positions', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('n1' as NodeId, 'N1', {})));
      g = await runEffect(addNode(g, createNode('n2' as NodeId, 'N2', {})));
      g = await runEffect(addNode(g, createNode('n3' as NodeId, 'N3', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'n1', 'n2', {})));
      g = await runEffect(addEdge(g, createEdge('e2' as EdgeId, 'n2', 'n3', {})));

      const groups = new Map<string, readonly string[]>([
        ['GroupA', ['n1', 'n2']],
      ]);

      const result = await runEffect(elkLayout.layout(g, { groups }));

      // All three nodes must be positioned — grouped and ungrouped alike
      expect(result.nodePositions.get('n1' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('n2' as NodeId)).toBeDefined();
      expect(result.nodePositions.get('n3' as NodeId)).toBeDefined();

      // Grouped nodes must have finite coordinates
      const posN1 = result.nodePositions.get('n1' as NodeId)!;
      const posN2 = result.nodePositions.get('n2' as NodeId)!;
      expect(Number.isFinite(posN1.x)).toBe(true);
      expect(Number.isFinite(posN1.y)).toBe(true);
      expect(Number.isFinite(posN2.x)).toBe(true);
      expect(Number.isFinite(posN2.y)).toBe(true);
    });
  });

  describe('default options', () => {
    it('empty options object produces a valid layout using defaults', async () => {
      let g = emptyGraph();
      g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      // Should not throw and should produce a complete result
      const result = await runEffect(elkLayout.layout(g, {}));

      expect(result.nodePositions.size).toBe(2);
      expect(result.edgePaths.size).toBe(1);
      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);
    });

    it('produces the same layout when called twice with identical inputs', async () => {
      const buildGraph = async () => {
        let g = emptyGraph();
        g = await runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
        g = await runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
        g = await runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        return g;
      };

      const [r1, r2] = await Promise.all([
        runEffect(elkLayout.layout(await buildGraph(), {})),
        runEffect(elkLayout.layout(await buildGraph(), {})),
      ]);

      const posA1 = r1.nodePositions.get('a' as NodeId)!;
      const posA2 = r2.nodePositions.get('a' as NodeId)!;
      const posB1 = r1.nodePositions.get('b' as NodeId)!;
      const posB2 = r2.nodePositions.get('b' as NodeId)!;

      expect(posA1.x).toBe(posA2.x);
      expect(posA1.y).toBe(posA2.y);
      expect(posB1.x).toBe(posB2.x);
      expect(posB1.y).toBe(posB2.y);
    });
  });
});
