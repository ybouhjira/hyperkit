import { Effect } from 'effect';
import type {
  Graph,
  Node,
  Edge,
  NodeId,
  EdgeId,
  GraphId,
  Port,
  PortId,
  ConnectionValidator,
} from './types';
import { NodeId as NodeIdBrand, EdgeId as EdgeIdBrand, GraphId as GraphIdBrand } from './types';
import {
  NodeNotFoundError,
  EdgeNotFoundError,
  DuplicateNodeError,
  DuplicateEdgeError,
  InvalidEdgeError,
  GraphError,
  CycleDetectedError,
  PortNotFoundError,
  ValidationError,
} from '../errors';

// Create an empty graph
export const emptyGraph = <ND = unknown, ED = unknown>(id?: string): Graph<ND, ED> => ({
  id: GraphIdBrand(id ?? crypto.randomUUID()),
  nodes: new Map(),
  edges: new Map(),
});

// Add a node to the graph
export const addNode = <ND, ED>(
  graph: Graph<ND, ED>,
  node: Node<ND>
): Effect.Effect<Graph<ND, ED>, DuplicateNodeError> =>
  graph.nodes.has(node.id)
    ? Effect.fail(new DuplicateNodeError({ nodeId: node.id }))
    : Effect.succeed({
        ...graph,
        nodes: new Map([...graph.nodes, [node.id, node]]),
      });

// Remove a node and all connected edges
export const removeNode = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  if (!graph.nodes.has(nodeId)) {
    return Effect.fail(new NodeNotFoundError({ nodeId }));
  }
  const newNodes = new Map(graph.nodes);
  newNodes.delete(nodeId);
  // Remove all edges connected to this node
  const newEdges = new Map<EdgeId, Edge<ED>>();
  for (const [id, edge] of graph.edges) {
    if (edge.source !== nodeId && edge.target !== nodeId) {
      newEdges.set(id, edge);
    }
  }
  return Effect.succeed({ ...graph, nodes: newNodes, edges: newEdges });
};

// Update a node (partial update of properties)
export const updateNode = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId,
  update: Partial<Omit<Node<ND>, 'id'>>
): Effect.Effect<Graph<ND, ED>, NodeNotFoundError> => {
  const existing = graph.nodes.get(nodeId);
  if (!existing) {
    return Effect.fail(new NodeNotFoundError({ nodeId }));
  }
  const updated = { ...existing, ...update } as Node<ND>;
  const newNodes = new Map(graph.nodes);
  newNodes.set(nodeId, updated);
  return Effect.succeed({ ...graph, nodes: newNodes });
};

// Add an edge (validates source/target nodes exist)
export const addEdge = <ND, ED>(
  graph: Graph<ND, ED>,
  edge: Edge<ED>
): Effect.Effect<Graph<ND, ED>, DuplicateEdgeError | InvalidEdgeError> => {
  if (graph.edges.has(edge.id)) {
    return Effect.fail(new DuplicateEdgeError({ edgeId: edge.id }));
  }
  if (!graph.nodes.has(edge.source)) {
    return Effect.fail(
      new InvalidEdgeError({ edgeId: edge.id, reason: `Source node ${edge.source} not found` })
    );
  }
  if (!graph.nodes.has(edge.target)) {
    return Effect.fail(
      new InvalidEdgeError({ edgeId: edge.id, reason: `Target node ${edge.target} not found` })
    );
  }
  return Effect.succeed({
    ...graph,
    edges: new Map([...graph.edges, [edge.id, edge]]),
  });
};

// Remove an edge
export const removeEdge = <ND, ED>(
  graph: Graph<ND, ED>,
  edgeId: EdgeId
): Effect.Effect<Graph<ND, ED>, EdgeNotFoundError> => {
  if (!graph.edges.has(edgeId)) {
    return Effect.fail(new EdgeNotFoundError({ edgeId }));
  }
  const newEdges = new Map(graph.edges);
  newEdges.delete(edgeId);
  return Effect.succeed({ ...graph, edges: newEdges });
};

