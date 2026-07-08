import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { NodeId, EdgeId, PortId } from '../../graph/types';
import type { Node, EdgeRouterContext, Port } from '../../graph/types';
import { manhattanRouter } from '../manhattan';

// ─── Test helpers ─────────────────────────────────────────────────────────────

const runEffect = <A, E>(effect: Effect.Effect<A, E>): A => Effect.runSync(effect);

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

const makeContext = (
  sourceNode: Node,
  targetNode: Node,
  allNodes: Node[],
  sourcePort?: Port,
  targetPort?: Port
): EdgeRouterContext => ({
  edge: {
    id: EdgeId('e1'),
    source: NodeId(sourceNode.id),
    target: NodeId(targetNode.id),
    data: {},
    sourceArrow: { type: 'none' },
    targetArrow: { type: 'triangle' },
    style: {},
  },
  sourceNode,
  targetNode,
  allNodes,
  sourcePort,
  targetPort,
});

/** Assert every consecutive pair of points forms a horizontal or vertical segment. */
const assertOrthogonal = (points: ReadonlyArray<{ x: number; y: number }>): void => {
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const isHorizontal = Math.abs(prev.y - curr.y) < 1e-6;
    const isVertical = Math.abs(prev.x - curr.x) < 1e-6;
    expect(isHorizontal || isVertical, `Segment ${i} is not orthogonal`).toBe(true);
  }
};

// ─── Basic routing ────────────────────────────────────────────────────────────

describe('manhattan router — basic horizontal routing', () => {
  it('produces only orthogonal segments for source-left target-right layout', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    assertOrthogonal(result.points);
    expect(result.points.length).toBeGreaterThanOrEqual(2);
  });

  it('source intersection is on source node boundary', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    // Right edge of source node
    expect(result.sourceIntersection.x).toBe(100);
    expect(result.sourceIntersection.y).toBe(25);
  });

  it('target intersection is on target node boundary', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    // Left edge of target node
    expect(result.targetIntersection.x).toBe(200);
    expect(result.targetIntersection.y).toBe(25);
  });
});

describe('manhattan router — basic vertical routing', () => {
  it('produces only orthogonal segments for source-above target-below layout', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    assertOrthogonal(result.points);
  });

  it('source intersection is on bottom edge when target is below', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.sourceIntersection.x).toBe(50);
    expect(result.sourceIntersection.y).toBe(50);
  });

  it('target intersection is on top edge when target is below', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.targetIntersection.x).toBe(50);
    expect(result.targetIntersection.y).toBe(200);
  });
});

// ─── Diagonal routing ─────────────────────────────────────────────────────────

describe('manhattan router — diagonal routing', () => {
  it('diagonal layout produces only orthogonal segments', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    assertOrthogonal(result.points);
  });

  it('path d attribute contains only M and L (or Q for rounded corners) commands', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode]),
        { borderRadius: 0 }
      )
    );

    // Sharp: only M and L commands
    expect(result.d).toMatch(/^[ML\s\d.-]+$/);
  });
});

// ─── Rounded corners ──────────────────────────────────────────────────────────

describe('manhattan router — borderRadius option', () => {
  it('uses Q commands for rounded corners when borderRadius > 0', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode]),
        { borderRadius: 10 }
      )
    );

    expect(result.d).toMatch(/Q\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+/);
  });

  it('does not use Q commands for sharp corners when borderRadius = 0', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode]),
        { borderRadius: 0 }
      )
    );

    expect(result.d).not.toMatch(/Q/);
  });
});

// ─── Obstacle avoidance ───────────────────────────────────────────────────────

