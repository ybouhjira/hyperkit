import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { emptyGraph, createNode, createEdge, addNode, addEdge } from '../../graph/operations';
import { dagreLayout } from '../hierarchical/dagre';
import { d3ForceLayout } from '../force/d3-force';

describe('Edge endpoint adjustment integration', () => {
  describe('with dagre layout', () => {
    it('adjusts ellipse node endpoints to ellipse boundaries', () => {
      let g = emptyGraph();
      const n1 = createNode('n1', {}, {
        label: 'Start',
        shape: 'ellipse',
        size: { width: 120, height: 80 },
      });
      const n2 = createNode('n2', {}, {
        label: 'End',
        shape: 'ellipse',
        size: { width: 120, height: 80 },
      });
      const e1 = createEdge('e1', 'n1', 'n2', {});

      g = Effect.runSync(addNode(g, n1));
      g = Effect.runSync(addNode(g, n2));
      g = Effect.runSync(addEdge(g, e1));

      const result = Effect.runSync(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get(e1.id)!;
      const pos1 = result.nodePositions.get(n1.id)!;
      const pos2 = result.nodePositions.get(n2.id)!;

      // Ellipse centers
      const center1 = { x: pos1.x + 60, y: pos1.y + 40 };
      const center2 = { x: pos2.x + 60, y: pos2.y + 40 };

      // Edge should be vertical (TB direction), so endpoints should be on top/bottom of ellipses
      // For vertical edges on ellipses, endpoints should be at ry distance from center
      const ry = 40;

      // Source endpoint should be at bottom of first ellipse
      expect(edgePath.sourceIntersection.x).toBeCloseTo(center1.x, 1);
      expect(edgePath.sourceIntersection.y).toBeCloseTo(center1.y + ry, 1);

      // Target endpoint should be at top of second ellipse
      expect(edgePath.targetIntersection.x).toBeCloseTo(center2.x, 1);
      expect(edgePath.targetIntersection.y).toBeCloseTo(center2.y - ry, 1);
    });

    it('adjusts diamond node endpoints to diamond boundaries', () => {
      let g = emptyGraph();
      const n1 = createNode('n1', {}, {
        label: 'Decision',
        shape: 'diamond',
        size: { width: 150, height: 100 },
      });
      const n2 = createNode('n2', {}, {
        label: 'Action',
        shape: 'rectangle',
        size: { width: 150, height: 60 },
      });
      const e1 = createEdge('e1', 'n1', 'n2', {});

      g = Effect.runSync(addNode(g, n1));
      g = Effect.runSync(addNode(g, n2));
      g = Effect.runSync(addEdge(g, e1));

      const result = Effect.runSync(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get(e1.id)!;
      const pos1 = result.nodePositions.get(n1.id)!;

      // Diamond center
      const center1 = { x: pos1.x + 75, y: pos1.y + 50 };

      // For vertical edge from diamond, endpoint should be at bottom tip
      // Diamond boundary: |dx/halfW| + |dy/halfH| = 1
      // For vertical line (dx=0), endpoint is at center.y + halfH
      expect(edgePath.sourceIntersection.x).toBeCloseTo(center1.x, 1);
      expect(edgePath.sourceIntersection.y).toBeCloseTo(center1.y + 50, 1);
    });

    it('keeps rectangle endpoints on rectangle boundaries', () => {
      let g = emptyGraph();
      const n1 = createNode('n1', {}, {
        label: 'Box 1',
        shape: 'rectangle',
        size: { width: 150, height: 60 },
      });
      const n2 = createNode('n2', {}, {
        label: 'Box 2',
        shape: 'rectangle',
        size: { width: 150, height: 60 },
      });
      const e1 = createEdge('e1', 'n1', 'n2', {});

      g = Effect.runSync(addNode(g, n1));
      g = Effect.runSync(addNode(g, n2));
      g = Effect.runSync(addEdge(g, e1));

      const result = Effect.runSync(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get(e1.id)!;
      const pos1 = result.nodePositions.get(n1.id)!;
      const pos2 = result.nodePositions.get(n2.id)!;

      // Rectangle centers
      const center1 = { x: pos1.x + 75, y: pos1.y + 30 };
      const center2 = { x: pos2.x + 75, y: pos2.y + 30 };

      // For vertical edges on rectangles, endpoints should be at top/bottom edges
      expect(edgePath.sourceIntersection.x).toBeCloseTo(center1.x, 1);
      expect(edgePath.sourceIntersection.y).toBeCloseTo(pos1.y + 60, 1); // bottom edge

      expect(edgePath.targetIntersection.x).toBeCloseTo(center2.x, 1);
      expect(edgePath.targetIntersection.y).toBeCloseTo(pos2.y, 1); // top edge
    });
  });

  describe('with d3-force layout', () => {
    it('adjusts endpoints for mixed shapes', () => {
      let g = emptyGraph();
      const n1 = createNode('n1', {}, {
        shape: 'ellipse',
        size: { width: 100, height: 100 },
      });
      const n2 = createNode('n2', {}, {
        shape: 'diamond',
        size: { width: 100, height: 100 },
      });
      const e1 = createEdge('e1', 'n1', 'n2', {});

      g = Effect.runSync(addNode(g, n1));
      g = Effect.runSync(addNode(g, n2));
      g = Effect.runSync(addEdge(g, e1));

      const result = Effect.runSync(d3ForceLayout.layout(g, { iterations: 100 }));
      const edgePath = result.edgePaths.get(e1.id)!;
      const pos1 = result.nodePositions.get(n1.id)!;
      const pos2 = result.nodePositions.get(n2.id)!;

      // Centers
      const center1 = { x: pos1.x + 50, y: pos1.y + 50 };
      const center2 = { x: pos2.x + 50, y: pos2.y + 50 };

      // Endpoints should NOT be at centers
      const dist1 = Math.hypot(
        edgePath.sourceIntersection.x - center1.x,
        edgePath.sourceIntersection.y - center1.y
      );
      const dist2 = Math.hypot(
        edgePath.targetIntersection.x - center2.x,
        edgePath.targetIntersection.y - center2.y
      );

      // Both should be on the boundary (approximately 35-50 units from center for 100x100 shapes)
      // For ellipse/diamond, the boundary distance varies by angle
      expect(dist1).toBeGreaterThan(20); // Not at center
      expect(dist1).toBeLessThan(60); // On or near boundary
      expect(dist2).toBeGreaterThan(20);
      expect(dist2).toBeLessThan(60);
    });
  });

  describe('edge cases', () => {
    it('handles cylinder shape correctly', () => {
      let g = emptyGraph();
      const n1 = createNode('n1', {}, {
        label: 'Database',
        shape: 'cylinder',
        size: { width: 120, height: 100 },
      });
      const n2 = createNode('n2', {}, {
        label: 'Server',
        shape: 'rectangle',
        size: { width: 120, height: 60 },
      });
      const e1 = createEdge('e1', 'n1', 'n2', {});

      g = Effect.runSync(addNode(g, n1));
      g = Effect.runSync(addNode(g, n2));
      g = Effect.runSync(addEdge(g, e1));

      const result = Effect.runSync(dagreLayout.layout(g, { direction: 'TB' }));
      const edgePath = result.edgePaths.get(e1.id)!;

      // Should produce valid path without errors
      expect(edgePath.d).toBeTruthy();
      expect(edgePath.points.length).toBeGreaterThanOrEqual(2);
      expect(edgePath.sourceIntersection).toBeTruthy();
      expect(edgePath.targetIntersection).toBeTruthy();
    });

    it('handles all built-in shapes without errors', () => {
      const shapes = [
        'rectangle', 'ellipse', 'diamond', 'hexagon', 'cylinder',
        'parallelogram', 'triangle', 'document', 'cloud', 'note', 'star'
      ];

      for (const shape of shapes) {
        let g = emptyGraph();
        const n1 = createNode('n1', {}, { shape, size: { width: 100, height: 100 } });
        const n2 = createNode('n2', {}, { shape: 'rectangle', size: { width: 100, height: 60 } });
        const e1 = createEdge('e1', 'n1', 'n2', {});

        g = Effect.runSync(addNode(g, n1));
        g = Effect.runSync(addNode(g, n2));
        g = Effect.runSync(addEdge(g, e1));

        const result = Effect.runSync(dagreLayout.layout(g, {}));
        const edgePath = result.edgePaths.get(e1.id)!;

        expect(edgePath.d).toBeTruthy();
        expect(edgePath.points.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
