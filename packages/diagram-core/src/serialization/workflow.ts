import type { Graph, Node, Edge, NodeId, EdgeId, LayoutResult, NodeGroup, PortDirection, NodeStyle, NodeRenderMode, NodeWidget, EdgeLabelPosition, ArrowSpec, EdgeStyle } from '../graph/types';
import { NodeId as NodeIdBrand, EdgeId as EdgeIdBrand, GraphId as GraphIdBrand, PortId as PortIdBrand, GroupId as GroupIdBrand } from '../graph/types';

export interface WorkflowMetadata {
  readonly title?: string;
  readonly description?: string;
  readonly author?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly [key: string]: unknown;
}

export interface SerializedWorkflow {
  readonly version: 1;
  readonly metadata: WorkflowMetadata;
  readonly graph: {
    readonly id: string;
    readonly nodes: ReadonlyArray<SerializedNode>;
    readonly edges: ReadonlyArray<SerializedEdge>;
    readonly metadata?: Record<string, unknown>;
  };
  readonly layout?: {
    readonly nodePositions: Record<string, { x: number; y: number }>;
  };
  readonly groups?: ReadonlyArray<SerializedGroup>;
}

interface SerializedNode {
  readonly id: string;
  readonly data: unknown;
  readonly position: { x: number; y: number };
  readonly size: { width: number; height: number };
  readonly ports: ReadonlyArray<{
    id: string;
    direction: string;
    offset: number;
    dataType?: string;
    maxConnections?: number;
    label?: string;
  }>;
  readonly shape: string;
  readonly label?: string;
  readonly style: Record<string, unknown>;
  readonly renderMode?: string;
  readonly widgets?: ReadonlyArray<Record<string, unknown>>;
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly headerColor?: string;
  readonly bypassed?: boolean;
  readonly muted?: boolean;
  readonly zIndex?: number;
  readonly locked?: boolean;
  readonly metadata?: Record<string, unknown>;
}

interface SerializedEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourcePort?: string;
  readonly targetPort?: string;
  readonly data: unknown;
  readonly label?: { text: string; position: string; offset?: { x: number; y: number } };
  readonly sourceArrow: { type: string; size?: number; fill?: boolean };
  readonly targetArrow: { type: string; size?: number; fill?: boolean };
  readonly style: Record<string, unknown>;
  readonly router?: string;
  readonly metadata?: Record<string, unknown>;
}

interface SerializedGroup {
  readonly id: string;
  readonly label: string;
  readonly nodeIds: ReadonlyArray<string>;
  readonly collapsed: boolean;
  readonly color?: string;
  readonly position?: { x: number; y: number };
  readonly size?: { width: number; height: number };
}

/** Serialize a workflow to JSON-compatible object */
export const serializeWorkflow = (
  graph: Graph,
  layout?: LayoutResult | null,
  groups?: ReadonlyArray<NodeGroup>,
  metadata?: WorkflowMetadata
): SerializedWorkflow => {
  const nodes: SerializedNode[] = [];
  for (const [, node] of graph.nodes) {
    nodes.push({
      id: node.id,
      data: node.data,
      position: { x: node.position.x, y: node.position.y },
      size: { width: node.size.width, height: node.size.height },
      ports: node.ports.map(p => ({
        id: p.id,
        direction: p.direction,
        offset: p.offset,
        dataType: p.dataType,
        maxConnections: p.maxConnections,
        label: p.label,
      })),
      shape: node.shape,
      label: node.label,
      style: { ...node.style } as Record<string, unknown>,
      renderMode: node.renderMode,
      widgets: node.widgets as ReadonlyArray<Record<string, unknown>> | undefined,
      collapsible: node.collapsible,
      collapsed: node.collapsed,
      headerColor: node.headerColor,
      bypassed: node.bypassed,
      muted: node.muted,
      zIndex: node.zIndex,
      locked: node.locked,
      metadata: node.metadata as Record<string, unknown> | undefined,
    });
  }

  const edges: SerializedEdge[] = [];
  for (const [, edge] of graph.edges) {
    edges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
      data: edge.data,
      label: edge.label ? {
        text: edge.label.text,
        position: edge.label.position,
        offset: edge.label.offset,
      } : undefined,
      sourceArrow: { ...edge.sourceArrow },
      targetArrow: { ...edge.targetArrow },
      style: { ...edge.style } as Record<string, unknown>,
      router: edge.router,
      metadata: edge.metadata as Record<string, unknown> | undefined,
    });
  }

  // Build layout positions if available
  let layoutSection: SerializedWorkflow['layout'] | undefined;
  if (layout?.nodePositions) {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const [nodeId, pos] of layout.nodePositions) {
      positions[nodeId] = { x: pos.x, y: pos.y };
    }
    layoutSection = { nodePositions: positions };
  }

  // Build groups section if available
  let groupsSection: ReadonlyArray<SerializedGroup> | undefined;
  if (groups && groups.length > 0) {
    groupsSection = groups.map(g => ({
      id: g.id,
      label: g.label,
      nodeIds: [...g.nodeIds],
      collapsed: g.collapsed,
      color: g.color,
      position: g.position ? { x: g.position.x, y: g.position.y } : undefined,
      size: g.size ? { width: g.size.width, height: g.size.height } : undefined,
    }));
  }

  const result: SerializedWorkflow = {
    version: 1,
    metadata: {
      ...metadata,
      updatedAt: new Date().toISOString(),
      createdAt: metadata?.createdAt ?? new Date().toISOString(),
    },
    graph: {
      id: graph.id,
      nodes,
      edges,
      metadata: graph.metadata as Record<string, unknown> | undefined,
    },
    layout: layoutSection,
    groups: groupsSection,
  };

  return result;
};

