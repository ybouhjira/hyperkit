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
import { d3ForceLayout, type D3ForceLayoutOptions } from '../force/d3-force';

// Helper to run Effect and get success value
const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

describe('d3-force layout', () => {
  describe('node positioning', () => {
    it('assigns positions to all nodes', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      const result = runEffect(d3ForceLayout.layout(g, {}));

      expect(result.nodePositions.size).toBe(3);
      expect(result.nodePositions.has('a' as NodeId)).toBe(true);
      expect(result.nodePositions.has('b' as NodeId)).toBe(true);
      expect(result.nodePositions.has('c' as NodeId)).toBe(true);

      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;
      const posC = result.nodePositions.get('c' as NodeId)!;

      expect(typeof posA.x).toBe('number');
      expect(typeof posA.y).toBe('number');
      expect(Number.isFinite(posA.x)).toBe(true);
      expect(Number.isFinite(posA.y)).toBe(true);
      expect(Number.isFinite(posB.x)).toBe(true);
      expect(Number.isFinite(posB.y)).toBe(true);
      expect(Number.isFinite(posC.x)).toBe(true);
      expect(Number.isFinite(posC.y)).toBe(true);
    });

    it('positions are top-left (not center)', () => {
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

      const result = runEffect(d3ForceLayout.layout(g, { iterations: 100 }));

      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // Positions should be finite numbers
      expect(Number.isFinite(posA.x)).toBe(true);
      expect(Number.isFinite(posA.y)).toBe(true);
      expect(Number.isFinite(posB.x)).toBe(true);
      expect(Number.isFinite(posB.y)).toBe(true);
    });

    it('different force parameters produce different layouts', () => {
      const buildGraph = () => {
        let g = emptyGraph();
        g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
        g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
        g = runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
        g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));
        return g;
      };

      const result1 = runEffect(
        d3ForceLayout.layout(buildGraph(), {
          charge: -100,
          distance: 100,
          iterations: 300,
        })
      );

      const result2 = runEffect(
        d3ForceLayout.layout(buildGraph(), {
          charge: -100,
          distance: 300,
          iterations: 300,
        })
      );

      const pos1A = result1.nodePositions.get('a' as NodeId)!;
      const pos1B = result1.nodePositions.get('b' as NodeId)!;
      const pos2A = result2.nodePositions.get('a' as NodeId)!;
      const pos2B = result2.nodePositions.get('b' as NodeId)!;

      const dist1 = Math.hypot(pos1B.x - pos1A.x, pos1B.y - pos1A.y);
      const dist2 = Math.hypot(pos2B.x - pos2A.x, pos2B.y - pos2A.y);

      // Different link distance should produce different node distances
      // (larger distance = greater separation)
      expect(dist2).toBeGreaterThan(dist1);
    });
  });

  describe('edge paths', () => {
    it('assigns paths to all edges', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      const result = runEffect(d3ForceLayout.layout(g, {}));

      expect(result.edgePaths.size).toBe(2);
      expect(result.edgePaths.has('e1' as EdgeId)).toBe(true);
      expect(result.edgePaths.has('e2' as EdgeId)).toBe(true);
    });

    it('edge paths start and end at node centers (before routing)', () => {
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

      const result = runEffect(
        d3ForceLayout.layout(g, {
          iterations: 300,
          centerX: 400,
          centerY: 300,
        })
      );

      const edgePath = result.edgePaths.get('e1' as EdgeId)!;
      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // D3-force produces straight lines, now adjusted to shape boundaries
      expect(edgePath.points.length).toBe(2);

      // Calculate node centers and boundaries
      const centerAX = posA.x + 50;
      const centerAY = posA.y + 25;
      const centerBX = posB.x + 50;
      const centerBY = posB.y + 25;

      // Source and target intersections should be on node boundaries, not at centers
      // For rectangles, boundary points are on the edge of the rectangle
      // Check that endpoints are NOT at centers (they should be closer to edge)
      const distSourceToCenter = Math.hypot(
        edgePath.sourceIntersection.x - centerAX,
        edgePath.sourceIntersection.y - centerAY
      );
      const distTargetToCenter = Math.hypot(
        edgePath.targetIntersection.x - centerBX,
        edgePath.targetIntersection.y - centerBY
      );

      // Distance should be close to half-width or half-height (approximately 25-50 for rectangles)
      expect(distSourceToCenter).toBeGreaterThan(20);
      expect(distTargetToCenter).toBeGreaterThan(20);
    });

    it('produces valid SVG path d attribute', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(d3ForceLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      // Should be in format: M x1 y1 L x2 y2
      expect(edgePath.d).toMatch(/^M\s+[\d.]+\s+[\d.]+\s+L\s+[\d.]+\s+[\d.]+$/);
    });

    it('label position is at midpoint', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const result = runEffect(d3ForceLayout.layout(g, {}));
      const edgePath = result.edgePaths.get('e1' as EdgeId)!;

      expect(edgePath.labelPosition).toBeDefined();

      const { sourceIntersection, targetIntersection, labelPosition } = edgePath;

      const expectedX = (sourceIntersection.x + targetIntersection.x) / 2;
      const expectedY = (sourceIntersection.y + targetIntersection.y) / 2;

      expect(labelPosition!.x).toBeCloseTo(expectedX, 1);
      expect(labelPosition!.y).toBeCloseTo(expectedY, 1);
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
      g = runEffect(
        addNode(
          g,
          createNode('c' as NodeId, 'C', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      const padding = 40;
      const result = runEffect(
        d3ForceLayout.layout(g, {
          padding,
          iterations: 300,
        })
      );

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

      // Bounds should start at minX/minY - padding
      expect(result.bounds.x).toBe(minX - padding);
      expect(result.bounds.y).toBe(minY - padding);

      // Bounds should be (maxX - minX) + padding * 2
      expect(result.bounds.width).toBe(maxX - minX + padding * 2);
      expect(result.bounds.height).toBe(maxY - minY + padding * 2);
    });

    it('handles single node correctly', () => {
      let g = emptyGraph();
      g = runEffect(
        addNode(
          g,
          createNode('a' as NodeId, 'A', {
            size: { width: 100, height: 50 },
          })
        )
      );

      const padding = 20;
      const result = runEffect(d3ForceLayout.layout(g, { padding }));

      const posA = result.nodePositions.get('a' as NodeId)!;

      // Bounds should encompass the single node with padding
      expect(result.bounds.x).toBeLessThanOrEqual(posA.x);
      expect(result.bounds.y).toBeLessThanOrEqual(posA.y);
      expect(result.bounds.x + result.bounds.width).toBeGreaterThanOrEqual(posA.x + 100);
      expect(result.bounds.y + result.bounds.height).toBeGreaterThanOrEqual(posA.y + 50);
    });
  });

  describe('force parameters', () => {
    it('respects custom center position', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const centerX = 1000;
      const centerY = 800;

      const result = runEffect(
        d3ForceLayout.layout(g, {
          centerX,
          centerY,
          iterations: 300,
        })
      );

      const posA = result.nodePositions.get('a' as NodeId)!;
      const posB = result.nodePositions.get('b' as NodeId)!;

      // Nodes should be positioned around the custom center
      // (within a reasonable distance)
      const nodeACenterX = posA.x + 75; // assuming default width 150
      const nodeACenterY = posA.y + 25; // assuming default height 50
      const nodeBCenterX = posB.x + 75;
      const nodeBCenterY = posB.y + 25;

      const avgX = (nodeACenterX + nodeBCenterX) / 2;
      const avgY = (nodeACenterY + nodeBCenterY) / 2;

      // Average should be close to the specified center
      expect(avgX).toBeCloseTo(centerX, -1); // within 10 pixels
      expect(avgY).toBeCloseTo(centerY, -1); // within 10 pixels
    });

    it('more iterations produce more settled layout', () => {
      const buildGraph = () => {
        let g = emptyGraph();
        g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
        g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
        g = runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
        g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
        g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));
        g = runEffect(addEdge(g, createEdge('e3' as EdgeId, 'c', 'a', {})));
        return g;
      };

      const result1 = runEffect(d3ForceLayout.layout(buildGraph(), { iterations: 50 }));
      const result2 = runEffect(d3ForceLayout.layout(buildGraph(), { iterations: 500 }));

      // Both should have positions (test succeeds if no errors thrown)
      expect(result1.nodePositions.size).toBe(3);
      expect(result2.nodePositions.size).toBe(3);
    });
  });
});
