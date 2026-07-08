import { describe, it, expect } from 'vitest';
import { adjustEdgeEndpoints } from '../adjust-endpoints';
import { emptyGraph, createNode, createEdge } from '../../graph/operations';
import { Effect } from 'effect';
import type { Graph, LayoutResult, EdgePath } from '../../graph/types';

describe('adjustEdgeEndpoints', () => {
  it('preserves rectangle node endpoints (boundary = bounding box)', () => {
    // Create a simple graph: rect1 -> rect2
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const node2 = createNode('n2', {}, { position: { x: 200, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 25 L 200 25',
        points: [{ x: 100, y: 25 }, { x: 200, y: 25 }],
        sourceIntersection: { x: 100, y: 25 },
        targetIntersection: { x: 200, y: 25 },
        labelPosition: { x: 150, y: 25 },
      }]]),
      bounds: { x: 0, y: 0, width: 300, height: 50 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);

    // For rectangles, endpoints should stay the same (right edge of n1, left edge of n2)
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;
    expect(adjustedPath.sourceIntersection.x).toBeCloseTo(100, 1);
    expect(adjustedPath.sourceIntersection.y).toBeCloseTo(25, 1);
    expect(adjustedPath.targetIntersection.x).toBeCloseTo(200, 1);
    expect(adjustedPath.targetIntersection.y).toBeCloseTo(25, 1);
  });

  it('adjusts ellipse node endpoints to ellipse boundary', () => {
    // Create graph: ellipse1 -> ellipse2
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const node2 = createNode('n2', {}, { position: { x: 200, y: 0 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 50 L 200 50',
        points: [{ x: 100, y: 50 }, { x: 200, y: 50 }],
        sourceIntersection: { x: 100, y: 50 },
        targetIntersection: { x: 200, y: 50 },
        labelPosition: { x: 150, y: 50 },
      }]]),
      bounds: { x: 0, y: 0, width: 300, height: 100 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Ellipse center: (50, 50) and (250, 50)
    // Horizontal line through center hits ellipse at edges
    // For 100x100 ellipse, rx=50, ry=50, so boundary at x=center±50
    expect(adjustedPath.sourceIntersection.x).toBeCloseTo(50 + 50, 1); // 100
    expect(adjustedPath.sourceIntersection.y).toBeCloseTo(50, 1);
    expect(adjustedPath.targetIntersection.x).toBeCloseTo(250 - 50, 1); // 200
    expect(adjustedPath.targetIntersection.y).toBeCloseTo(50, 1);
  });

  it('adjusts diamond node endpoints to diamond boundary', () => {
    // Create graph: diamond1 -> diamond2
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, shape: 'diamond' });
    const node2 = createNode('n2', {}, { position: { x: 200, y: 0 }, size: { width: 100, height: 100 }, shape: 'diamond' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 50 L 200 50',
        points: [{ x: 100, y: 50 }, { x: 200, y: 50 }],
        sourceIntersection: { x: 100, y: 50 },
        targetIntersection: { x: 200, y: 50 },
        labelPosition: { x: 150, y: 50 },
      }]]),
      bounds: { x: 0, y: 0, width: 300, height: 100 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Diamond center: (50, 50) and (250, 50)
    // Horizontal line through center hits diamond at midpoints of sides
    // For 100x100 diamond, boundary at x=center±50 for horizontal line
    expect(adjustedPath.sourceIntersection.x).toBeCloseTo(100, 1);
    expect(adjustedPath.sourceIntersection.y).toBeCloseTo(50, 1);
    expect(adjustedPath.targetIntersection.x).toBeCloseTo(200, 1);
    expect(adjustedPath.targetIntersection.y).toBeCloseTo(50, 1);
  });

  it('regenerates SVG path d attribute with adjusted points', () => {
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const node2 = createNode('n2', {}, { position: { x: 200, y: 0 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 50 L 200 50',
        points: [{ x: 100, y: 50 }, { x: 200, y: 50 }],
        sourceIntersection: { x: 100, y: 50 },
        targetIntersection: { x: 200, y: 50 },
        labelPosition: { x: 150, y: 50 },
      }]]),
      bounds: { x: 0, y: 0, width: 300, height: 100 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Check that d attribute matches the pattern (straight line for 2 points)
    expect(adjustedPath.d).toMatch(/^M \d+\.?\d* \d+\.?\d* L \d+\.?\d* \d+\.?\d*$/);
    expect(adjustedPath.points.length).toBe(2);
  });

  it('preserves label positions', () => {
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const node2 = createNode('n2', {}, { position: { x: 200, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const originalLabelPos = { x: 150, y: 25 };
    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 25 L 200 25',
        points: [{ x: 100, y: 25 }, { x: 200, y: 25 }],
        sourceIntersection: { x: 100, y: 25 },
        targetIntersection: { x: 200, y: 25 },
        labelPosition: originalLabelPos,
      }]]),
      bounds: { x: 0, y: 0, width: 300, height: 50 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    expect(adjustedPath.labelPosition).toEqual(originalLabelPos);
  });

  it('handles multi-point paths (3+ points)', () => {
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const node2 = createNode('n2', {}, { position: { x: 300, y: 300 }, size: { width: 100, height: 100 }, shape: 'ellipse' });
    const edge = createEdge('e1', 'n1', 'n2', {});

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(Effect.flatMap(
      Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
      (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
    ));

    const layoutResult: LayoutResult = {
      nodePositions: new Map([
        [node1.id, { x: 0, y: 0 }],
        [node2.id, { x: 300, y: 300 }],
      ]),
      edgePaths: new Map([[edge.id, {
        d: 'M 100 100 L 150 150 L 300 300',
        points: [
          { x: 100, y: 100 }, // rect boundary start
          { x: 150, y: 150 }, // intermediate point
          { x: 300, y: 300 }, // rect boundary end
        ],
        sourceIntersection: { x: 100, y: 100 },
        targetIntersection: { x: 300, y: 300 },
        labelPosition: { x: 200, y: 200 },
      }]]),
      bounds: { x: 0, y: 0, width: 400, height: 400 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Should adjust first and last points, keep middle point
    expect(adjustedPath.points.length).toBe(3);
    expect(adjustedPath.points[1]).toEqual({ x: 150, y: 150 }); // middle unchanged

    // First and last should be adjusted to ellipse boundary
    // Direction from (50,50) toward (150,150) - 45 degrees
    const expectedSourceX = 50 + 50 * Math.cos(Math.PI / 4);
    const expectedSourceY = 50 + 50 * Math.sin(Math.PI / 4);
    expect(adjustedPath.points[0]!.x).toBeCloseTo(expectedSourceX, 1);
    expect(adjustedPath.points[0]!.y).toBeCloseTo(expectedSourceY, 1);

    // Direction from (350,350) toward (150,150) - 225 degrees
    const expectedTargetX = 350 + 50 * Math.cos((5 * Math.PI) / 4);
    const expectedTargetY = 350 + 50 * Math.sin((5 * Math.PI) / 4);
    expect(adjustedPath.points[2]!.x).toBeCloseTo(expectedTargetX, 1);
    expect(adjustedPath.points[2]!.y).toBeCloseTo(expectedTargetY, 1);

    // Should regenerate path with quadratic curves (3 points)
    expect(adjustedPath.d).toMatch(/^M .+ Q .+ .+$/);
  });

  it('handles edges with missing nodes gracefully', () => {
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const edge = createEdge('e1', 'n1', 'n2', {}); // n2 doesn't exist

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(
      Effect.succeed({ ...graph, nodes: new Map([[node1.id, node1]]), edges: new Map([[edge.id, edge]]) })
    );

    const originalPath: EdgePath = {
      d: 'M 100 25 L 200 25',
      points: [{ x: 100, y: 25 }, { x: 200, y: 25 }],
      sourceIntersection: { x: 100, y: 25 },
      targetIntersection: { x: 200, y: 25 },
      labelPosition: { x: 150, y: 25 },
    };

    const layoutResult: LayoutResult = {
      nodePositions: new Map([[node1.id, { x: 0, y: 0 }]]),
      edgePaths: new Map([[edge.id, originalPath]]),
      bounds: { x: 0, y: 0, width: 300, height: 50 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Should only adjust source, leave target unchanged
    expect(adjustedPath.sourceIntersection.x).toBeCloseTo(100, 1);
    expect(adjustedPath.targetIntersection).toEqual({ x: 200, y: 25 });
  });

  it('handles single-point paths gracefully', () => {
    const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
    const edge = createEdge('e1', 'n1', 'n1', {}); // self-loop

    let graph = emptyGraph<unknown, unknown>();
    graph = Effect.runSync(
      Effect.succeed({ ...graph, nodes: new Map([[node1.id, node1]]), edges: new Map([[edge.id, edge]]) })
    );

    const originalPath: EdgePath = {
      d: 'M 50 25',
      points: [{ x: 50, y: 25 }],
      sourceIntersection: { x: 50, y: 25 },
      targetIntersection: { x: 50, y: 25 },
    };

    const layoutResult: LayoutResult = {
      nodePositions: new Map([[node1.id, { x: 0, y: 0 }]]),
      edgePaths: new Map([[edge.id, originalPath]]),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const adjusted = adjustEdgeEndpoints(graph, layoutResult);
    const adjustedPath = adjusted.edgePaths.get(edge.id)!;

    // Should leave single-point paths unchanged
    expect(adjustedPath).toEqual(originalPath);
  });

  describe('shape-specific boundary points', () => {
    it('hexagon getBoundaryPoint should hit hexagon edge, not rectangle', () => {
      // Hexagon with inset=w*0.25 has angled edges
      // Test point going diagonally up-right from center
      const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 200, height: 100 }, shape: 'hexagon' });
      const node2 = createNode('n2', {}, { position: { x: 300, y: -100 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
      const edge = createEdge('e1', 'n1', 'n2', {});

      let graph = emptyGraph<unknown, unknown>();
      graph = Effect.runSync(Effect.flatMap(
        Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
        (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
      ));

      // Edge from hexagon center (100, 50) to rect center (350, -75)
      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          [node1.id, { x: 0, y: 0 }],
          [node2.id, { x: 300, y: -100 }],
        ]),
        edgePaths: new Map([[edge.id, {
          d: 'M 200 0 L 300 -75',
          points: [{ x: 200, y: 0 }, { x: 300, y: -75 }],
          sourceIntersection: { x: 200, y: 0 },
          targetIntersection: { x: 300, y: -75 },
          labelPosition: { x: 250, y: -37.5 },
        }]]),
        bounds: { x: 0, y: -100, width: 400, height: 200 },
      };

      const adjusted = adjustEdgeEndpoints(graph, layoutResult);
      const adjustedPath = adjusted.edgePaths.get(edge.id)!;

      // Hexagon boundary should be different from rectangle boundary for diagonal directions
      // The source point should NOT be at (200, 0) which is rectangle's top-right corner
      // It should be somewhere on the angled edge of the hexagon
      expect(adjustedPath.sourceIntersection.x).not.toBeCloseTo(200, 0);
    });

    it('triangle getBoundaryPoint should hit triangle edge, not rectangle', () => {
      // Triangle: top vertex at (cx, y), so upward directions hit earlier than rectangle
      const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, shape: 'triangle' });
      const node2 = createNode('n2', {}, { position: { x: 50, y: -150 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
      const edge = createEdge('e1', 'n1', 'n2', {});

      let graph = emptyGraph<unknown, unknown>();
      graph = Effect.runSync(Effect.flatMap(
        Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
        (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
      ));

      // Edge from triangle center (50, 50) upward to rect center (100, -125)
      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          [node1.id, { x: 0, y: 0 }],
          [node2.id, { x: 50, y: -150 }],
        ]),
        edgePaths: new Map([[edge.id, {
          d: 'M 50 0 L 100 -125',
          points: [{ x: 50, y: 0 }, { x: 100, y: -125 }],
          sourceIntersection: { x: 50, y: 0 },
          targetIntersection: { x: 100, y: -125 },
          labelPosition: { x: 75, y: -62.5 },
        }]]),
        bounds: { x: 0, y: -150, width: 150, height: 250 },
      };

      const adjusted = adjustEdgeEndpoints(graph, layoutResult);
      const adjustedPath = adjusted.edgePaths.get(edge.id)!;

      // Triangle has apex at top-center (50, 0), so going up from center should hit apex
      // For a slight angle up-right, it should hit the right edge of triangle
      // which is INSIDE the rectangle boundary
      expect(adjustedPath.sourceIntersection.y).toBeGreaterThan(0);
    });

    it('parallelogram getBoundaryPoint should hit skewed edge, not rectangle', () => {
      // Parallelogram with skew=w*0.2 has angled sides
      const node1 = createNode('n1', {}, { position: { x: 0, y: 0 }, size: { width: 200, height: 100 }, shape: 'parallelogram' });
      const node2 = createNode('n2', {}, { position: { x: 300, y: 50 }, size: { width: 100, height: 50 }, shape: 'rectangle' });
      const edge = createEdge('e1', 'n1', 'n2', {});

      let graph = emptyGraph<unknown, unknown>();
      graph = Effect.runSync(Effect.flatMap(
        Effect.flatMap(Effect.succeed(graph), (g) => Effect.succeed({ ...g, nodes: new Map([[node1.id, node1]]) })),
        (g) => Effect.succeed({ ...g, nodes: new Map([...g.nodes, [node2.id, node2]]), edges: new Map([[edge.id, edge]]) })
      ));

      // Edge from parallelogram center (100, 50) to rect
      const layoutResult: LayoutResult = {
        nodePositions: new Map([
          [node1.id, { x: 0, y: 0 }],
          [node2.id, { x: 300, y: 50 }],
        ]),
        edgePaths: new Map([[edge.id, {
          d: 'M 200 50 L 300 75',
          points: [{ x: 200, y: 50 }, { x: 300, y: 75 }],
          sourceIntersection: { x: 200, y: 50 },
          targetIntersection: { x: 300, y: 75 },
          labelPosition: { x: 250, y: 62.5 },
        }]]),
        bounds: { x: 0, y: 0, width: 400, height: 100 },
      };

      const adjusted = adjustEdgeEndpoints(graph, layoutResult);
      const adjustedPath = adjusted.edgePaths.get(edge.id)!;

      // Parallelogram has angled right edge due to skew
      // The boundary point should be different from rectangle
      // For horizontal-ish direction, the y coordinate should differ from rectangle
      expect(adjustedPath.sourceIntersection.x).toBeGreaterThan(0);
      expect(adjustedPath.sourceIntersection.x).toBeLessThan(200);
    });
  });
});