// Update an edge
export const updateEdge = <ND, ED>(
  graph: Graph<ND, ED>,
  edgeId: EdgeId,
  update: Partial<Omit<Edge<ED>, 'id'>>
): Effect.Effect<Graph<ND, ED>, EdgeNotFoundError> => {
  const existing = graph.edges.get(edgeId);
  if (!existing) {
    return Effect.fail(new EdgeNotFoundError({ edgeId }));
  }
  const updated = { ...existing, ...update } as Edge<ED>;
  const newEdges = new Map(graph.edges);
  newEdges.set(edgeId, updated);
  return Effect.succeed({ ...graph, edges: newEdges });
};

// Merge two graphs
export const mergeGraphs = <ND, ED>(
  a: Graph<ND, ED>,
  b: Graph<ND, ED>
): Graph<ND, ED> => ({
  id: a.id,
  nodes: new Map([...a.nodes, ...b.nodes]),
  edges: new Map([...a.edges, ...b.edges]),
  metadata: { ...a.metadata, ...b.metadata },
});

// Get subgraph containing only specified nodes and their connecting edges
export const subgraph = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeIds: ReadonlySet<NodeId>
): Graph<ND, ED> => {
  const newNodes = new Map<NodeId, Node<ND>>();
  for (const id of nodeIds) {
    const node = graph.nodes.get(id);
    if (node) newNodes.set(id, node);
  }
  const newEdges = new Map<EdgeId, Edge<ED>>();
  for (const [id, edge] of graph.edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      newEdges.set(id, edge);
    }
  }
  return { ...graph, nodes: newNodes, edges: newEdges };
};

// Get neighbors of a node
export const getNeighbors = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId
): Effect.Effect<ReadonlySet<NodeId>, NodeNotFoundError> => {
  if (!graph.nodes.has(nodeId)) {
    return Effect.fail(new NodeNotFoundError({ nodeId }));
  }
  const neighbors = new Set<NodeId>();
  for (const edge of graph.edges.values()) {
    if (edge.source === nodeId) neighbors.add(edge.target);
    if (edge.target === nodeId) neighbors.add(edge.source);
  }
  return Effect.succeed(neighbors);
};

// Get all edges connected to a node
export const getConnectedEdges = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId
): Effect.Effect<ReadonlyArray<Edge<ED>>, NodeNotFoundError> => {
  if (!graph.nodes.has(nodeId)) {
    return Effect.fail(new NodeNotFoundError({ nodeId }));
  }
  const connected: Edge<ED>[] = [];
  for (const edge of graph.edges.values()) {
    if (edge.source === nodeId || edge.target === nodeId) {
      connected.push(edge);
    }
  }
  return Effect.succeed(connected);
};

// Topological sort (Kahn's algorithm) - returns ordered node IDs or fails if cycle detected
export const topologicalSort = <ND, ED>(
  graph: Graph<ND, ED>
): Effect.Effect<ReadonlyArray<NodeId>, CycleDetectedError> => {
  const inDegree = new Map<NodeId, number>();
  for (const nodeId of graph.nodes.keys()) {
    inDegree.set(nodeId, 0);
  }
  for (const edge of graph.edges.values()) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: NodeId[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  const sorted: NodeId[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);
    for (const edge of graph.edges.values()) {
      if (edge.source === nodeId) {
        const newDegree = (inDegree.get(edge.target) ?? 1) - 1;
        inDegree.set(edge.target, newDegree);
        if (newDegree === 0) queue.push(edge.target);
      }
    }
  }

  if (sorted.length !== graph.nodes.size) {
    // Find nodes in cycle
    const cycleNodes = [...graph.nodes.keys()].filter((id) => !sorted.includes(id));
    return Effect.fail(new CycleDetectedError({ nodeIds: cycleNodes }));
  }

  return Effect.succeed(sorted);
};

