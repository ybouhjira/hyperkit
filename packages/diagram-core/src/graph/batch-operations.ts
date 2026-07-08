import { Effect } from 'effect';
import type { Graph, Node, Edge, NodeId, EdgeId, PortId } from './types';
import { NodeNotFoundError, EdgeNotFoundError, DuplicateNodeError, DuplicateEdgeError, InvalidEdgeError } from '../errors';
import { addNode, addEdge, updateNode, removeNode, removeEdge } from './operations';

/** Move multiple nodes by a delta, preserving relative positions */
export const moveNodes = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeIds: ReadonlyArray<NodeId>,
  delta: { readonly dx: number; readonly dy: number }
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  for (const nodeId of nodeIds) {
    if (!graph.nodes.has(nodeId)) return Effect.fail(new NodeNotFoundError({ nodeId }));
  }
  const newNodes = new Map(graph.nodes);
  for (const nodeId of nodeIds) {
    const node = newNodes.get(nodeId)!;
    newNodes.set(nodeId, {
      ...node,
      position: {
        x: node.position.x + delta.dx,
        y: node.position.y + delta.dy,
      },
    });
  }
  return Effect.succeed({ ...graph, nodes: newNodes });
};

/** Resize a node */
export const resizeNode = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId,
  size: { readonly width: number; readonly height: number }
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  const node = graph.nodes.get(nodeId);
  if (!node) return Effect.fail(new NodeNotFoundError({ nodeId }));
  const newNodes = new Map(graph.nodes);
  newNodes.set(nodeId, { ...node, size });
  return Effect.succeed({ ...graph, nodes: newNodes });
};

/** Update a node's label */
export const updateNodeLabel = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId,
  label: string
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  const node = graph.nodes.get(nodeId);
  if (!node) return Effect.fail(new NodeNotFoundError({ nodeId }));
  const newNodes = new Map(graph.nodes);
  newNodes.set(nodeId, { ...node, label });
  return Effect.succeed({ ...graph, nodes: newNodes });
};

/** Update an edge's label */
export const updateEdgeLabel = <ND, ED>(
  graph: Graph<ND, ED>,
  edgeId: EdgeId,
  text: string
): Effect.Effect<Graph<ND, ED>, EdgeNotFoundError> => {
  const edge = graph.edges.get(edgeId);
  if (!edge) return Effect.fail(new EdgeNotFoundError({ edgeId }));
  const newEdges = new Map(graph.edges);
  newEdges.set(edgeId, {
    ...edge,
    label: { text, position: edge.label?.position ?? 'center' },
  });
  return Effect.succeed({ ...graph, edges: newEdges });
};

/** Reconnect an edge to different source/target */
export const reconnectEdge = <ND, ED>(
  graph: Graph<ND, ED>,
  edgeId: EdgeId,
  updates: { readonly source?: NodeId; readonly target?: NodeId }
): Effect.Effect<Graph<ND, ED>, EdgeNotFoundError | InvalidEdgeError> => {
  const edge = graph.edges.get(edgeId);
  if (!edge) return Effect.fail(new EdgeNotFoundError({ edgeId }));
  const newSource = updates.source ?? edge.source;
  const newTarget = updates.target ?? edge.target;
  if (!graph.nodes.has(newSource) || !graph.nodes.has(newTarget)) {
    return Effect.fail(new InvalidEdgeError({ edgeId, reason: 'Node not found' }));
  }
  const newEdges = new Map(graph.edges);
  newEdges.set(edgeId, { ...edge, source: newSource, target: newTarget });
  return Effect.succeed({ ...graph, edges: newEdges });
};

/** Add multiple nodes at once */
export const addNodes = <ND, ED>(
  graph: Graph<ND, ED>,
  nodes: ReadonlyArray<Node<ND>>
): Effect.Effect<Graph<ND, ED>, DuplicateNodeError> => {
  let current: Effect.Effect<Graph<ND, ED>, DuplicateNodeError> = Effect.succeed(graph);
  for (const node of nodes) {
    current = Effect.flatMap(current, (g) => addNode(g, node));
  }
  return current;
};

