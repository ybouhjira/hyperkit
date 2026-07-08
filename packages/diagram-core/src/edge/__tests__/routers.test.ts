import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { NodeId, EdgeId } from '../../graph/types';
import type { Node, EdgeRouterContext } from '../../graph/types';
import { straightRouter } from '../straight';
import { bezierRouter } from '../bezier';
import { stepRouter } from '../step';

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

describe('straight router', () => {
  it('creates a direct line from source boundary to target boundary', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(straightRouter.route(context));

    // Should have exactly 2 points
    expect(result.points.length).toBe(2);

    // Should be a straight line: M x1 y1 L x2 y2
    expect(result.d).toMatch(/^M\s+[\d.]+\s+[\d.]+\s+L\s+[\d.]+\s+[\d.]+$/);

    // Source intersection should be on the right edge of source node (100, 25)
    expect(result.sourceIntersection.x).toBe(100);
    expect(result.sourceIntersection.y).toBe(25);

    // Target intersection should be on the left edge of target node (200, 25)
    expect(result.targetIntersection.x).toBe(200);
    expect(result.targetIntersection.y).toBe(25);
  });

  it('computes boundary intersections for vertical connection', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(straightRouter.route(context));

    // Source intersection should be on bottom edge of source node
    expect(result.sourceIntersection.x).toBe(50);
    expect(result.sourceIntersection.y).toBe(50);

    // Target intersection should be on top edge of target node
    expect(result.targetIntersection.x).toBe(50);
    expect(result.targetIntersection.y).toBe(150);
  });

  it('label position is at midpoint', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(straightRouter.route(context));

    const expectedX = (result.sourceIntersection.x + result.targetIntersection.x) / 2;
    const expectedY = (result.sourceIntersection.y + result.targetIntersection.y) / 2;

    expect(result.labelPosition!.x).toBe(expectedX);
    expect(result.labelPosition!.y).toBe(expectedY);
  });

  it('works with ellipse shapes', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 100, 'ellipse');
    const targetNode = createTestNode('b', 200, 0, 100, 100, 'ellipse');

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(straightRouter.route(context));

    // For ellipse, boundary point should be on the ellipse perimeter
    // Source center: (50, 50), target center: (250, 50)
    // Horizontal line from center to center, ellipse radius is 50 horizontally
    // So boundary should be at (100, 50) on the right edge of source and (200, 50) on left edge of target
    expect(result.sourceIntersection.x).toBeCloseTo(100, 1);
    expect(result.sourceIntersection.y).toBeCloseTo(50, 1);
    expect(result.targetIntersection.x).toBeCloseTo(200, 1);
    expect(result.targetIntersection.y).toBeCloseTo(50, 1);
  });
});

describe('bezier router', () => {
  it('creates cubic bezier curve with C command', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(bezierRouter.route(context));

    // Should contain C (cubic bezier) command
    expect(result.d).toMatch(/^M\s+[\d.]+\s+[\d.]+\s+C\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+$/);

    // Should have multiple sample points along the curve
    expect(result.points.length).toBeGreaterThan(2);
  });

  it('control points are offset in the dominant direction', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(bezierRouter.route(context, { curvature: 0.5 }));

    // Parse the path to extract control points
    const matches = result.d.match(/C\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    expect(matches).toBeTruthy();

    const cp1x = parseFloat(matches![1]);
    const cp1y = parseFloat(matches![2]);
    const cp2x = parseFloat(matches![3]);
    const cp2y = parseFloat(matches![4]);

    // For horizontal dominant, control points should be offset horizontally
    // cp1 should be to the right of source, cp2 should be to the left of target
    expect(cp1x).toBeGreaterThan(result.sourceIntersection.x);
    expect(cp2x).toBeLessThan(result.targetIntersection.x);

    // Y coordinates should match source/target (horizontal offset)
    expect(cp1y).toBe(result.sourceIntersection.y);
    expect(cp2y).toBe(result.targetIntersection.y);
  });

  it('respects curvature parameter', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result1 = runEffect(bezierRouter.route(context, { curvature: 0.2 }));
    const result2 = runEffect(bezierRouter.route(context, { curvature: 0.8 }));

    // Extract control points
    const matches1 = result1.d.match(/C\s+([\d.]+)/);
    const matches2 = result2.d.match(/C\s+([\d.]+)/);

    expect(matches1).toBeTruthy();
    expect(matches2).toBeTruthy();

    const cp1x1 = parseFloat(matches1![1]);
    const cp1x2 = parseFloat(matches2![1]);

    // Higher curvature should produce control points further from the source
    expect(Math.abs(cp1x2 - result2.sourceIntersection.x)).toBeGreaterThan(
      Math.abs(cp1x1 - result1.sourceIntersection.x)
    );
  });

  it('computes boundary intersections correctly', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 100, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(bezierRouter.route(context));

    // Source and target intersections should be on node boundaries
    expect(result.sourceIntersection.x).toBeGreaterThanOrEqual(0);
    expect(result.sourceIntersection.x).toBeLessThanOrEqual(100);
    expect(result.sourceIntersection.y).toBeGreaterThanOrEqual(0);
    expect(result.sourceIntersection.y).toBeLessThanOrEqual(50);

    expect(result.targetIntersection.x).toBeGreaterThanOrEqual(200);
    expect(result.targetIntersection.x).toBeLessThanOrEqual(300);
    expect(result.targetIntersection.y).toBeGreaterThanOrEqual(100);
    expect(result.targetIntersection.y).toBeLessThanOrEqual(150);
  });

  it('label position is at t=0.5 on the bezier curve', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(bezierRouter.route(context));

    // Label position should be defined and between source and target
    expect(result.labelPosition).toBeDefined();
    expect(result.labelPosition!.x).toBeGreaterThan(result.sourceIntersection.x);
    expect(result.labelPosition!.x).toBeLessThan(result.targetIntersection.x);
  });
});