// Detect cycles - returns true if graph has cycles
export const detectCycles = <ND, ED>(
  graph: Graph<ND, ED>
): Effect.Effect<boolean, never> =>
  Effect.map(Effect.either(topologicalSort(graph)), (either) => either._tag === 'Left');

// Helper: Create a node with defaults.
// Spreads `options` last so any new optional field on `Node` is forwarded
// automatically — previously several fields (renderMode, widgets, bypassed,
// muted, groupId, collapsed, collapsible) were silently dropped because they
// weren't enumerated here.
export const createNode = <D = unknown>(
  id: string,
  data: D,
  options?: Partial<Omit<Node<D>, 'id' | 'data'>>
): Node<D> => ({
  position: { x: 0, y: 0 },
  size: { width: 150, height: 50 },
  ports: [],
  shape: 'rectangle',
  style: {},
  ...options,
  id: NodeIdBrand(id),
  data,
});

// Helper: Create an edge with defaults.
// Spreads `options` last so any optional field on `Edge` is forwarded
// automatically — previously sourcePort/targetPort (and any future field)
// were silently dropped because they weren't enumerated here, which broke
// port-to-port wiring for every consumer building graphs via this helper.
// Mirrors the identical fix already applied to `createNode` above.
export const createEdge = <D = unknown>(
  id: string,
  source: string,
  target: string,
  data: D,
  options?: Partial<Omit<Edge<D>, 'id' | 'source' | 'target' | 'data'>>
): Edge<D> => ({
  sourceArrow: { type: 'none' },
  targetArrow: { type: 'triangle' },
  style: {},
  ...options,
  id: EdgeIdBrand(id),
  source: NodeIdBrand(source),
  target: NodeIdBrand(target),
  data,
});

// Get a specific port from a node
export const getPort = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId,
  portId: PortId
): Effect.Effect<Port, NodeNotFoundError | PortNotFoundError> => {
  const node = graph.nodes.get(nodeId);
  if (!node) return Effect.fail(new NodeNotFoundError({ nodeId }));
  const port = node.ports.find(p => p.id === portId);
  if (!port) return Effect.fail(new PortNotFoundError({ portId, nodeId }));
  return Effect.succeed(port);
};

// Get all edges connected to a specific port
// Get all edges connected to a specific port on a specific node
export const getPortConnections = <ND, ED>(
  graph: Graph<ND, ED>,
  nodeId: NodeId,
  portId: PortId
): ReadonlyArray<Edge<ED>> => {
  const result: Edge<ED>[] = [];
  for (const edge of graph.edges.values()) {
    if ((edge.source === nodeId && edge.sourcePort === portId) ||
        (edge.target === nodeId && edge.targetPort === portId)) {
      result.push(edge);
    }
  }
  return result;
};

// Check if a connection between two ports is valid
export const canConnect = <ND, ED>(
  graph: Graph<ND, ED>,
  sourceNodeId: NodeId,
  sourcePortId: PortId,
  targetNodeId: NodeId,
  targetPortId: PortId,
  validator?: ConnectionValidator
): Effect.Effect<boolean, NodeNotFoundError | PortNotFoundError | ValidationError> => {
  if (sourceNodeId === targetNodeId) return Effect.succeed(false);

  return Effect.gen(function* () {
    const sourcePort = yield* getPort(graph, sourceNodeId, sourcePortId);
    const targetPort = yield* getPort(graph, targetNodeId, targetPortId);

    if (validator) {
      return yield* validator(sourcePort, targetPort, graph);
    }
    return true;
  });
};

// Find the node that owns a specific port
export const findPortOwner = <ND, ED>(
  graph: Graph<ND, ED>,
  portId: PortId
): { nodeId: NodeId; port: Port } | undefined => {
  for (const [nodeId, node] of graph.nodes) {
    const port = node.ports.find(p => p.id === portId);
    if (port) return { nodeId, port };
  }
  return undefined;
};
