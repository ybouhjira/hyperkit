import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath, Node } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';

export interface BezierOptions {
  readonly curvature?: number; // 0-1, default 0.5
  readonly edgeIndex?: number; // index among parallel edges (0-based)
  readonly totalParallelEdges?: number; // total count of parallel edges between same pair
  readonly parallelSpacing?: number; // px spacing between parallel edges, default 15
}

const routeBezier = (context: EdgeRouterContext, options?: BezierOptions): Effect.Effect<EdgePath, never> =>
  Effect.succeed(computeBezierPath(context, options));

const computeSelfLoopPath = (node: Node): EdgePath => {
  const shape = getShapeOrDefault(node.shape);
  const { width, height } = node.size;
  const centerX = node.position.x + width / 2;
  const centerY = node.position.y + height / 2;

  // Exit from the top boundary (shoot straight up)
  const topPoint = shape.getBoundaryPoint(node, { x: centerX, y: centerY - 1000 });
  // Enter from the right boundary (shoot straight right)
  const rightPoint = shape.getBoundaryPoint(node, { x: centerX + 1000, y: centerY });

  const loopRadius = Math.max(width, height) * 0.6;

  // cp1: curve up-right from the top exit
  const cp1 = { x: topPoint.x + loopRadius, y: topPoint.y - loopRadius };
  // cp2: curve down from the upper-right, arriving into the right entry
  const cp2 = { x: rightPoint.x + loopRadius, y: rightPoint.y - loopRadius };

  const d = `M ${topPoint.x} ${topPoint.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${rightPoint.x} ${rightPoint.y}`;

  // Sample points along the loop arc for bounds calculation
  const points = [topPoint];
  for (let t = 0.25; t <= 0.75; t += 0.25) {
    points.push(bezierPoint(topPoint, cp1, cp2, rightPoint, t));
  }
  points.push(rightPoint);

  return {
    d,
    points,
    sourceIntersection: topPoint,
    targetIntersection: rightPoint,
    // Label sits at the apex of the loop arc (t=0.5)
    labelPosition: bezierPoint(topPoint, cp1, cp2, rightPoint, 0.5),
  };
};

const computeBezierPath = (context: EdgeRouterContext, options?: BezierOptions): EdgePath => {
  const { sourceNode, targetNode, sourcePort, targetPort } = context;

  // Self-loop: source and target are the same node
  if (sourceNode.id === targetNode.id) {
    return computeSelfLoopPath(sourceNode);
  }
  const curvature = options?.curvature ?? 0.5;
  const edgeIndex = options?.edgeIndex ?? 0;
  const totalParallelEdges = options?.totalParallelEdges ?? 1;
  const parallelSpacing = options?.parallelSpacing ?? 15;
  const sourceShape = getShapeOrDefault(sourceNode.shape);
  const targetShape = getShapeOrDefault(targetNode.shape);

  const sourceCenter = {
    x: sourceNode.position.x + sourceNode.size.width / 2,
    y: sourceNode.position.y + sourceNode.size.height / 2,
  };
  const targetCenter = {
    x: targetNode.position.x + targetNode.size.width / 2,
    y: targetNode.position.y + targetNode.size.height / 2,
  };

  const sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, targetCenter);
  const targetIntersection = targetShape.getBoundaryPoint(targetNode, sourceCenter);

  // Compute control points for cubic bezier
  const dx = targetIntersection.x - sourceIntersection.x;
  const dy = targetIntersection.y - sourceIntersection.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = dist * curvature;

  // Angle-based smooth blending (instead of binary horizontal/vertical logic)
  const angle = Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  let cp1: { x: number; y: number };
  let cp2: { x: number; y: number };

  // Port-aware tangent overrides: use port direction to set control point direction
  if (sourcePort?.direction != null) {
    const tangent = directionToTangent(sourcePort.direction);
    cp1 = {
      x: sourceIntersection.x + tangent.x * offset,
      y: sourceIntersection.y + tangent.y * offset,
    };
  } else {
    cp1 = { x: sourceIntersection.x + offset * cos, y: sourceIntersection.y + offset * sin };
  }

  if (targetPort?.direction != null) {
    const tangent = directionToTangent(targetPort.direction);
    cp2 = {
      x: targetIntersection.x + tangent.x * offset,
      y: targetIntersection.y + tangent.y * offset,
    };
  } else {
    cp2 = { x: targetIntersection.x - offset * cos, y: targetIntersection.y - offset * sin };
  }

  // Parallel edge offset: fan edges out perpendicular to the edge direction
  if (totalParallelEdges > 1) {
    const perpX = -sin; // perpendicular to edge direction
    const perpY = cos;
    const centerIndex = (totalParallelEdges - 1) / 2;
    const offsetAmount = (edgeIndex - centerIndex) * parallelSpacing;
    cp1 = { x: cp1.x + perpX * offsetAmount, y: cp1.y + perpY * offsetAmount };
    cp2 = { x: cp2.x + perpX * offsetAmount, y: cp2.y + perpY * offsetAmount };
  }

  const d = `M ${sourceIntersection.x} ${sourceIntersection.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${targetIntersection.x} ${targetIntersection.y}`;

  // Sample points along the bezier for bounds/label positioning
  const points = [sourceIntersection];
  for (let t = 0.25; t <= 0.75; t += 0.25) {
    points.push(bezierPoint(sourceIntersection, cp1, cp2, targetIntersection, t));
  }
  points.push(targetIntersection);

  return {
    d,
    points,
    sourceIntersection,
    targetIntersection,
    labelPosition: bezierPoint(sourceIntersection, cp1, cp2, targetIntersection, 0.5),
  };
};

// Map port direction to a unit tangent vector
const directionToTangent = (direction: 'north' | 'south' | 'east' | 'west'): { x: number; y: number } => {
  switch (direction) {
    case 'north':
      return { x: 0, y: -1 };
    case 'south':
      return { x: 0, y: 1 };
    case 'east':
      return { x: 1, y: 0 };
    case 'west':
      return { x: -1, y: 0 };
  }
};

// Evaluate cubic bezier at parameter t
export const bezierPoint = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
};

export const bezierRouter: EdgeRouter<BezierOptions> = {
  name: 'bezier',
  route: routeBezier,
};