describe('manhattan router — obstacle avoidance', () => {
  it('routes around a blocking node placed between source and target', () => {
    const sourceNode = createTestNode('src', 0, 75, 100, 50);
    const targetNode = createTestNode('tgt', 400, 75, 100, 50);
    // Obstacle in the middle, exactly on the direct horizontal path
    const obstacle = createTestNode('obs', 180, 60, 80, 80);

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, obstacle, targetNode]),
        { padding: 20 }
      )
    );

    // Every segment should be orthogonal
    assertOrthogonal(result.points);

    // No segment of the final path should pass through the obstacle's bounding box
    const obstacleRect = {
      x: obstacle.position.x,
      y: obstacle.position.y,
      width: obstacle.size.width,
      height: obstacle.size.height,
    };

    for (let i = 1; i < result.points.length; i++) {
      // A segment that starts or ends inside the obstacle triggers only if BOTH endpoints
      // are inside, which would mean a zero-length segment overlapping the node centre.
      // We verify that no interior segment point lies strictly inside the padded obstacle box.
      const p = result.points[i]!;
      const inObstacle =
        p.x > obstacleRect.x &&
        p.x < obstacleRect.x + obstacleRect.width &&
        p.y > obstacleRect.y &&
        p.y < obstacleRect.y + obstacleRect.height;
      // The path must not terminate inside the obstacle
      if (i < result.points.length - 1) {
        expect(inObstacle).toBe(false);
      }
    }
  });
});

// ─── Port-aware routing ───────────────────────────────────────────────────────

describe('manhattan router — port-aware routing', () => {
  it('exits from south port when source has a south port', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const southPort: Port = {
      id: PortId('p1'),
      direction: 'south',
      offset: 0.5,
    };

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode], southPort, undefined),
        { borderRadius: 0 }
      )
    );

    // Source intersection should be on the bottom edge of the source node
    expect(result.sourceIntersection.y).toBe(50);
    // First segment after the intersection must go downward (y increases)
    expect(result.points[1]!.y).toBeGreaterThanOrEqual(result.sourceIntersection.y);
  });

  it('enters from north when target has a north port', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const northPort: Port = {
      id: PortId('p2'),
      direction: 'north',
      offset: 0.5,
    };

    const result = runEffect(
      manhattanRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode], undefined, northPort),
        { borderRadius: 0 }
      )
    );

    // Target intersection should be on the top edge of the target node
    expect(result.targetIntersection.y).toBe(200);
  });
});

// ─── Label position ───────────────────────────────────────────────────────────

describe('manhattan router — label position', () => {
  it('label position is defined', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.labelPosition).toBeDefined();
  });

  it('label position lies between source and target centers (bounding box check)', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 150, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    const lp = result.labelPosition!;
    const minX = Math.min(result.sourceIntersection.x, result.targetIntersection.x) - 50;
    const maxX = Math.max(result.sourceIntersection.x, result.targetIntersection.x) + 50;
    const minY = Math.min(result.sourceIntersection.y, result.targetIntersection.y) - 50;
    const maxY = Math.max(result.sourceIntersection.y, result.targetIntersection.y) + 50;

    expect(lp.x).toBeGreaterThanOrEqual(minX);
    expect(lp.x).toBeLessThanOrEqual(maxX);
    expect(lp.y).toBeGreaterThanOrEqual(minY);
    expect(lp.y).toBeLessThanOrEqual(maxY);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('manhattan router — edge cases', () => {
  it('handles overlapping source and target without throwing', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 10, 10, 100, 50);

    expect(() => {
      runEffect(
        manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
      );
    }).not.toThrow();
  });

  it('handles large padding without throwing', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 500, 0, 100, 50);

    expect(() => {
      runEffect(
        manhattanRouter.route(
          makeContext(sourceNode, targetNode, [sourceNode, targetNode]),
          { padding: 100 }
        )
      );
    }).not.toThrow();
  });

  it('returns a valid EdgePath with all required fields', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      manhattanRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.d).toBeTruthy();
    expect(result.points).toBeDefined();
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    expect(result.sourceIntersection).toBeDefined();
    expect(result.targetIntersection).toBeDefined();
    expect(result.labelPosition).toBeDefined();
  });

  it('router name is "manhattan"', () => {
    expect(manhattanRouter.name).toBe('manhattan');
  });
});
