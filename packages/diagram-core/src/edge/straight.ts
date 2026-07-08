import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';

const routeStraight = (context: EdgeRouterContext): Effect.Effect<EdgePath, never> =>
  Effect.succeed(computeStraightPath(context));

const computeStraightPath = (context: EdgeRouterContext): EdgePath => {
  const { sourceNode, targetNode } = context;
  const sourceShape = getShapeOrDefault(sourceNode.shape);
  const targetShape = getShapeOrDefault(targetNode.shape);

  // Get center of each node
  const sourceCenter = {
    x: sourceNode.position.x + sourceNode.size.width / 2,
    y: sourceNode.position.y + sourceNode.size.height / 2,
  };
  const targetCenter = {
    x: targetNode.position.x + targetNode.size.width / 2,
    y: targetNode.position.y + targetNode.size.height / 2,
  };

  // Get boundary intersection points
  const sourceIntersection = sourceShape.getBoundaryPoint(sourceNode, targetCenter);
  const targetIntersection = targetShape.getBoundaryPoint(targetNode, sourceCenter);

  const points = [sourceIntersection, targetIntersection];
  const d = `M ${sourceIntersection.x} ${sourceIntersection.y} L ${targetIntersection.x} ${targetIntersection.y}`;

  return {
    d,
    points,
    sourceIntersection,
    targetIntersection,
    labelPosition: {
      x: (sourceIntersection.x + targetIntersection.x) / 2,
      y: (sourceIntersection.y + targetIntersection.y) / 2,
    },
  };
};

export const straightRouter: EdgeRouter = {
  name: 'straight',
  route: routeStraight,
};
