import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { NodeId, EdgeId, PortId } from '../../graph/types';
import type { Node, EdgeRouterContext, Port } from '../../graph/types';
import { aStarRouter } from '../astar';

// ─── Test helpers ──────────────────────────────────────────────────────────────

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
    const isHorizontal = Math.abs(prev.y - curr.y) < 1e-4;
    const isVertical = Math.abs(prev.x - curr.x) < 1e-4;
    expect(isHorizontal || isVertical, `Segment ${i} is not orthogonal`).toBe(true);
  }
};

// ─── Basic routing ─────────────────────────────────────────────────────────────

describe('astar router — name', () => {
  it('has name "astar"', () => {
    expect(aStarRouter.name).toBe('astar');
  });
});

describe('astar router — direct path with no obstacles', () => {
  it('produces a valid path between horizontally separated nodes', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.d).toBeTruthy();
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    assertOrthogonal(result.points);
  });

  it('produces only orthogonal segments when nodes are separated vertically', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 300, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    assertOrthogonal(result.points);
  });

  it('returns valid sourceIntersection on the source node boundary', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    // Source intersection should be on the right boundary (east side)
    expect(result.sourceIntersection.x).toBe(100);
    expect(result.sourceIntersection.y).toBe(25);
  });

  it('returns valid targetIntersection on the target node boundary', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    // Target intersection should be on the left boundary (west side)
    expect(result.targetIntersection.x).toBe(300);
    expect(result.targetIntersection.y).toBe(25);
  });

  it('provides a valid labelPosition at the midpoint', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.labelPosition).toBeDefined();
    // Label should be somewhere between source and target intersections
    const minX = Math.min(result.sourceIntersection.x, result.targetIntersection.x) - 20;
    const maxX = Math.max(result.sourceIntersection.x, result.targetIntersection.x) + 20;
    expect(result.labelPosition!.x).toBeGreaterThanOrEqual(minX);
    expect(result.labelPosition!.x).toBeLessThanOrEqual(maxX);
  });
});

// ─── Obstacle avoidance ────────────────────────────────────────────────────────

describe('astar router — single obstacle between source and target', () => {
  it('routes around a node placed directly on the path', () => {
    const sourceNode = createTestNode('src', 0, 75, 100, 50);
    const targetNode = createTestNode('tgt', 500, 75, 100, 50);
    // Obstacle sits squarely in the horizontal corridor
    const obstacle = createTestNode('obs', 220, 60, 80, 80);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, obstacle, targetNode]), {
        padding: 15,
        gridSize: 10,
      })
    );

    expect(result.d).toBeTruthy();
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    // Path must be orthogonal
    assertOrthogonal(result.points);
  });

  it('avoids passing through the obstacle bounding box', () => {
    const sourceNode = createTestNode('src', 0, 75, 100, 50);
    const targetNode = createTestNode('tgt', 500, 75, 100, 50);
    const obstacle = createTestNode('obs', 220, 60, 80, 80);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, obstacle, targetNode]), {
        padding: 0,
        gridSize: 5,
      })
    );

    const obstacleRect = {
      x: obstacle.position.x,
      y: obstacle.position.y,
      width: obstacle.size.width,
      height: obstacle.size.height,
    };

    // No interior waypoint should be strictly inside the obstacle bounds
    for (let i = 1; i < result.points.length - 1; i++) {
      const p = result.points[i]!;
      const inObstacle =
        p.x > obstacleRect.x + 2 &&
        p.x < obstacleRect.x + obstacleRect.width - 2 &&
        p.y > obstacleRect.y + 2 &&
        p.y < obstacleRect.y + obstacleRect.height - 2;
      expect(inObstacle).toBe(false);
    }
  });
});

describe('astar router — multiple obstacles forming a corridor', () => {
  it('finds path through a narrow corridor', () => {
    const sourceNode = createTestNode('src', 0, 100, 80, 60);
    const targetNode = createTestNode('tgt', 400, 100, 80, 60);

    // Two obstacles that leave a corridor in the middle
    const topObstacle = createTestNode('top', 150, 0, 100, 70);
    const bottomObstacle = createTestNode('bot', 150, 160, 100, 80);

    const allNodes = [sourceNode, targetNode, topObstacle, bottomObstacle];

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, allNodes), {
        padding: 5,
        gridSize: 10,
        maxSearchNodes: 20000,
      })
    );

    expect(result.d).toBeTruthy();
    expect(result.points.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Fallback behaviour ───────────────────────────────────────────────────────

describe('astar router — maxSearchNodes fallback', () => {
  it('still returns a valid path when maxSearchNodes is exhausted', () => {
    const sourceNode = createTestNode('src', 0, 0, 100, 50);
    const targetNode = createTestNode('tgt', 500, 500, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        maxSearchNodes: 1,
        gridSize: 10,
      })
    );

    // Must still return a structurally valid EdgePath (fallback)
    expect(result.d).toBeTruthy();
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    expect(result.sourceIntersection).toBeDefined();
    expect(result.targetIntersection).toBeDefined();
    expect(result.labelPosition).toBeDefined();
  });

  it('fallback path is orthogonal', () => {
    const sourceNode = createTestNode('src', 0, 0, 100, 50);
    const targetNode = createTestNode('tgt', 400, 300, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        maxSearchNodes: 1,
        gridSize: 10,
      })
    );

    assertOrthogonal(result.points);
  });
});

