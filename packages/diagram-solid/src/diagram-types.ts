/**
 * TypeScript interfaces for the diagram SolidJS bindings.
 * Defines the shape of the reactive store (DiagramState), the public
 * action surface (DiagramActions), the context value, and provider props.
 */
import type {
  Graph, Node, Edge, NodeId, EdgeId, PortId, LayoutResult,
  LayoutAlgorithm, EdgeRouter, InteractionMode, GridConfig,
  SelectionBox, DragState, DrawEdgeState,
  PortConnectionState, ConnectionValidator, MenuContext, NodeGroup, GroupId,
} from '@ybouhjira/diagram-core';
import type { ViewportController } from '@ybouhjira/diagram-svg';

// ─── Reactive store shape ────────────────────────────────────────────────────

export interface DiagramState {
  graph: Graph;
  layout: LayoutResult | null;
  selectedNodes: Set<NodeId>;
  selectedEdges: Set<EdgeId>;
  layoutAlgorithm: LayoutAlgorithm<unknown> | null;
  layoutOptions: unknown;
  isLayouting: boolean;
  editable: boolean;
  interactionMode: InteractionMode;
  history: ReadonlyArray<Graph>;
  historyIndex: number;
  clipboard: { nodes: ReadonlyArray<Node>; edges: ReadonlyArray<Edge> } | null;
  gridConfig: GridConfig;
  dragState: DragState | null;
  drawEdgeState: DrawEdgeState | null;
  selectionBox: SelectionBox | null;
  portConnectionState: PortConnectionState | null;
  connectionValidator: ConnectionValidator | null;
  nodePaletteOpen: boolean;
  nodePalettePosition: { x: number; y: number } | null;
  nodePaletteFilterPort: { nodeId: NodeId; portId: PortId } | null;
  contextMenu: MenuContext | null;
  contextMenuScreenPos: { x: number; y: number } | null;
  groups: ReadonlyArray<NodeGroup>;
  viewportBounds: { x: number; y: number; width: number; height: number } | null;
  alignmentGuides: ReadonlyArray<import('@ybouhjira/diagram-core').AlignmentGuide>;
  snapToAlignEnabled: boolean;
  /**
   * Fine-grained node position record for hot-path drag updates.
   * Mirrors layout.nodePositions but stored as a plain Record so SolidJS
   * store can track individual property changes without a full layout replace.
   * Internal use only — consumers should read layout.nodePositions.
   */
  _nodePositions: Record<string, { x: number; y: number }>;
  /**
   * Fine-grained edge path record for hot-path drag updates.
   * Mirrors layout.edgePaths[id].d but stored as a plain Record.
   * Internal use only — consumers should read layout.edgePaths.
   */
  _edgePaths: Record<string, string>;
  /**
   * Monotonically incrementing counter — bumped only on structural graph
   * changes (add/remove node or edge, undo/redo, paste, load).
   * Diagram.tsx Effect 1 tracks this to know when a full SVG rebuild is needed.
   * Drag moves do NOT bump this counter.
   */
  _structuralVersion: number;
}

// ─── Public action surface ───────────────────────────────────────────────────

