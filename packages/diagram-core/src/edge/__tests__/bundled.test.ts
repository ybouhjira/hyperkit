import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { NodeId, EdgeId, PortId } from '../../graph/types';
import type { Node, EdgeRouterContext, Port } from '../../graph/types';
import { bezierRouter } from '../bezier';
import { bundledRouter, computeEdgeBundles } from '../bundled';

// Helper to run Effect and get success value
const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

// Helper to create a test node
const createTestNode = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: string = 'rectangle'
): Node => ({
  id: NodeId(id),
  data: {},
  position: { x, y },
  size: { width, height },
  ports: [],
  shape,
  style: {},
});

// Helper to create a basic edge context
const createContext = (
  sourceNode: Node,
  targetNode: Node,
  overrides?: Partial<EdgeRouterContext>
): EdgeRouterContext => ({
  edge: {
    id: EdgeId('e1'),
    source: sourceNode.id,
    target: targetNode.id,
    data: {},
    sourceArrow: { type: 'none' },
    targetArrow: { type: 'triangle' },
    style: {},
  },
  sourceNode,
  targetNode,
  allNodes: [sourceNode, targetNode],
  ...overrides,
});

// ─── Bezier Improvements ────────────────────────────────────────────────────

describe('bezier router — port-aware routing', () => {
  it('source with south port → control point goes downward from source', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 200, 100, 50);

    const southPort: Port = {
      id: PortId('p1'),
      direction: 'south',
      offset: 0.5,
    };

    const context: EdgeRouterContext = {
      ...createContext(sourceNode, targetNode),
      sourcePort: southPort,
    };

    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    // Parse the first control point from the path
    const matches = result.d.match(/C\s+([\d.-]+)\s+([\d.-]+)/);
    expect(matches).toBeTruthy();

    const cp1x = parseFloat(matches![1]);
    const cp1y = parseFloat(matches![2]);

    // With south port, control point should be BELOW the source intersection
    // (higher Y value = lower on screen)
    expect(cp1y).toBeGreaterThan(result.sourceIntersection.y);
    // X stays the same as source intersection (pure south tangent)
    expect(cp1x).toBeCloseTo(result.sourceIntersection.x, 0);
  });

  it('source with east port → control point goes to the right of source', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 100, 100, 50);

    const eastPort: Port = {
      id: PortId('p1'),
      direction: 'east',
      offset: 0.5,
    };

    const context: EdgeRouterContext = {
      ...createContext(sourceNode, targetNode),
      sourcePort: eastPort,
    };

    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    const matches = result.d.match(/C\s+([\d.-]+)\s+([\d.-]+)/);
    expect(matches).toBeTruthy();

    const cp1x = parseFloat(matches![1]);
    const cp1y = parseFloat(matches![2]);

    // East port: control point should be to the right (higher X)
    expect(cp1x).toBeGreaterThan(result.sourceIntersection.x);
    // Y stays the same as source intersection
    expect(cp1y).toBeCloseTo(result.sourceIntersection.y, 0);
  });

  it('target with north port → control point approaches from above', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 200, 100, 50);

    const northPort: Port = {
      id: PortId('p2'),
      direction: 'north',
      offset: 0.5,
    };

    const context: EdgeRouterContext = {
      ...createContext(sourceNode, targetNode),
      targetPort: northPort,
    };

    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    // Parse both control points
    const matches = result.d.match(
      /C\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/
    );
    expect(matches).toBeTruthy();

    const cp2x = parseFloat(matches![3]);
    const cp2y = parseFloat(matches![4]);

    // North port: control point should be ABOVE the target intersection (smaller Y)
    expect(cp2y).toBeLessThan(result.targetIntersection.y);
    // X stays the same as target intersection
    expect(cp2x).toBeCloseTo(result.targetIntersection.x, 0);
  });
});

describe('bezier router — parallel edges', () => {
  it('two parallel edges with different edgeIndex produce different paths', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);

    const result0 = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 0, totalParallelEdges: 2, parallelSpacing: 15 })
    );
    const result1 = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 1, totalParallelEdges: 2, parallelSpacing: 15 })
    );

    // Paths must be different
    expect(result0.d).not.toBe(result1.d);

    // Label positions should differ too (they trace different curves)
    expect(result0.labelPosition!.y).not.toBeCloseTo(result1.labelPosition!.y, 0);
  });

  it('single edge (totalParallelEdges=1) matches plain bezier output', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);

    const resultPlain = runEffect(bezierRouter.route(context, { curvature: 0.5 }));
    const resultSingle = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 0, totalParallelEdges: 1 })
    );

    expect(resultSingle.d).toBe(resultPlain.d);
  });

  it('middle edge in bundle of 3 is closest to the center line', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);

    const result0 = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 0, totalParallelEdges: 3, parallelSpacing: 20 })
    );
    const result1 = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 1, totalParallelEdges: 3, parallelSpacing: 20 })
    );
    const result2 = runEffect(
      bezierRouter.route(context, { curvature: 0.5, edgeIndex: 2, totalParallelEdges: 3, parallelSpacing: 20 })
    );

    // For horizontal connection (dy=0), perp = (0, -1) so offset is in Y direction
    // Middle edge (index=1) offset = (1 - 1) * 20 = 0 → same Y as plain bezier
    // Edge 0: offset = (0 - 1) * 20 = -20 → shifted up
    // Edge 2: offset = (2 - 1) * 20 = +20 → shifted down

    const plain = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    expect(result1.labelPosition!.y).toBeCloseTo(plain.labelPosition!.y, 1);
    expect(Math.abs(result0.labelPosition!.y - plain.labelPosition!.y)).toBeGreaterThan(5);
    expect(Math.abs(result2.labelPosition!.y - plain.labelPosition!.y)).toBeGreaterThan(5);
  });
});

