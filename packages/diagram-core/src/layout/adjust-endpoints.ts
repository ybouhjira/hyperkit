import type { Graph, LayoutResult, NodeId, EdgeId, EdgePath } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';

/**
 * Post-processes edge endpoints to snap from rectangular boundaries
 * to actual shape boundaries using each shape's getBoundaryPoint.
 */
export const adjustEdgeEndpoints = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult
): LayoutResult => {
  const adjustedEdgePaths = new Map<EdgeId, EdgePath>();

  for (const [edgeId, edgePath] of layout.edgePaths) {
    const edge = graph.edges.get(edgeId);
    if (!edge || edgePath.points.length < 2) {
      adjustedEdgePaths.set(edgeId, edgePath);
      continue;
    }

    const points = [...edgePath.points];

    // Adjust source endpoint (first point)
    const sourceNode = graph.nodes.get(edge.source);
    const sourcePos = layout.nodePositions.get(edge.source);
    if (sourceNode && sourcePos) {
      const positionedSource = { ...sourceNode, position: sourcePos };
      const shape = getShapeOrDefault(positionedSource.shape);
      // Direction: from source toward second point
      const secondPoint = points[1]!;
      const newStart = shape.getBoundaryPoint(positionedSource, secondPoint);
      points[0] = newStart;
    }

    // Adjust target endpoint (last point)
    const targetNode = graph.nodes.get(edge.target);
    const targetPos = layout.nodePositions.get(edge.target);
    if (targetNode && targetPos) {
      const positionedTarget = { ...targetNode, position: targetPos };
      const shape = getShapeOrDefault(positionedTarget.shape);
      // Direction: from target toward second-to-last point
      const secondToLast = points[points.length - 2]!;
      const newEnd = shape.getBoundaryPoint(positionedTarget, secondToLast);
      points[points.length - 1] = newEnd;
    }

    // Rebuild SVG path from adjusted points
    const d = pointsToSvgPath(points);

    adjustedEdgePaths.set(edgeId, {
      ...edgePath,
      d,
      points,
      sourceIntersection: points[0]!,
      targetIntersection: points[points.length - 1]!,
    });
  }

  return {
    ...layout,
    edgePaths: adjustedEdgePaths,
  };
};

// Same path generation as dagre - keep consistent
const pointsToSvgPath = (points: ReadonlyArray<{ x: number; y: number }>): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  }
  if (points.length === 3) {
    return `M ${points[0]!.x} ${points[0]!.y} Q ${points[1]!.x} ${points[1]!.y} ${points[2]!.x} ${points[2]!.y}`;
  }
  // For 4+ points, use smooth curves
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const cpx2 = (curr.x + next.x) / 2;
    const cpy2 = (curr.y + next.y) / 2;
    if (i === points.length - 2) {
      // Last segment: end at the actual final point
      d += ` Q ${curr.x} ${curr.y} ${next.x} ${next.y}`;
    } else {
      d += ` Q ${curr.x} ${curr.y} ${cpx2} ${cpy2}`;
    }
  }
  return d;
};