export interface DiagramActions {
  addNode: (node: Node) => void;
  removeNode: (nodeId: NodeId) => void;
  updateNode: (nodeId: NodeId, update: Partial<Omit<Node, 'id'>>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: EdgeId) => void;
  setGraph: (graph: Graph) => void;
  setLayoutAlgorithm: (algorithm: LayoutAlgorithm<unknown>) => void;
  runLayout: () => Promise<void>;
  selectNode: (nodeId: NodeId, multi?: boolean) => void;
  deselectAll: () => void;
  selectEdge: (edgeId: EdgeId, multi?: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: (padding?: number) => void;
  fitViewToContent: (padding?: number) => void;
  resetView: () => void;
  setEditable: (editable: boolean) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  moveNodes: (nodeIds: ReadonlyArray<NodeId>, dx: number, dy: number) => void;
  resizeNode: (nodeId: NodeId, width: number, height: number) => void;
  updateNodeLabel: (nodeId: NodeId, label: string) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  copy: () => void;
  cut: () => void;
  paste: (offset?: { dx: number; dy: number }) => void;
  duplicate: () => void;
  setGridSnap: (enabled: boolean, size?: number) => void;
  startDrag: (dragState: DragState) => void;
  updateDrag: (lastCursorX: number, lastCursorY: number) => void;
  endDrag: () => void;
  startDrawEdge: (sourceNodeId: NodeId, x: number, y: number) => void;
  updateDrawEdge: (x: number, y: number) => void;
  completeDrawEdge: (targetNodeId: NodeId) => void;
  cancelDrawEdge: () => void;
  setSelectionBox: (box: SelectionBox | null) => void;
  selectNodesInBox: (box: SelectionBox) => void;

  // Port connection actions
  startPortConnection: (nodeId: NodeId, portId: PortId, x: number, y: number) => void;
  updatePortConnection: (x: number, y: number) => void;
  completePortConnection: (targetNodeId: NodeId, targetPortId: PortId) => void;
  cancelPortConnection: () => void;
  disconnectPort: (nodeId: NodeId, portId: PortId) => void;

  // Group actions
  createGroup: (nodeIds: ReadonlyArray<NodeId>, label: string, color?: string) => void;
  removeGroup: (groupId: GroupId) => void;
  addNodesToGroup: (groupId: GroupId, nodeIds: ReadonlyArray<NodeId>) => void;
  removeNodesFromGroup: (groupId: GroupId, nodeIds: ReadonlyArray<NodeId>) => void;
  toggleGroupCollapsed: (groupId: GroupId) => void;
  updateGroupLabel: (groupId: GroupId, label: string) => void;

  // Node palette actions
  openNodePalette: (position: { x: number; y: number }, filterPort?: { nodeId: NodeId; portId: PortId }) => void;
  closeNodePalette: () => void;
  createNodeFromPalette: (nodeType: string, position: { x: number; y: number }) => void;

  // Context menu actions
  openContextMenu: (context: MenuContext, screenPos?: { x: number; y: number }) => void;
  closeContextMenu: () => void;

  // Bypass/Mute actions
  toggleNodeBypassed: (nodeId: NodeId) => void;
  toggleNodeMuted: (nodeId: NodeId) => void;

  // Viewport tracking
  setViewportBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;

  // Snap-to-align
  setSnapToAlign: (enabled: boolean) => void;
}

// ─── Context value and provider props ───────────────────────────────────────

export interface DiagramContextValue {
  state: DiagramState;
  actions: DiagramActions;
  _registerViewport: (controller: ViewportController | undefined) => void;
}

export interface DiagramProviderProps {
  initialGraph?: Graph;
  /**
   * Node groups present at mount. Enables fully-declarative layered diagrams
   * — the graph + its hierarchy are available to the first layout pass, so
   * there is no onMount flicker from retroactively creating groups.
   */
  initialGroups?: ReadonlyArray<NodeGroup>;
  layoutAlgorithm?: LayoutAlgorithm<unknown>;
  /**
   * Options forwarded to `layoutAlgorithm.layout(graph, options)` on every
   * layout pass. Shape is algorithm-specific — kept as `unknown` here because
   * the provider is generic over any algorithm. Authors pass a correctly-typed
   * object for the algorithm they chose.
   */
  layoutOptions?: unknown;
  onLayoutComplete?: (result: LayoutResult) => void;
  onError?: (error: unknown) => void;
  editable?: boolean;
  gridConfig?: GridConfig;
  maxHistorySize?: number;
  connectionValidator?: ConnectionValidator;
  onPortConnect?: (sourceNodeId: NodeId, sourcePortId: PortId, targetNodeId: NodeId, targetPortId: PortId) => void;
  onWidgetChange?: (nodeId: NodeId, widgetId: string, value: unknown) => void;
}

// Re-export EdgeRouter for consumers who import it from diagram-types
export type { EdgeRouter };