describe('bezier router — angle-based blending', () => {
  it('diagonal connection produces smoothly curved path (not axis-aligned control points)', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 300, 100, 50);

    const context = createContext(sourceNode, targetNode);
    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    // Extract control points from path
    const matches = result.d.match(
      /C\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/
    );
    expect(matches).toBeTruthy();

    const cp1x = parseFloat(matches![1]);
    const cp1y = parseFloat(matches![2]);

    // With angle-based blending, both x AND y of cp1 should differ from source intersection
    // (purely axis-aligned would have one of them match exactly)
    const dxFromSource = Math.abs(cp1x - result.sourceIntersection.x);
    const dyFromSource = Math.abs(cp1y - result.sourceIntersection.y);

    // Both components should be non-trivially offset (diagonal tangent)
    expect(dxFromSource).toBeGreaterThan(5);
    expect(dyFromSource).toBeGreaterThan(5);
  });

  it('horizontal connection control points have zero Y offset from endpoints', () => {
    // Purely horizontal: atan2(0, dx) = 0, so sin=0 → cp1.y = sourceIntersection.y
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);
    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    const matches = result.d.match(
      /C\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/
    );
    expect(matches).toBeTruthy();

    const cp1y = parseFloat(matches![2]);
    const cp2y = parseFloat(matches![4]);

    expect(cp1y).toBeCloseTo(result.sourceIntersection.y, 1);
    expect(cp2y).toBeCloseTo(result.targetIntersection.y, 1);
  });

  it('curvature parameter still scales offset correctly', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);

    const low = runEffect(bezierRouter.route(context, { curvature: 0.2 }));
    const high = runEffect(bezierRouter.route(context, { curvature: 0.8 }));

    const matchLow = low.d.match(/C\s+([\d.-]+)/);
    const matchHigh = high.d.match(/C\s+([\d.-]+)/);
    expect(matchLow).toBeTruthy();
    expect(matchHigh).toBeTruthy();

    const cp1xLow = parseFloat(matchLow![1]);
    const cp1xHigh = parseFloat(matchHigh![1]);

    expect(Math.abs(cp1xHigh - low.sourceIntersection.x)).toBeGreaterThan(
      Math.abs(cp1xLow - low.sourceIntersection.x)
    );
  });
});

// ─── Bundled Router ──────────────────────────────────────────────────────────

