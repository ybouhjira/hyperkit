/**
 * Pure layout computation helpers for DiagramProvider.
 * These functions compute edge paths and bounds from graph state
 * without any SolidJS reactivity — they are safe to use in effects
 * and are separately testable.
 */
import type { Graph, Node, Edge, NodeId, EdgeId, LayoutResult, EdgePath } from '@ybouhjira/diagram-core';
import { getShapeOrDefault } from '@ybouhjira/diagram-core';

/** Compute a straight-line edge path with shape-boundary-aware endpoints */
export const computeEdgePath = (
  graph: Graph,
  nodePositions: ReadonlyMap<NodeId, { x: number; y: number }>,
  edge: Edge
): EdgePath | null => {
  const sourceNode = graph.nodes.get(edge.source);
  const targetNode = graph.nodes.get(edge.target);
  const sourcePos = nodePositions.get(edge.source);
  const targetPos = nodePositions.get(edge.target);
  if (!sourceNode || !targetNode || !sourcePos || !targetPos) return null;

  const sourceCenter = { x: sourcePos.x + sourceNode.size.width / 2, y: sourcePos.y + sourceNode.size.height / 2 };
  const targetCenter = { x: targetPos.x + targetNode.size.width / 2, y: targetPos.y + targetNode.size.height / 2 };

  const sourceShape = getShapeOrDefault(sourceNode.shape);
  const targetShape = getShapeOrDefault(targetNode.shape);

  const sourcePoint = sourceShape.getBoundaryPoint(
    { ...sourceNode, position: sourcePos } as Node,
    targetCenter
  );
  const targetPoint = targetShape.getBoundaryPoint(
    { ...targetNode, position: targetPos } as Node,
    sourceCenter
  );

  return {
    d: `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`,
    points: [sourcePoint, targetPoint],
    labelPosition: {
      x: (sourcePoint.x + targetPoint.x) / 2,
      y: (sourcePoint.y + targetPoint.y) / 2,
    },
    sourceIntersection: sourcePoint,
    targetIntersection: targetPoint,
  };
};

/** Compute bounds from node positions and sizes */
export const computeBounds = (
  graph: Graph,
  nodePositions: ReadonlyMap<NodeId, { x: number; y: number }>
): { x: number; y: number; width: number; height: number } => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [nodeId, pos] of nodePositions) {
    const node = graph.nodes.get(nodeId);
    if (!node) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + node.size.width);
    maxY = Math.max(maxY, pos.y + node.size.height);
  }
  if (minX === Infinity) return { x: 0, y: 0, width: 100, height: 100 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

/** Recompute edge paths for edges connected to specific nodes */
export const recomputeAffectedEdgePaths = (
  graph: Graph,
  nodePositions: ReadonlyMap<NodeId, { x: number; y: number }>,
  currentEdgePaths: ReadonlyMap<EdgeId, EdgePath>,
  affectedNodeIds: ReadonlyArray<NodeId>
): Map<EdgeId, EdgePath> => {
  const affected = new Set(affectedNodeIds);
  const newPaths = new Map(currentEdgePaths);
  for (const [edgeId, edge] of graph.edges) {
    if (affected.has(edge.source) || affected.has(edge.target)) {
      const path = computeEdgePath(graph, nodePositions, edge);
      if (path) newPaths.set(edgeId, path);
      else newPaths.delete(edgeId);
    }
  }
  return newPaths;
};

/** Build a full layout from graph positions (for undo/redo or paste) */
export const buildLayoutFromGraph = (graph: Graph): LayoutResult => {
  const nodePositions = new Map<NodeId, { x: number; y: number }>();
  for (const [nodeId, node] of graph.nodes) {
    nodePositions.set(nodeId, { x: node.position.x, y: node.position.y });
  }
  const edgePaths = new Map<EdgeId, EdgePath>();
  for (const [edgeId, edge] of graph.edges) {
    const path = computeEdgePath(graph, nodePositions, edge);
    if (path) edgePaths.set(edgeId, path);
  }
  return {
    nodePositions,
    edgePaths,
    bounds: computeBounds(graph, nodePositions),
  };
};
