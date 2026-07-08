import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath, Node, Port } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';
import {
  type Point,
  type Direction,
  type GridCell,
  type AStarNode,
  directionVector,
  dominantExitDirection,
  oppositeDirection,
  extendPoint,
  buildOccupancyGrid,
  cellKey,
  runAStar,
  MinHeap,
} from './astar-grid';
import {
  extractPath,
  simplifyPoints,
  buildRoundedPath,
  buildSharpPath,
  midpointByLength,
  buildOrthogonalJoin,
  buildManhattanFallback,
} from './astar-path';
import type { AStarOptions } from './astar-types';

// Re-export everything so callers that import from 'astar' see the full API
export type { AStarOptions } from './astar-types';
export {
  type Point,
  type Direction,
  type GridCell,
  type AStarNode,
  directionVector,
  dominantExitDirection,
  oppositeDirection,
  extendPoint,
  buildOccupancyGrid,
  cellKey,
  runAStar,
  MinHeap,
} from './astar-grid';
export {
  extractPath,
  simplifyPoints,
  buildRoundedPath,
  buildSharpPath,
  midpointByLength,
  buildOrthogonalJoin,
  buildManhattanFallback,
} from './astar-path';

// ---------------------------------------------------------------------------
// Port position helpers (local — depends on shape registry)
// ---------------------------------------------------------------------------

const portDirection = (port: Port): Direction => port.direction;

const getPortPosition = (node: Node, port: Port): Point => {
  const shape = getShapeOrDefault(node.shape);
  const positions = shape.getPortPositions(node);
  switch (port.direction) {
    case 'north':
      return positions.north;
    case 'south':
      return positions.south;
    case 'east':
      return positions.east;
    case 'west':
      return positions.west;
  }
};

const getBoundaryInDirection = (node: Node, dir: Direction): Point => {
  const shape = getShapeOrDefault(node.shape);
  const center = {
    x: node.position.x + node.size.width / 2,
    y: node.position.y + node.size.height / 2,
  };
  const v = directionVector(dir);
  const far: Point = { x: center.x + v.x * 10000, y: center.y + v.y * 10000 };
  return shape.getBoundaryPoint(node, far);
};

// ---------------------------------------------------------------------------
// Core routing function
// ---------------------------------------------------------------------------

export const computeAStarPath = (context: EdgeRouterContext, options?: AStarOptions): EdgePath => {
  const { sourceNode, targetNode, allNodes, sourcePort, targetPort } = context;
  const gridSize = options?.gridSize ?? 10;
  const padding = options?.padding ?? 15;
  const borderRadius = options?.borderRadius ?? 8;
  const maxSearchNodes = options?.maxSearchNodes ?? 10000;

  // 1. Determine exit/entry directions
  const sourceCenter: Point = {
    x: sourceNode.position.x + sourceNode.size.width / 2,
    y: sourceNode.position.y + sourceNode.size.height / 2,
  };
  const targetCenter: Point = {
    x: targetNode.position.x + targetNode.size.width / 2,
    y: targetNode.position.y + targetNode.size.height / 2,
  };

  const exitDir: Direction = sourcePort
    ? portDirection(sourcePort)
    : dominantExitDirection(sourceCenter, targetCenter);

  const entryDir: Direction = targetPort
    ? portDirection(targetPort)
    : oppositeDirection(dominantExitDirection(sourceCenter, targetCenter));

  // 2. Compute source/target intersections on node boundaries
  const sourceIntersection: Point = sourcePort
    ? getPortPosition(sourceNode, sourcePort)
    : getBoundaryInDirection(sourceNode, exitDir);

  const targetIntersection: Point = targetPort
    ? getPortPosition(targetNode, targetPort)
    : getBoundaryInDirection(targetNode, entryDir);

  // 3. Stub endpoints (boundary + padding offset in exit/entry direction)
  const exitStub = extendPoint(sourceIntersection, exitDir, padding);
  const entryStub = extendPoint(targetIntersection, entryDir, padding);

  // 4. Build occupancy grid — exclude source and target nodes from obstacles
  const obstacleNodes = allNodes.filter(
    (n) => n.id !== sourceNode.id && n.id !== targetNode.id
  );
  const blocked = buildOccupancyGrid(obstacleNodes, padding, gridSize);

  // 5. Convert stub endpoints to grid coordinates
  const startCell: GridCell = {
    gx: Math.round(exitStub.x / gridSize),
    gy: Math.round(exitStub.y / gridSize),
  };
  const goalCell: GridCell = {
    gx: Math.round(entryStub.x / gridSize),
    gy: Math.round(entryStub.y / gridSize),
  };

  // 6. Unblock start and goal cells (they might be in the padding zone)
  blocked.delete(cellKey(startCell.gx, startCell.gy));
  blocked.delete(cellKey(goalCell.gx, goalCell.gy));

  // 7. Run A*
  const goalNode = runAStar(startCell, goalCell, blocked, maxSearchNodes);

  // 8. If A* found a path, use it. Otherwise fall back to manhattan routing.
  let finalPoints: ReadonlyArray<Point>;

  if (goalNode !== null) {
    const astarPoints = extractPath(goalNode, gridSize);

    // Build orthogonal connectors from sourceIntersection → astarPath and
    // astarPath → targetIntersection. The grid-snapped A* endpoints may not
    // align exactly with exitStub/entryStub in pixel space, so we need L-bends.
    const firstGridPt = astarPoints[0]!;
    const lastGridPt = astarPoints[astarPoints.length - 1]!;

    const leadIn = buildOrthogonalJoin(sourceIntersection, exitDir, firstGridPt);
    const leadOut = buildOrthogonalJoin(targetIntersection, entryDir, lastGridPt);
    // leadOut goes from targetIntersection → lastGridPt; reverse it to get lastGridPt → targetIntersection
    const leadOutReversed = [...leadOut].reverse();

    finalPoints = simplifyPoints([
      sourceIntersection,
      ...leadIn,
      ...astarPoints,
      ...leadOutReversed,
      targetIntersection,
    ]);
  } else {
    // Fallback: manhattan-style stub-based routing
    finalPoints = simplifyPoints([
      sourceIntersection,
      exitStub,
      ...buildManhattanFallback(exitStub, exitDir, entryStub, entryDir),
      entryStub,
      targetIntersection,
    ]);
  }

  // 9. Build SVG path string
  const d =
    borderRadius > 0
      ? buildRoundedPath(finalPoints, borderRadius)
      : buildSharpPath(finalPoints);

  // 10. Label at mid-arc
  const labelPosition = midpointByLength(finalPoints);

  return {
    d,
    points: finalPoints,
    sourceIntersection,
    targetIntersection,
    labelPosition,
  };
};

// ---------------------------------------------------------------------------
// EdgeRouter export
// ---------------------------------------------------------------------------

const routeAStar = (
  context: EdgeRouterContext,
  options?: AStarOptions
): Effect.Effect<EdgePath, never> => Effect.succeed(computeAStarPath(context, options));

export const aStarRouter: EdgeRouter<AStarOptions> = {
  name: 'astar',
  route: routeAStar,
};
