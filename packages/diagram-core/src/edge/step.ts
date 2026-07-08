import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';

export interface StepOptions {
  readonly offset?: number; // distance of the step from the node boundary, default 20
  readonly borderRadius?: number; // rounded corners, 0 = sharp, default 0
}

const routeStep = (context: EdgeRouterContext, options?: StepOptions): Effect.Effect<EdgePath, never> =>
  Effect.succeed(computeStepPath(context, options));

const computeStepPath = (context: EdgeRouterContext, options?: StepOptions): EdgePath => {
  const { sourceNode, targetNode } = context;
  const stepOffset = options?.offset ?? 20;
  const borderRadius = options?.borderRadius ?? 0;
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

  // Determine exit/entry direction based on relative positions
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourceIntersection: { x: number; y: number };
  let targetIntersection: { x: number; y: number };
  const waypoints: Array<{ x: number; y: number }> = [];

  if (Math.abs(dy) > Math.abs(dx)) {
    // Vertical dominant: exit from bottom/top
    if (dy > 0) {
      // Source above target
      sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, { x: sourceCenter.x, y: sourceCenter.y + 1000 });
      targetIntersection = targetShape.getBoundaryPoint(targetNode, { x: targetCenter.x, y: targetCenter.y - 1000 });
      const midY = (sourceIntersection.y + targetIntersection.y) / 2;
      waypoints.push({ x: sourceIntersection.x, y: midY });
      waypoints.push({ x: targetIntersection.x, y: midY });
    } else {
      // Source below target
      sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, { x: sourceCenter.x, y: sourceCenter.y - 1000 });
      targetIntersection = targetShape.getBoundaryPoint(targetNode, { x: targetCenter.x, y: targetCenter.y + 1000 });
      const midY = (sourceIntersection.y + targetIntersection.y) / 2;
      waypoints.push({ x: sourceIntersection.x, y: midY });
      waypoints.push({ x: targetIntersection.x, y: midY });
    }
  } else {
    // Horizontal dominant: exit from right/left
    if (dx > 0) {
      sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, { x: sourceCenter.x + 1000, y: sourceCenter.y });
      targetIntersection = targetShape.getBoundaryPoint(targetNode, { x: targetCenter.x - 1000, y: targetCenter.y });
      const midX = (sourceIntersection.x + targetIntersection.x) / 2;
      waypoints.push({ x: midX, y: sourceIntersection.y });
      waypoints.push({ x: midX, y: targetIntersection.y });
    } else {
      sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, { x: sourceCenter.x - 1000, y: sourceCenter.y });
      targetIntersection = targetShape.getBoundaryPoint(targetNode, { x: targetCenter.x + 1000, y: targetCenter.y });
      const midX = (sourceIntersection.x + targetIntersection.x) / 2;
      waypoints.push({ x: midX, y: sourceIntersection.y });
      waypoints.push({ x: midX, y: targetIntersection.y });
    }
  }

  const allPoints = [sourceIntersection, ...waypoints, targetIntersection];

  let d: string;
  if (borderRadius > 0) {
    d = buildRoundedStepPath(allPoints, borderRadius);
  } else {
    d = allPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }

  return {
    d,
    points: allPoints,
    sourceIntersection,
    targetIntersection,
    labelPosition: {
      x: (sourceIntersection.x + targetIntersection.x) / 2,
      y: (sourceIntersection.y + targetIntersection.y) / 2,
    },
  };
};

const buildRoundedStepPath = (
  points: ReadonlyArray<{ x: number; y: number }>,
  radius: number
): string => {
  if (points.length < 2) return '';
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };

    const lenPrev = Math.sqrt(toPrev.x ** 2 + toPrev.y ** 2);
    const lenNext = Math.sqrt(toNext.x ** 2 + toNext.y ** 2);

    const r = Math.min(radius, lenPrev / 2, lenNext / 2);

    const arcStart = {
      x: curr.x + (toPrev.x / lenPrev) * r,
      y: curr.y + (toPrev.y / lenPrev) * r,
    };
    const arcEnd = {
      x: curr.x + (toNext.x / lenNext) * r,
      y: curr.y + (toNext.y / lenNext) * r,
    };

    d += ` L ${arcStart.x} ${arcStart.y}`;
    d += ` Q ${curr.x} ${curr.y} ${arcEnd.x} ${arcEnd.y}`;
  }

  const last = points[points.length - 1]!;
  d += ` L ${last.x} ${last.y}`;
  return d;
};

export const stepRouter: EdgeRouter<StepOptions> = {
  name: 'step',
  route: routeStep,
};