describe('bundled router', () => {
  it('single edge (no bundle metadata) returns same result as plain bezier', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context = createContext(sourceNode, targetNode);
    const bezierResult = runEffect(bezierRouter.route(context, { curvature: 0.5 }));
    const bundledResult = runEffect(bundledRouter.route(context, { curvature: 0.5 }));

    // No bundle metadata → falls through to plain bezier
    expect(bundledResult.d).toBe(bezierResult.d);
  });

  it('bundle of 3 edges: each has distinct path', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const makeContext = (bundleIndex: number): EdgeRouterContext => ({
      ...createContext(sourceNode, targetNode),
      edge: {
        id: EdgeId(`e${bundleIndex}`),
        source: sourceNode.id,
        target: targetNode.id,
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
        metadata: { bundleIndex, bundleSize: 3 },
      },
    });

    const r0 = runEffect(bundledRouter.route(makeContext(0), { bundleSpacing: 20 }));
    const r1 = runEffect(bundledRouter.route(makeContext(1), { bundleSpacing: 20 }));
    const r2 = runEffect(bundledRouter.route(makeContext(2), { bundleSpacing: 20 }));

    expect(r0.d).not.toBe(r1.d);
    expect(r1.d).not.toBe(r2.d);
    expect(r0.d).not.toBe(r2.d);
  });

  it('bundle of 3 edges: middle edge (index 1) is closest to straight line', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const makeContext = (bundleIndex: number): EdgeRouterContext => ({
      ...createContext(sourceNode, targetNode),
      edge: {
        id: EdgeId(`e${bundleIndex}`),
        source: sourceNode.id,
        target: targetNode.id,
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
        metadata: { bundleIndex, bundleSize: 3 },
      },
    });

    const r0 = runEffect(bundledRouter.route(makeContext(0), { bundleSpacing: 20 }));
    const r1 = runEffect(bundledRouter.route(makeContext(1), { bundleSpacing: 20 }));
    const r2 = runEffect(bundledRouter.route(makeContext(2), { bundleSpacing: 20 }));

    // Midpoint Y — the middle bundle edge should be closest to the straight center Y
    const centerY = (sourceNode.position.y + sourceNode.size.height / 2);
    const dev0 = Math.abs(r0.labelPosition!.y - centerY);
    const dev1 = Math.abs(r1.labelPosition!.y - centerY);
    const dev2 = Math.abs(r2.labelPosition!.y - centerY);

    expect(dev1).toBeLessThan(dev0);
    expect(dev1).toBeLessThan(dev2);
  });

  it('bundleSpacing option affects spread between parallel edges', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const makeContext = (bundleIndex: number): EdgeRouterContext => ({
      ...createContext(sourceNode, targetNode),
      edge: {
        id: EdgeId(`e${bundleIndex}`),
        source: sourceNode.id,
        target: targetNode.id,
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
        metadata: { bundleIndex, bundleSize: 2 },
      },
    });

    const narrowR0 = runEffect(bundledRouter.route(makeContext(0), { bundleSpacing: 5 }));
    const narrowR1 = runEffect(bundledRouter.route(makeContext(1), { bundleSpacing: 5 }));
    const wideR0 = runEffect(bundledRouter.route(makeContext(0), { bundleSpacing: 40 }));
    const wideR1 = runEffect(bundledRouter.route(makeContext(1), { bundleSpacing: 40 }));

    const narrowSpread = Math.abs(narrowR0.labelPosition!.y - narrowR1.labelPosition!.y);
    const wideSpread = Math.abs(wideR0.labelPosition!.y - wideR1.labelPosition!.y);

    expect(wideSpread).toBeGreaterThan(narrowSpread);
  });
});

// ─── computeEdgeBundles ──────────────────────────────────────────────────────

describe('computeEdgeBundles', () => {
  it('single edge gets size=1, index=0', () => {
    const edges = [
      {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
    ];

    const bundles = computeEdgeBundles(edges);

    expect(bundles.get('e1')).toEqual({ index: 0, size: 1 });
  });

  it('two edges between same pair get sequential indices', () => {
    const edges = [
      {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
      {
        id: EdgeId('e2'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
    ];

    const bundles = computeEdgeBundles(edges);

    const b1 = bundles.get('e1')!;
    const b2 = bundles.get('e2')!;

    expect(b1.size).toBe(2);
    expect(b2.size).toBe(2);
    // Indices must be distinct and cover 0..1
    expect(new Set([b1.index, b2.index])).toEqual(new Set([0, 1]));
  });

  it('bidirectional edges (A→B and B→A) are grouped together', () => {
    const edges = [
      {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
      {
        id: EdgeId('e2'),
        source: NodeId('b'),
        target: NodeId('a'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
    ];

    const bundles = computeEdgeBundles(edges);

    const b1 = bundles.get('e1')!;
    const b2 = bundles.get('e2')!;

    // Both should be in the same group (size 2)
    expect(b1.size).toBe(2);
    expect(b2.size).toBe(2);
    expect(new Set([b1.index, b2.index])).toEqual(new Set([0, 1]));
  });

  it('edges between different pairs are in separate groups', () => {
    const edges = [
      {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
      {
        id: EdgeId('e2'),
        source: NodeId('b'),
        target: NodeId('c'),
        data: {},
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      },
    ];

    const bundles = computeEdgeBundles(edges);

    expect(bundles.get('e1')).toEqual({ index: 0, size: 1 });
    expect(bundles.get('e2')).toEqual({ index: 0, size: 1 });
  });

  it('correctly groups parallel edges with size=3', () => {
    const makeEdge = (id: string, src: string, tgt: string) => ({
      id: EdgeId(id),
      source: NodeId(src),
      target: NodeId(tgt),
      data: {},
      sourceArrow: { type: 'none' as const },
      targetArrow: { type: 'triangle' as const },
      style: {},
    });

    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'b'), makeEdge('e3', 'a', 'b')];

    const bundles = computeEdgeBundles(edges);

    const sizes = ['e1', 'e2', 'e3'].map((id) => bundles.get(id)!.size);
    expect(sizes).toEqual([3, 3, 3]);

    const indices = ['e1', 'e2', 'e3'].map((id) => bundles.get(id)!.index);
    expect(new Set(indices)).toEqual(new Set([0, 1, 2]));
  });

  it('returns empty map for empty input', () => {
    const bundles = computeEdgeBundles([]);
    expect(bundles.size).toBe(0);
  });
});