describe('step router', () => {
  it('creates path with only horizontal and vertical segments', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context, { borderRadius: 0 }));

    // Path should contain only M and L commands (no curves)
    expect(result.d).toMatch(/^[ML\s\d.-]+$/);

    // Verify all segments are horizontal or vertical
    const points = result.points;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Each segment should be either horizontal (same y) or vertical (same x)
      const isHorizontal = prev.y === curr.y;
      const isVertical = prev.x === curr.x;
      expect(isHorizontal || isVertical).toBe(true);
    }
  });

  it('uses vertical routing when dy > dx', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 50, 200, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context, { borderRadius: 0 }));

    // Should exit from bottom (or top) and create vertical-first path
    const points = result.points;
    expect(points.length).toBeGreaterThan(2);

    // First segment should be vertical (same x)
    expect(points[0].x).toBe(points[1].x);
  });

  it('uses horizontal routing when dx > dy', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 25, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context, { borderRadius: 0 }));

    // Should exit from right (or left) and create horizontal-first path
    const points = result.points;
    expect(points.length).toBeGreaterThan(2);

    // First segment should be horizontal (same y)
    expect(points[0].y).toBe(points[1].y);
  });

  it('creates rounded corners when borderRadius > 0', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context, { borderRadius: 10 }));

    // Path should contain Q commands for rounded corners
    expect(result.d).toMatch(/Q\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+/);
  });

  it('creates sharp corners when borderRadius = 0', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context, { borderRadius: 0 }));

    // Path should not contain Q commands
    expect(result.d).not.toMatch(/Q/);
  });

  it('computes boundary intersections correctly', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context));

    // Source intersection should be on source node boundary
    expect(result.sourceIntersection.x).toBeGreaterThanOrEqual(0);
    expect(result.sourceIntersection.x).toBeLessThanOrEqual(100);
    expect(result.sourceIntersection.y).toBeGreaterThanOrEqual(0);
    expect(result.sourceIntersection.y).toBeLessThanOrEqual(50);

    // Target intersection should be on target node boundary
    expect(result.targetIntersection.x).toBeGreaterThanOrEqual(200);
    expect(result.targetIntersection.x).toBeLessThanOrEqual(300);
    expect(result.targetIntersection.y).toBeGreaterThanOrEqual(150);
    expect(result.targetIntersection.y).toBeLessThanOrEqual(200);
  });

  it('label position is at midpoint', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const context: EdgeRouterContext = {
      edge: {
        id: EdgeId('e1'),
        source: NodeId('a'),
        target: NodeId('b'),
        data: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'triangle' },
        style: {},
      },
      sourceNode,
      targetNode,
      allNodes: [sourceNode, targetNode],
    };

    const result = runEffect(stepRouter.route(context));

    const expectedX = (result.sourceIntersection.x + result.targetIntersection.x) / 2;
    const expectedY = (result.sourceIntersection.y + result.targetIntersection.y) / 2;

    expect(result.labelPosition!.x).toBe(expectedX);
    expect(result.labelPosition!.y).toBe(expectedY);
  });
});