/** Deserialize a workflow from JSON */
export const deserializeWorkflow = (json: SerializedWorkflow): {
  graph: Graph;
  layout: LayoutResult | null;
  groups: ReadonlyArray<NodeGroup>;
  metadata: WorkflowMetadata;
} => {
  if (json.version !== 1) {
    throw new Error(`Unsupported workflow version: ${json.version}`);
  }

  const nodes = new Map<NodeId, Node>();
  for (const sNode of json.graph.nodes) {
    const nodeId = NodeIdBrand(sNode.id);
    nodes.set(nodeId, {
      id: nodeId,
      data: sNode.data,
      position: { x: sNode.position.x, y: sNode.position.y },
      size: { width: sNode.size.width, height: sNode.size.height },
      ports: sNode.ports.map(p => ({
        id: PortIdBrand(p.id),
        direction: p.direction as PortDirection,
        offset: p.offset,
        dataType: p.dataType,
        maxConnections: p.maxConnections,
        label: p.label,
      })),
      shape: sNode.shape,
      label: sNode.label,
      style: sNode.style as NodeStyle,
      renderMode: sNode.renderMode as NodeRenderMode | undefined,
      widgets: sNode.widgets as ReadonlyArray<NodeWidget> | undefined,
      collapsible: sNode.collapsible,
      collapsed: sNode.collapsed,
      headerColor: sNode.headerColor,
      bypassed: sNode.bypassed,
      muted: sNode.muted,
      zIndex: sNode.zIndex,
      locked: sNode.locked,
      metadata: sNode.metadata,
    });
  }

  const edges = new Map<EdgeId, Edge>();
  for (const sEdge of json.graph.edges) {
    const edgeId = EdgeIdBrand(sEdge.id);
    edges.set(edgeId, {
      id: edgeId,
      source: NodeIdBrand(sEdge.source),
      target: NodeIdBrand(sEdge.target),
      sourcePort: sEdge.sourcePort ? PortIdBrand(sEdge.sourcePort) : undefined,
      targetPort: sEdge.targetPort ? PortIdBrand(sEdge.targetPort) : undefined,
      data: sEdge.data,
      label: sEdge.label ? {
        text: sEdge.label.text,
        position: sEdge.label.position as EdgeLabelPosition,
        offset: sEdge.label.offset,
      } : undefined,
      sourceArrow: sEdge.sourceArrow as ArrowSpec,
      targetArrow: sEdge.targetArrow as ArrowSpec,
      style: sEdge.style as EdgeStyle,
      router: sEdge.router,
      metadata: sEdge.metadata,
    });
  }

  const graph: Graph = {
    id: GraphIdBrand(json.graph.id),
    nodes,
    edges,
    metadata: json.graph.metadata,
  };

  // Reconstruct layout
  let layout: LayoutResult | null = null;
  if (json.layout?.nodePositions) {
    const nodePositions = new Map<NodeId, { x: number; y: number }>();
    for (const [id, pos] of Object.entries(json.layout.nodePositions)) {
      nodePositions.set(NodeIdBrand(id), { x: pos.x, y: pos.y });
    }
    // Compute edge paths and bounds from positions
    // For now, just store positions - edge paths will be recomputed
    const bounds = computeDeserializedBounds(graph, nodePositions);
    layout = {
      nodePositions,
      edgePaths: new Map(), // Will be recomputed by syncLayout
      bounds,
    };
  }

  // Reconstruct groups
  const groups: NodeGroup[] = (json.groups ?? []).map(g => ({
    id: GroupIdBrand(g.id),
    label: g.label,
    nodeIds: g.nodeIds.map(id => NodeIdBrand(id)),
    collapsed: g.collapsed,
    color: g.color,
    position: g.position,
    size: g.size,
  }));

  return { graph, layout, groups, metadata: json.metadata };
};

const computeDeserializedBounds = (
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

/** Export workflow as JSON string */
export const exportWorkflowJSON = (
  graph: Graph,
  layout?: LayoutResult | null,
  groups?: ReadonlyArray<NodeGroup>,
  metadata?: WorkflowMetadata
): string => {
  return JSON.stringify(serializeWorkflow(graph, layout, groups, metadata), null, 2);
};

/** Import workflow from JSON string */
export const importWorkflowJSON = (jsonString: string): ReturnType<typeof deserializeWorkflow> => {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid workflow JSON: expected an object');
  }
  if (parsed.version === undefined) {
    throw new Error('Invalid workflow JSON: missing version field');
  }
  if (!parsed.graph || !Array.isArray(parsed.graph.nodes) || !Array.isArray(parsed.graph.edges)) {
    throw new Error('Invalid workflow JSON: missing or invalid graph structure');
  }
  return deserializeWorkflow(parsed);
};
