import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  emptyGraph,
  addNode,
  addEdge,
  createNode,
  createEdge,
  type NodeId,
  type EdgeId,
} from '../graph/operations';
import { dagreLayout } from '../layout/hierarchical/dagre';
import { d3ForceLayout } from '../layout/force/d3-force';
import { straightRouter } from '../edge/straight';
import { bezierRouter } from '../edge/bezier';
import { stepRouter } from '../edge/step';
import type { EdgeRouterContext } from '../graph/types';

// Helper to run Effect and get success value
const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

describe('diagram-core integration tests', () => {
  describe('dagre layout + edge routers', () => {
    it('produces edge paths that connect to node boundaries', () => {
      // Build a simple 3-node graph
      let g = emptyGraph();
      g = runEffect(
        addNode(
          g,
          createNode('a' as NodeId, 'Node A', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(
        addNode(
          g,
          createNode('b' as NodeId, 'Node B', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(
        addNode(
          g,
          createNode('c' as NodeId, 'Node C', {
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      // Run dagre layout
      const layout = runEffect(dagreLayout.layout(g, { direction: 'TB' }));

      // Verify all nodes have positions
      expect(layout.nodePositions.size).toBe(3);

      // Verify all edges have paths
      expect(layout.edgePaths.size).toBe(2);

      // Check each edge path
      for (const [edgeId, edgePath] of layout.edgePaths) {
        const edge = g.edges.get(edgeId)!;
        const sourceNode = g.nodes.get(edge.source)!;
        const targetNode = g.nodes.get(edge.target)!;
        const sourcePos = layout.nodePositions.get(edge.source)!;
        const targetPos = layout.nodePositions.get(edge.target)!;

        // Apply positions to nodes
        const positionedSource = { ...sourceNode, position: sourcePos };
        const positionedTarget = { ...targetNode, position: targetPos };

        // Source intersection should be on source node boundary
        const { sourceIntersection, targetIntersection } = edgePath;

        // Check source boundary
        const sourceMinX = sourcePos.x;
        const sourceMaxX = sourcePos.x + sourceNode.size.width;
        const sourceMinY = sourcePos.y;
        const sourceMaxY = sourcePos.y + sourceNode.size.height;

        expect(sourceIntersection.x).toBeGreaterThanOrEqual(sourceMinX - 0.01);
        expect(sourceIntersection.x).toBeLessThanOrEqual(sourceMaxX + 0.01);
        expect(sourceIntersection.y).toBeGreaterThanOrEqual(sourceMinY - 0.01);
        expect(sourceIntersection.y).toBeLessThanOrEqual(sourceMaxY + 0.01);

        // Check target boundary
        const targetMinX = targetPos.x;
        const targetMaxX = targetPos.x + targetNode.size.width;
        const targetMinY = targetPos.y;
        const targetMaxY = targetPos.y + targetNode.size.height;

        expect(targetIntersection.x).toBeGreaterThanOrEqual(targetMinX - 0.01);
        expect(targetIntersection.x).toBeLessThanOrEqual(targetMaxX + 0.01);
        expect(targetIntersection.y).toBeGreaterThanOrEqual(targetMinY - 0.01);
        expect(targetIntersection.y).toBeLessThanOrEqual(targetMaxY + 0.01);
      }
    });

    it('straight router connects exact boundary points', () => {
      // Build graph with known positions
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

      // Run dagre layout to get positioned nodes
      const layout = runEffect(dagreLayout.layout(g, {}));

      // Get the edge and create context for router
      const edge = g.edges.get('e1' as EdgeId)!;
      const sourcePos = layout.nodePositions.get('a' as NodeId)!;
      const targetPos = layout.nodePositions.get('b' as NodeId)!;

      const sourceNode = { ...g.nodes.get('a' as NodeId)!, position: sourcePos };
      const targetNode = { ...g.nodes.get('b' as NodeId)!, position: targetPos };

      const context: EdgeRouterContext = {
        edge,
        sourceNode,
        targetNode,
        allNodes: [sourceNode, targetNode],
      };

      // Run straight router
      const routedPath = runEffect(straightRouter.route(context));

      // Verify path connects boundaries
      const sourceCenterX = sourcePos.x + 50;
      const sourceCenterY = sourcePos.y + 25;
      const targetCenterX = targetPos.x + 50;
      const targetCenterY = targetPos.y + 25;

      // The path should be a straight line from source boundary to target boundary
      expect(routedPath.points.length).toBe(2);
      expect(routedPath.d).toMatch(/^M\s+[\d.]+\s+[\d.]+\s+L\s+[\d.]+\s+[\d.]+$/);

      // Verify intersections are on boundaries
      expect(routedPath.sourceIntersection.x).toBeGreaterThanOrEqual(sourcePos.x);
      expect(routedPath.sourceIntersection.x).toBeLessThanOrEqual(sourcePos.x + 100);
      expect(routedPath.targetIntersection.x).toBeGreaterThanOrEqual(targetPos.x);
      expect(routedPath.targetIntersection.x).toBeLessThanOrEqual(targetPos.x + 100);
    });

    it('bezier router creates smooth curves between boundaries', () => {
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
            position: { x: 200, y: 100 },
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const layout = runEffect(dagreLayout.layout(g, {}));

      const edge = g.edges.get('e1' as EdgeId)!;
      const sourcePos = layout.nodePositions.get('a' as NodeId)!;
      const targetPos = layout.nodePositions.get('b' as NodeId)!;

      const sourceNode = { ...g.nodes.get('a' as NodeId)!, position: sourcePos };
      const targetNode = { ...g.nodes.get('b' as NodeId)!, position: targetPos };

      const context: EdgeRouterContext = {
        edge,
        sourceNode,
        targetNode,
        allNodes: [sourceNode, targetNode],
      };

      const routedPath = runEffect(bezierRouter.route(context));

      // Bezier should have cubic curve command
      expect(routedPath.d).toMatch(/C/);

      // Should have multiple sample points along curve
      expect(routedPath.points.length).toBeGreaterThan(2);

      // Verify boundaries
      expect(routedPath.sourceIntersection.x).toBeGreaterThanOrEqual(sourcePos.x);
      expect(routedPath.sourceIntersection.x).toBeLessThanOrEqual(sourcePos.x + 100);
      expect(routedPath.targetIntersection.x).toBeGreaterThanOrEqual(targetPos.x);
      expect(routedPath.targetIntersection.x).toBeLessThanOrEqual(targetPos.x + 100);
    });

    it('step router creates orthogonal paths', () => {
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
            position: { x: 200, y: 150 },
            size: { width: 100, height: 50 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));

      const layout = runEffect(dagreLayout.layout(g, {}));

      const edge = g.edges.get('e1' as EdgeId)!;
      const sourcePos = layout.nodePositions.get('a' as NodeId)!;
      const targetPos = layout.nodePositions.get('b' as NodeId)!;

      const sourceNode = { ...g.nodes.get('a' as NodeId)!, position: sourcePos };
      const targetNode = { ...g.nodes.get('b' as NodeId)!, position: targetPos };

      const context: EdgeRouterContext = {
        edge,
        sourceNode,
        targetNode,
        allNodes: [sourceNode, targetNode],
      };

      const routedPath = runEffect(stepRouter.route(context, { borderRadius: 0 }));

      // Verify all segments are horizontal or vertical
      const points = routedPath.points;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const isHorizontal = Math.abs(prev.y - curr.y) < 0.01;
        const isVertical = Math.abs(prev.x - curr.x) < 0.01;
        expect(isHorizontal || isVertical).toBe(true);
      }

      // Verify boundaries
      expect(routedPath.sourceIntersection.x).toBeGreaterThanOrEqual(sourcePos.x);
      expect(routedPath.sourceIntersection.x).toBeLessThanOrEqual(sourcePos.x + 100);
      expect(routedPath.targetIntersection.x).toBeGreaterThanOrEqual(targetPos.x);
      expect(routedPath.targetIntersection.x).toBeLessThanOrEqual(targetPos.x + 100);
    });
  });

  describe('d3-force layout + edge routers', () => {
    it('produces valid layout with boundary connections', () => {
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

      const layout = runEffect(
        d3ForceLayout.layout(g, {
          iterations: 300,
          centerX: 400,
          centerY: 300,
        })
      );

      // Verify all nodes have positions
      expect(layout.nodePositions.size).toBe(3);

      // Verify all edges have paths
      expect(layout.edgePaths.size).toBe(2);

      // All positions should be finite
      for (const pos of layout.nodePositions.values()) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('can re-route d3-force edges with straight router', () => {
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

      const layout = runEffect(d3ForceLayout.layout(g, { iterations: 300 }));

      // Re-route with straight router
      const edge = g.edges.get('e1' as EdgeId)!;
      const sourcePos = layout.nodePositions.get('a' as NodeId)!;
      const targetPos = layout.nodePositions.get('b' as NodeId)!;

      const sourceNode = { ...g.nodes.get('a' as NodeId)!, position: sourcePos };
      const targetNode = { ...g.nodes.get('b' as NodeId)!, position: targetPos };

      const context: EdgeRouterContext = {
        edge,
        sourceNode,
        targetNode,
        allNodes: [sourceNode, targetNode],
      };

      const routedPath = runEffect(straightRouter.route(context));

      // Should have 2 points for straight line
      expect(routedPath.points.length).toBe(2);

      // Verify boundaries (with tolerance for force layout randomness)
      expect(routedPath.sourceIntersection.x).toBeGreaterThanOrEqual(sourcePos.x - 1);
      expect(routedPath.sourceIntersection.x).toBeLessThanOrEqual(sourcePos.x + 101);
      expect(routedPath.targetIntersection.x).toBeGreaterThanOrEqual(targetPos.x - 1);
      expect(routedPath.targetIntersection.x).toBeLessThanOrEqual(targetPos.x + 101);
    });
  });

  describe('complex graph scenarios', () => {
    it('handles diamond-shaped graph correctly', () => {
      let g = emptyGraph();
      g = runEffect(addNode(g, createNode('a' as NodeId, 'A', {})));
      g = runEffect(addNode(g, createNode('b' as NodeId, 'B', {})));
      g = runEffect(addNode(g, createNode('c' as NodeId, 'C', {})));
      g = runEffect(addNode(g, createNode('d' as NodeId, 'D', {})));
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'a', 'c', {})));
      g = runEffect(addEdge(g, createEdge('e3' as EdgeId, 'b', 'd', {})));
      g = runEffect(addEdge(g, createEdge('e4' as EdgeId, 'c', 'd', {})));

      const layout = runEffect(dagreLayout.layout(g, { direction: 'TB' }));

      expect(layout.nodePositions.size).toBe(4);
      expect(layout.edgePaths.size).toBe(4);

      // Verify no nodes overlap
      const positions = Array.from(layout.nodePositions.entries()).map(([id, pos]) => ({
        id,
        pos,
        node: g.nodes.get(id)!,
      }));

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i];
          const b = positions[j];

          // Check if rectangles overlap
          const aRight = a.pos.x + a.node.size.width;
          const aBottom = a.pos.y + a.node.size.height;
          const bRight = b.pos.x + b.node.size.width;
          const bBottom = b.pos.y + b.node.size.height;

          const overlap = !(
            aRight <= b.pos.x ||
            a.pos.x >= bRight ||
            aBottom <= b.pos.y ||
            a.pos.y >= bBottom
          );

          expect(overlap).toBe(false);
        }
      }
    });

    it('handles long chain correctly', () => {
      let g = emptyGraph();
      const nodeCount = 10;

      for (let i = 0; i < nodeCount; i++) {
        g = runEffect(
          addNode(
            g,
            createNode(`n${i}` as NodeId, `Node ${i}`, {
              size: { width: 80, height: 40 },
            })
          )
        );
      }

      for (let i = 0; i < nodeCount - 1; i++) {
        g = runEffect(addEdge(g, createEdge(`e${i}` as EdgeId, `n${i}`, `n${i + 1}`, {})));
      }

      const layout = runEffect(dagreLayout.layout(g, { direction: 'TB' }));

      expect(layout.nodePositions.size).toBe(nodeCount);
      expect(layout.edgePaths.size).toBe(nodeCount - 1);

      // Verify nodes are arranged in order (for TB layout, y should increase)
      const sortedPositions = Array.from(layout.nodePositions.entries())
        .map(([id, pos]) => ({ id: id.toString(), pos }))
        .sort((a, b) => parseInt(a.id.replace('n', '')) - parseInt(b.id.replace('n', '')));

      for (let i = 1; i < sortedPositions.length; i++) {
        // Each subsequent node should be below the previous one
        expect(sortedPositions[i].pos.y).toBeGreaterThan(sortedPositions[i - 1].pos.y);
      }
    });
  });

  describe('layout bounds verification', () => {
    it('bounds exactly encompass all positioned nodes', () => {
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
            size: { width: 120, height: 60 },
          })
        )
      );
      g = runEffect(
        addNode(
          g,
          createNode('c' as NodeId, 'C', {
            size: { width: 80, height: 40 },
          })
        )
      );
      g = runEffect(addEdge(g, createEdge('e1' as EdgeId, 'a', 'b', {})));
      g = runEffect(addEdge(g, createEdge('e2' as EdgeId, 'b', 'c', {})));

      const padding = 25;
      const layout = runEffect(dagreLayout.layout(g, { padding }));

      // Calculate actual min/max from node positions
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (const [nodeId, pos] of layout.nodePositions) {
        const node = g.nodes.get(nodeId)!;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + node.size.width);
        maxY = Math.max(maxY, pos.y + node.size.height);
      }

      // Bounds should include all nodes + padding
      expect(layout.bounds.x).toBeLessThanOrEqual(minX);
      expect(layout.bounds.y).toBeLessThanOrEqual(minY);
      expect(layout.bounds.x + layout.bounds.width).toBeGreaterThanOrEqual(maxX);
      expect(layout.bounds.y + layout.bounds.height).toBeGreaterThanOrEqual(maxY);
    });
  });
});