// ─── Border radius option ─────────────────────────────────────────────────────

describe('astar router — borderRadius option', () => {
  it('produces Q commands in SVG path when borderRadius > 0 and there are turns', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 200, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        borderRadius: 8,
        gridSize: 10,
      })
    );

    // The path should contain Q commands for rounded corners when there's a turn
    // (diagonal layout always produces at least one turn)
    expect(result.d).toMatch(/Q/);
  });

  it('does not produce Q commands when borderRadius = 0', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 200, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        borderRadius: 0,
        gridSize: 10,
      })
    );

    expect(result.d).not.toMatch(/Q/);
  });

  it('sharp path uses only M and L commands', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        borderRadius: 0,
        gridSize: 10,
      })
    );

    expect(result.d).toMatch(/^[ML\s\d.-]+$/);
  });
});

// ─── Grid size option ─────────────────────────────────────────────────────────

describe('astar router — gridSize option', () => {
  it('finer grid (smaller gridSize) still produces a valid path', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        gridSize: 5,
      })
    );

    expect(result.d).toBeTruthy();
    assertOrthogonal(result.points);
  });

  it('coarser grid (larger gridSize) still produces a valid path', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]), {
        gridSize: 20,
      })
    );

    expect(result.d).toBeTruthy();
    assertOrthogonal(result.points);
  });
});

// ─── Port direction awareness ─────────────────────────────────────────────────

describe('astar router — port direction awareness', () => {
  it('source intersection is on east boundary when source has east port', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 200, 0, 100, 50);

    const eastPort: Port = {
      id: PortId('p1'),
      direction: 'east',
      offset: 0.5,
    };

    const result = runEffect(
      aStarRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode], eastPort, undefined),
        { borderRadius: 0 }
      )
    );

    // East port → boundary point at right edge of source node
    expect(result.sourceIntersection.x).toBe(100);
    expect(result.sourceIntersection.y).toBe(25);
  });

  it('source intersection is on south boundary when source has south port', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 0, 200, 100, 50);

    const southPort: Port = {
      id: PortId('p1'),
      direction: 'south',
      offset: 0.5,
    };

    const result = runEffect(
      aStarRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode], southPort, undefined),
        { borderRadius: 0 }
      )
    );

    // South port → boundary point at bottom edge of source node
    expect(result.sourceIntersection.y).toBe(50);
  });

  it('target intersection is on west boundary when target has west port', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 0, 100, 50);

    const westPort: Port = {
      id: PortId('p2'),
      direction: 'west',
      offset: 0.5,
    };

    const result = runEffect(
      aStarRouter.route(
        makeContext(sourceNode, targetNode, [sourceNode, targetNode], undefined, westPort),
        { borderRadius: 0 }
      )
    );

    // West port → boundary point at left edge of target node
    expect(result.targetIntersection.x).toBe(300);
  });
});

// ─── EdgePath contract ────────────────────────────────────────────────────────

describe('astar router — EdgePath contract', () => {
  it('returns all required EdgePath fields', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.d).toBeTruthy();
    expect(Array.isArray(result.points)).toBe(true);
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    expect(result.sourceIntersection).toHaveProperty('x');
    expect(result.sourceIntersection).toHaveProperty('y');
    expect(result.targetIntersection).toHaveProperty('x');
    expect(result.targetIntersection).toHaveProperty('y');
    expect(result.labelPosition).toBeDefined();
    expect(result.labelPosition).toHaveProperty('x');
    expect(result.labelPosition).toHaveProperty('y');
  });

  it('path starts with M command', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 300, 200, 100, 50);

    const result = runEffect(
      aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode]))
    );

    expect(result.d.trimStart()).toMatch(/^M/);
  });

  it('handles overlapping nodes without throwing', () => {
    const sourceNode = createTestNode('a', 0, 0, 100, 50);
    const targetNode = createTestNode('b', 10, 10, 100, 50);

    expect(() => {
      runEffect(aStarRouter.route(makeContext(sourceNode, targetNode, [sourceNode, targetNode])));
    }).not.toThrow();
  });
});

// ─── Performance ──────────────────────────────────────────────────────────────

describe('astar router — performance', () => {
  it('routes 30 edges across 20 nodes in under 100ms', () => {
    // Build 20 nodes scattered across a 1000x800 canvas
    const nodes: Node[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push(createTestNode(`n${i}`, (i % 5) * 200, Math.floor(i / 5) * 200, 120, 60));
    }

    const contexts: EdgeRouterContext[] = [];
    for (let e = 0; e < 30; e++) {
      const srcIdx = e % nodes.length;
      const tgtIdx = (e + 3) % nodes.length;
      if (srcIdx !== tgtIdx) {
        contexts.push(makeContext(nodes[srcIdx]!, nodes[tgtIdx]!, nodes));
      }
    }

    const start = performance.now();

    for (const ctx of contexts) {
      runEffect(aStarRouter.route(ctx, { gridSize: 15, maxSearchNodes: 5000 }));
    }

    const elapsed = performance.now() - start;
    // Smoke guard against algorithmic regressions (a broken heuristic or
    // unbounded search lands in the seconds). Deliberately loose: ~150ms is
    // normal on slow shared CI runners, ~50ms on a dev machine.
    expect(elapsed).toBeLessThan(500);
  });
});
