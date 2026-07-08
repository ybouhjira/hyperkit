/**
 * Manhattan (orthogonal) edge router with obstacle avoidance.
 *
 * Geometry primitives (direction helpers, path builders, point simplification)
 * are shared with the A* router via astar-geometry.ts.
 * This file contains only:
 *   - ManhattanOptions interface
 *   - Obstacle avoidance (segment-based, not grid-based)
 *   - Core routing function and export
 */
import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath, Node } from '../graph/types';
import {
  dominantExitDirection,
  oppositeDirection,
  portDirection,
  getPortPosition,
  getBoundaryInDirection,
  extendPoint,
  simplifyPoints,
  buildRoundedPath,
  buildSharpPath,
  midpointByLength,
} from './astar-geometry';

export interface ManhattanOptions {
  readonly padding?: number; // distance from node boundaries, default 20
  readonly borderRadius?: number; // rounded corners, 0 = sharp, default 8
  readonly maxIterations?: number; // pathfinding limit, default 100
}

// ─── Local geometry helpers ───────────────────────────────────────────────────

const nodeRect = (node: Node, padding: number) => ({
  x: node.position.x - padding,
  y: node.position.y - padding,
  width: node.size.width + padding * 2,
  height: node.size.height + padding * 2,
});

const segmentIntersectsRect = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);
  const rx2 = rect.x + rect.width;
  const ry2 = rect.y + rect.height;
  return maxX >= rect.x && minX <= rx2 && maxY >= rect.y && minY <= ry2;
};

// ─── Orthogonal path construction ───────────────────────────────────────────

const buildConnectingWaypoints = (
  exitStub: { x: number; y: number },
  exitDir: string,
  entryStub: { x: number; y: number },
  entryDir: string
): ReadonlyArray<{ x: number; y: number }> => {
  const horizontal = (d: string) => d === 'east' || d === 'west';
  const sameAxis = horizontal(exitDir) === horizontal(entryDir);

  if (sameAxis) {
    if (horizontal(exitDir)) {
      const midX = (exitStub.x + entryStub.x) / 2;
      return [{ x: midX, y: exitStub.y }, { x: midX, y: entryStub.y }];
    } else {
      const midY = (exitStub.y + entryStub.y) / 2;
      return [{ x: exitStub.x, y: midY }, { x: entryStub.x, y: midY }];
    }
  }

  if (horizontal(exitDir)) {
    return [{ x: entryStub.x, y: exitStub.y }];
  } else {
    return [{ x: exitStub.x, y: entryStub.y }];
  }
};

// ─── Obstacle avoidance ──────────────────────────────────────────────────────

const avoidObstacles = (
  points: ReadonlyArray<{ x: number; y: number }>,
  obstacles: ReadonlyArray<Node>,
  padding: number,
  maxIterations: number
): ReadonlyArray<{ x: number; y: number }> => {
  if (obstacles.length === 0) return points;

  let current = [...points];
  let iterations = 0;

  while (iterations < maxIterations) {
    let mutated = false;

    for (let segIdx = 0; segIdx < current.length - 1; segIdx++) {
      const p1 = current[segIdx]!;
      const p2 = current[segIdx + 1]!;

      for (const obstacle of obstacles) {
        const rect = nodeRect(obstacle, padding);
        if (!segmentIntersectsRect(p1, p2, rect)) continue;

        const isHorizontal = Math.abs(p2.y - p1.y) < 1e-6;
        let detour: { x: number; y: number }[];

        if (isHorizontal) {
          const aboveY = rect.y - 1;
          const belowY = rect.y + rect.height + 1;
          const detourY = Math.abs(aboveY - p1.y) <= Math.abs(belowY - p1.y) ? aboveY : belowY;
          detour = [{ x: p1.x, y: detourY }, { x: p2.x, y: detourY }];
        } else {
          const leftX = rect.x - 1;
          const rightX = rect.x + rect.width + 1;
          const detourX = Math.abs(leftX - p1.x) <= Math.abs(rightX - p1.x) ? leftX : rightX;
          detour = [{ x: detourX, y: p1.y }, { x: detourX, y: p2.y }];
        }

        current = [...current.slice(0, segIdx + 1), ...detour, ...current.slice(segIdx + 1)];
        mutated = true;
        break;
      }

      if (mutated) break;
    }

    if (!mutated) break;
    iterations++;
  }

  return current;
};

// ─── Core routing function ───────────────────────────────────────────────────

const computeManhattanPath = (context: EdgeRouterContext, options?: ManhattanOptions): EdgePath => {
  const { sourceNode, targetNode, allNodes, sourcePort, targetPort } = context;
  const padding = options?.padding ?? 20;
  const borderRadius = options?.borderRadius ?? 8;
  const maxIterations = options?.maxIterations ?? 100;

  const sourceCenter = {
    x: sourceNode.position.x + sourceNode.size.width / 2,
    y: sourceNode.position.y + sourceNode.size.height / 2,
  };
  const targetCenter = {
    x: targetNode.position.x + targetNode.size.width / 2,
    y: targetNode.position.y + targetNode.size.height / 2,
  };

  const exitDir = sourcePort
    ? portDirection(sourcePort)
    : dominantExitDirection(sourceCenter, targetCenter);

  const entryDir = targetPort
    ? portDirection(targetPort)
    : oppositeDirection(dominantExitDirection(sourceCenter, targetCenter));

  const sourceIntersection = sourcePort
    ? getPortPosition(sourceNode, sourcePort)
    : getBoundaryInDirection(sourceNode, exitDir);

  const targetIntersection = targetPort
    ? getPortPosition(targetNode, targetPort)
    : getBoundaryInDirection(targetNode, entryDir);

  const exitStub = extendPoint(sourceIntersection, exitDir, padding);
  const entryStub = extendPoint(targetIntersection, entryDir, padding);

  const midWaypoints = buildConnectingWaypoints(exitStub, exitDir, entryStub, entryDir);

  const rawPoints: ReadonlyArray<{ x: number; y: number }> = [
    sourceIntersection,
    exitStub,
    ...midWaypoints,
    entryStub,
    targetIntersection,
  ];

  const obstacleNodes = allNodes.filter(
    (n) => n.id !== sourceNode.id && n.id !== targetNode.id
  );

  const avoidedPoints = avoidObstacles(
    simplifyPoints(rawPoints),
    obstacleNodes,
    padding,
    maxIterations
  );

  const finalPoints = simplifyPoints(avoidedPoints);

  const d =
    borderRadius > 0
      ? buildRoundedPath(finalPoints, borderRadius)
      : buildSharpPath(finalPoints);

  const labelPosition = midpointByLength(finalPoints);

  return {
    d,
    points: finalPoints,
    sourceIntersection,
    targetIntersection,
    labelPosition,
  };
};

const routeManhattan = (
  context: EdgeRouterContext,
  options?: ManhattanOptions
): Effect.Effect<EdgePath, never> => Effect.succeed(computeManhattanPath(context, options));

export const manhattanRouter: EdgeRouter<ManhattanOptions> = {
  name: 'manhattan',
  route: routeManhattan,
};
