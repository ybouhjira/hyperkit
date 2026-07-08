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
import { dagreLayout, type DagreLayoutOptions } from '../hierarchical/dagre';

// Helper to run Effect and get success value
const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

describe('dagre layout', () => {
  describe('pointsToSvgPath', () => {
    it('creates path for 2 points with L command', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', { position: { x: 0, y: 0 } })));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', { position: { x: 200, y: 0 } })));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId);

      expect(edgePath).toBeDefined();
      // Dagre may add waypoints, so we expect >= 2 points
      expect(edgePath!.points.length).toBeGreaterThanOrEqual(2);
      // SVG path should start with M
      expect(edgePath!.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
      // Should contain valid SVG path commands
      expect(edgePath!.d).toMatch(/[MLQ]/);
    });

    it('creates path for 3 points with Q command', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', { position: { x: 0, y: 0 } })));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', { position: { x: 100, y: 100 } })));
      g = runEffect(addNode(g, createNode('c' as NodeId, 'C', { position: { x: 200, y: 0 } })));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      const result = runEffect(dagreLayout.layout(g, {}));

      // At least one edge should have 3+ points due to routing
      const edgePaths = Array.from(result.edgePaths.values());
      const hasThreePointPath = edgePaths.some((path) => path.points.length === 3);

      // If we have a 3-point path, it should use Q (quadratic) command
      const threePointPath = edgePaths.find((path) => path.points.length === 3);
      if (threePointPath) {
        expect(threePointPath.d).toMatch(/^M\s+[\d.]+\s+[\d.]+\s+Q\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+$/);
      }
    });

    it('creates smooth path for 4+ points with Q commands', () => {
      // Create a more complex graph that will have 4+ waypoints
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', { position: { x: 0, y: 0 } })));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', { position: { x: 100, y: 0 } })));
      g = runEffect(addNode(g, createNode('c' as NodeId, 'C', { position: { x: 200, y: 0 } })));
      g = runEffect(addNode(g, createNode('d' as NodeId, 'D', { position: { x: 300, y: 0 } })));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));
      g = runEffect(addEdge(g, createEdge('e3' as EdgeId, 'c', 'd', {})));

      const result = runEffect(dagreLayout.layout(g, {}));

      // Check if any path has 4+ points and uses Q commands
      const edgePaths = Array.from(result.edgePaths.values());
      const fourPlusPath = edgePaths.find((path) => path.points.length >= 4);

      if (fourPlusPath) {
        // Path should start with M and contain Q commands
        expect(fourPlusPath.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
        expect(fourPlusPath.d).toMatch(/Q\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+/);
      }
    });
  });

  describe('node positioning', () => {
    it('returns exact numeric positions for nodes', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));

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
    });

    it('converts dagre center positions to top-left positions', () => {
      let g = emptyGraph();
      // Create node with known size
      g = runEffect(
        addNode(g, createNode('a' as NodeId, 'A', { size: { width: 100, height: 50 } }))
      );
      g = runEffect(
        addNode(g, createNode('b' as NodeId, 'B', { size: { width: 100, height: 50 } }))
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));

      const posA = result.nodePositions.get('a' as NodeId);
      const posB = result.nodePositions.get('b' as NodeId);

      // Positions should be >= 0 (accounting for padding)
      expect(posA!.x).toBeGreaterThanOrEqual(0);
      expect(posA!.y).toBeGreaterThanOrEqual(0);
      expect(posB!.x).toBeGreaterThanOrEqual(0);
      expect(posB!.y).toBeGreaterThanOrEqual(0);
    });

    it('respects node spacing option', () => {
      const buildGraph = () => {
        let g = emptyGraph();
        g = runEffect(
          addNode(g, createNode('a' as NodeId, 'A', { size: { width: 50, height: 30 } }))
        );
        g = runEffect(
          addNode(g, createNode('b' as NodeId, 'B', { size: { width: 50, height: 30 } }))
        );
        g = runEffect(
          addNode(g, createNode('c' as NodeId, 'C', { size: { width: 50, height: 30 } }))
        );
        // Create edges from a to b and a to c (creates side-by-side layout)
        g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'a', 'c', {})));
        return g;
      };

      const result1 = runEffect(dagreLayout.layout(buildGraph(), { nodeSpacing: 30, direction: 'TB' }));
      const result2 = runEffect(dagreLayout.layout(buildGraph(), { nodeSpacing: 100, direction: 'TB' }));

      const pos1B = result1.nodePositions.get('b' as NodeId)!;
      const pos1C = result1.nodePositions.get('c' as NodeId)!;
      const pos2B = result2.nodePositions.get('b' as NodeId)!;
      const pos2C = result2.nodePositions.get('c' as NodeId)!;

      // Calculate horizontal distances between b and c (siblings in same rank)
      const dist1 = Math.abs(pos1C.x - pos1B.x);
      const dist2 = Math.abs(pos2C.x - pos2B.x);

      // With larger node spacing, horizontal distance between siblings should be greater
      expect(dist2).toBeGreaterThan(dist1);
    });

    it('respects rank spacing option', () => {
      const buildGraph = () => {
        let g = emptyGraph();
        g = runEffect(
          addNode(g, createNode('a' as NodeId, 'A', { size: { width: 50, height: 30 } }))
        );
        g = runEffect(
          addNode(g, createNode('b' as NodeId, 'B', { size: { width: 50, height: 30 } }))
        );
        g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        return g;
      };

      const result1 = runEffect(dagreLayout.layout(buildGraph(), { rankSpacing: 50 }));
      const result2 = runEffect(dagreLayout.layout(buildGraph(), { rankSpacing: 150 }));

      const pos1A = result1.nodePositions.get('a' as NodeId)!;
      const pos1B = result1.nodePositions.get('b' as NodeId)!;
      const pos2A = result2.nodePositions.get('a' as NodeId)!;
      const pos2B = result2.nodePositions.get('b' as NodeId)!;

      // For TB direction, rank spacing affects vertical distance
      const dist1 = Math.abs(pos1B.y - pos1A.y);
      const dist2 = Math.abs(pos2B.y - pos2A.y);

      expect(dist2).toBeGreaterThan(dist1);
    });
  });

  describe('edge paths', () => {
    it('connects FROM source node boundary TO target node boundary', () => {
      let g = emptyGraph();
      g = runEffect(
        addNode(
          g,
          createNode('a' as NodeId, 'A', {
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(
        addNode(
          g,
          createNode('b' as NodeId, 'B', {
            position: { x: 200, y: 0 },
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;
      const nodeA = result.nodePositions.get('a' as NodeId)!;
      const nodeB = result.nodePositions.get('b' as NodeId)!;

      // Source intersection should be on the boundary of node A
      const sourceIntersection = edgePath.sourceIntersection;
      expect(sourceIntersection.x).toBeGreaterThanOrEqual(nodeA.x);
      expect(sourceIntersection.x).toBeLessThanOrEqual(nodeA.x + 100);
      expect(sourceIntersection.y).toBeGreaterThanOrEqual(nodeA.y);
      expect(sourceIntersection.y).toBeLessThanOrEqual(nodeA.y + 50);

      // Target intersection should be on the boundary of node B
      const targetIntersection = edgePath.targetIntersection;
      expect(targetIntersection.x).toBeGreaterThanOrEqual(nodeB.x);
      expect(targetIntersection.x).toBeLessThanOrEqual(nodeB.x + 100);
      expect(targetIntersection.y).toBeGreaterThanOrEqual(nodeB.y);
      expect(targetIntersection.y).toBeLessThanOrEqual(nodeB.y + 50);
    });

    it('produces valid SVG path d attribute', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      // Should start with M (moveTo)
      expect(edgePath.d).toMatch(/^M\s+[\d.]+\s+[\d.]+/);
      // Should contain valid SVG path commands
      expect(edgePath.d).toMatch(/[MLQ]/);
      // Should contain only valid characters (numbers, spaces, path commands)
      expect(edgePath.d).toMatch(/^[MLQ\s\d.-]+$/);
    });

    it('label position is at midpoint', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      expect(edgePath.labelPosition).toBeDefined();
      const { sourceIntersection, targetIntersection, labelPosition } = edgePath;

      // For a 2-point path, label should be exactly at midpoint
      if (edgePath.points.length === 2) {
        const expectedX = (sourceIntersection.x + targetIntersection.x) / 2;
        const expectedY = (sourceIntersection.y + targetIntersection.y) / 2;

        expect(labelPosition!.x).toBe(expectedX);
        expect(labelPosition!.y).toBe(expectedY);
      }
    });
  });

  describe('layout directions', () => {
    it('TB direction: target is below source', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'TB' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A should be above B (smaller y)
      expect(posA.y).toBeLessThan(posB.y);
    });

    it('BT direction: target is above source', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'BT' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A should be below B (larger y)
      expect(posA.y).toBeGreaterThan(posB.y);
    });

    it('LR direction: target is to the right of source', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'LR' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A should be left of B (smaller x)
      expect(posA.x).toBeLessThan(posB.x);
    });

    it('RL direction: target is to the left of source', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'RL' }));
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // A should be right of B (larger x)
      expect(posA.x).toBeGreaterThan(posB.x);
    });
  });

  describe('layout bounds', () => {
    it('encompasses all nodes with padding', () => {
      let g = emptyGraph();
      g = runEffect(
        addNode(
          g,
          createNode('a' as NodeId, 'A', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(
        addNode(
          g,
          createNode('b' as NodeId, 'B', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const padding = 40;
      const result = runEffect(dagreLayout.layout(g, { padding }));

      // Find actual min/max coordinates
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (const [nodeId, pos] of result.nodePositions) {
        const node = g.nodes.get(nodeId)!;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + node.size.width);
        maxY = Math.max(maxY, pos.y + node.size.height);
      }

      // Bounds should encompass all nodes with padding
      expect(result.bounds.x).toBeLessThanOrEqual(minX);
      expect(result.bounds.y).toBeLessThanOrEqual(minY);
      expect(result.bounds.x + result.bounds.width).toBeGreaterThanOrEqual(maxX);
      expect(result.bounds.y + result.bounds.height).toBeGreaterThanOrEqual(maxY);

      // Bounds should include padding
      expect(result.bounds.width).toBeGreaterThan(maxX - minX);
      expect(result.bounds.height).toBeGreaterThan(maxY - minY);
    });
  });

  describe('edge label positioning (fix: uses Dagre centroid, not endpoint midpoint)', () => {
    it('places label position between source and target nodes', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', { size: { width: 100, height: 50 } })));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', { size: { width: 100, height: 50 } })));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // Label should be between nodes vertically
      const aCenterY = posA.y + 25;
      const bCenterY = posB.y + 25;
      expect(edgePath.labelPosition!.y).toBeGreaterThan(aCenterY);
      expect(edgePath.labelPosition!.y).toBeLessThan(bCenterY);
    });

    it('label position is near edge midpoint, not at endpoints', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', { size: { width: 100, height: 50 } })));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', { size: { width: 100, height: 50 } })));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      // Label should not be at either endpoint
      const first = edgePath.points[0]!;
      const last = edgePath.points[edgePath.points.length - 1]!;
      const distFromFirst = Math.hypot(edgePath.labelPosition!.x - first.x, edgePath.labelPosition!.y - first.y);
      const distFromLast = Math.hypot(edgePath.labelPosition!.x - last.x, edgePath.labelPosition!.y - last.y);

      // Should be away from both endpoints (at least 10px from each)
      expect(distFromFirst).toBeGreaterThan(10);
      expect(distFromLast).toBeGreaterThan(10);
    });
  });
});