/** Add multiple edges at once */
export const addEdges = <ND, ED>(
  graph: Graph<ND, ED>,
  edges: ReadonlyArray<Edge<ED>>
): Effect.Effect<Graph<ND, ED>, DuplicateEdgeError | InvalidEdgeError> => {
  let current: Effect.Effect<Graph<ND, ED>, DuplicateEdgeError | InvalidEdgeError> = Effect.succeed(graph);
  for (const edge of edges) {
    current = Effect.flatMap(current, (g) => addEdge(g, edge));
  }
  return current;
};

/** Remove multiple nodes and their connected edges */
export const removeNodes = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeIds: ReadonlyArray<NodeId>
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  let current: Effect.Effect<Graph<ND, ED>, NodeNotFoundError> = Effect.succeed(graph);
  for (const nodeId of nodeIds) {
    current = Effect.flatMap(current, (g) => removeNode(g, nodeId));
  }
  return current;
};

/** Remove multiple edges */
export const removeEdges = <ND, ED>(
  graph: Graph<ND, ED>,
  edgeIds: ReadonlyArray<EdgeId>
): Effect.Effect<Graph<ND, ED>, EdgeNotFoundError> => {
  let current: Effect.Effect<Graph<ND, ED>, EdgeNotFoundError> = Effect.succeed(graph);
  for (const edgeId of edgeIds) {
    current = Effect.flatMap(current, (g) => removeEdge(g, edgeId));
  }
  return current;
};

/** Clone a subgraph (selected nodes + their connecting edges), offset positions */
export const cloneSubgraph = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeIds: ReadonlyArray<NodeId>,
  offset: { readonly dx: number; readonly dy: number } = { dx: 50, dy: 50 }
): { nodes: ReadonlyArray<Node<ND>>; edges: ReadonlyArray<Edge<ED>> } => {
  const idMap = new Map<NodeId, NodeId>();
  const newNodes: Node<ND>[] = [];

  for (const nodeId of nodeIds) {
    const node = graph.nodes.get(nodeId);
    if (!node) continue;
    const newId = `${nodeId}-copy-${Date.now()}` as NodeId;
    idMap.set(nodeId, newId);
    newNodes.push({
      ...node,
      id: newId,
      position: {
        x: node.position.x + offset.dx,
        y: node.position.y + offset.dy,
      },
    });
  }

  const nodeIdSet = new Set(nodeIds);
  const newEdges: Edge<ED>[] = [];
  for (const [edgeId, edge] of graph.edges) {
    if (nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)) {
      const newSource = idMap.get(edge.source);
      const newTarget = idMap.get(edge.target);
      if (newSource && newTarget) {
        newEdges.push({
          ...edge,
          id: `${edgeId}-copy-${Date.now()}` as EdgeId,
          source: newSource,
          target: newTarget,
        });
      }
    }
  }

  return { nodes: newNodes, edges: newEdges };
};

/** Find all nodes within a selection box */
export const nodesInBox = <ND, ED>(
  graph: Graph<ND, ED>,
  nodePositions: ReadonlyMap<NodeId, { x: number; y: number }>,
  box: { x: number; y: number; width: number; height: number }
): ReadonlyArray<NodeId> => {
  const result: NodeId[] = [];
  for (const [nodeId, node] of graph.nodes) {
    const pos = nodePositions.get(nodeId) ?? node.position;
    if (
      pos.x >= box.x &&
      pos.y >= box.y &&
      pos.x + node.size.width <= box.x + box.width &&
      pos.y + node.size.height <= box.y + box.height
    ) {
      result.push(nodeId);
    }
  }
  return result;
};

/** Snap a value to a grid */
export const snapToGrid = (value: number, gridSize: number): number => {
  const sign = value < 0 ? -1 : 1;
  const absValue = Math.abs(value);
  const snapped = Math.round(absValue / gridSize) * gridSize;
  return sign * snapped;
};
