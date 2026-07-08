import { Brand } from 'effect';

// Branded ID types
export type NodeId = string & Brand.Brand<'NodeId'>;
export type EdgeId = string & Brand.Brand<'EdgeId'>;
export type PortId = string & Brand.Brand<'PortId'>;
export type GraphId = string & Brand.Brand<'GraphId'>;

export const NodeId = Brand.nominal<NodeId>();
export const EdgeId = Brand.nominal<EdgeId>();
export const PortId = Brand.nominal<PortId>();
export const GraphId = Brand.nominal<GraphId>();

// Direction for ports
export type PortDirection = 'north' | 'south' | 'east' | 'west';

// Port - connection point on a node
export interface Port {
  readonly id: PortId;
  readonly direction: PortDirection;
  readonly offset: number; // 0-1 along the edge in that direction
  readonly dataType?: string; // for typed connections in node editors
  readonly maxConnections?: number; // 1 = single input, Infinity = unlimited
  readonly label?: string;
}

// Node style
export interface NodeStyle {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly borderRadius?: number;
  readonly shadow?: boolean;
  readonly cssClass?: string;
}

// Edge style
export interface EdgeStyle {
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly opacity?: number;
  readonly animated?: boolean;
  readonly cssClass?: string;
}

// Arrow head types
export type ArrowHeadType = 'none' | 'triangle' | 'diamond' | 'circle' | 'vee' | 'tee';

// Arrow specification
export interface ArrowSpec {
  readonly type: ArrowHeadType;
  readonly size?: number;
  readonly fill?: boolean; // filled or outlined
}

// Label position on an edge
export type EdgeLabelPosition = 'start' | 'center' | 'end';

// Edge label
export interface EdgeLabel {
  readonly text: string;
  readonly position: EdgeLabelPosition;
  readonly offset?: { x: number; y: number };
}

// Node - generic with typed data payload
export interface Node<D = unknown> {
  readonly id: NodeId;
  readonly data: D;
  readonly position: { readonly x: number; readonly y: number };
  readonly size: { readonly width: number; readonly height: number };
  readonly ports: ReadonlyArray<Port>;
  readonly shape: string; // references shape registry
  readonly label?: string;
  readonly style: NodeStyle;
  readonly zIndex?: number;
  readonly locked?: boolean; // prevent dragging
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly renderMode?: NodeRenderMode;
  readonly widgets?: ReadonlyArray<NodeWidget>;
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly groupId?: GroupId;
  readonly bypassed?: boolean;
  readonly muted?: boolean;
  readonly headerColor?: string;
  /** Secondary text below the main label */
  readonly subtitle?: string;
  /** Icon — emoji string (e.g. "📦") or icon name */
  readonly icon?: string;
  /** Badge text (e.g. "active", "73%", "v2.1") */
  readonly badge?: string;
  /** Badge color — defaults to accent color */
  readonly badgeColor?: string;
  /** Category key for automatic color-coding by preset palettes */
  readonly category?: string;
}

// Edge - generic with typed data payload
export interface Edge<D = unknown> {
  readonly id: EdgeId;
  readonly source: NodeId;
  readonly target: NodeId;
  readonly sourcePort?: PortId;
  readonly targetPort?: PortId;
  readonly data: D;
  readonly label?: EdgeLabel;
  readonly sourceArrow: ArrowSpec;
  readonly targetArrow: ArrowSpec;
  readonly style: EdgeStyle;
  readonly router?: string; // edge router algorithm name
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Immutable Graph
export interface Graph<ND = unknown, ED = unknown> {
  readonly id: GraphId;
  readonly nodes: ReadonlyMap<NodeId, Node<ND>>;
  readonly edges: ReadonlyMap<EdgeId, Edge<ED>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Layout result - computed positions + routed edge paths
export interface LayoutResult {
  readonly nodePositions: ReadonlyMap<NodeId, { readonly x: number; readonly y: number }>;
  readonly edgePaths: ReadonlyMap<EdgeId, EdgePath>;
  readonly bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
}

// Edge path - SVG-compatible path data
export interface EdgePath {
  readonly d: string; // SVG path d attribute
  readonly points: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  readonly labelPosition?: { readonly x: number; readonly y: number };
  readonly sourceIntersection: { readonly x: number; readonly y: number };
  readonly targetIntersection: { readonly x: number; readonly y: number };
}

// Layout algorithm interface - plugin system
export interface LayoutAlgorithm<O = unknown> {
  readonly name: string;
  readonly category: LayoutCategory;
  readonly layout: (graph: Graph, options: O) => import('effect/Effect').Effect<LayoutResult, LayoutError>;
}

export type LayoutCategory =
  | 'hierarchical'
  | 'force'
  | 'tree'
  | 'circular'
  | 'grid'
  | 'constraint'
  | 'compound'
  | 'domain-specific';

// Edge router interface
export interface EdgeRouter<O = unknown> {
  readonly name: string;
  readonly route: (context: EdgeRouterContext, options?: O) => import('effect/Effect').Effect<EdgePath, EdgeRoutingError>;
}

// Context passed to edge routers
export interface EdgeRouterContext {
  readonly edge: Edge;
  readonly sourceNode: Node;
  readonly targetNode: Node;
  readonly allNodes: ReadonlyArray<Node>;
  readonly sourcePort?: Port;
  readonly targetPort?: Port;
}

// Connection validator for node editor use cases
export type ConnectionValidator = (
  source: Port,
  target: Port,
  graph: Graph
) => import('effect/Effect').Effect<boolean, ValidationError>;

// Import error types (forward declaration)
import type { LayoutError, EdgeRoutingError, ValidationError } from '../errors';

// ─── Editing Types ───

export type InteractionMode =
  | 'select'
  | 'pan'
  | 'draw-edge'
  | 'draw-node';

export interface GridConfig {
  readonly enabled: boolean;
  readonly size: number;
}

export interface SelectionBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DragState {
  readonly type: 'node' | 'edge-endpoint' | 'resize-handle' | 'selection-box';
  readonly startX: number;
  readonly startY: number;
  readonly lastCursorX: number;
  readonly lastCursorY: number;
  readonly nodeIds?: ReadonlyArray<NodeId>;
  readonly edgeId?: EdgeId;
  readonly handle?: 'nw' | 'ne' | 'sw' | 'se';
}

export interface DrawEdgeState {
  readonly sourceNodeId: NodeId;
  readonly sourcePortId?: PortId;
  readonly currentX: number;
  readonly currentY: number;
}

// ─── Node Editor Types ───

// Widget types for HTML node rendering (foreignObject)
export type WidgetType = 'input' | 'slider' | 'dropdown' | 'toggle' | 'color' | 'button' | 'label';

export interface NodeWidget {
  readonly type: WidgetType;
  readonly id: string;
  readonly label: string;
  readonly value?: unknown;
  readonly options?: ReadonlyArray<{ readonly label: string; readonly value: string }>;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
}

// Render mode for nodes
export type NodeRenderMode = 'svg' | 'html';

// Port connection state during drag
export interface PortConnectionState {
  readonly sourceNodeId: NodeId;
  readonly sourcePortId: PortId;
  readonly currentX: number;
  readonly currentY: number;
}

// Node type definition for palette/registry
export interface NodeTypeDefinition<D = unknown> {
  readonly type: string;
  readonly category: string;
  readonly label: string;
  readonly icon?: string;
  readonly description?: string;
  readonly defaultSize: { readonly width: number; readonly height: number };
  readonly defaultPorts: ReadonlyArray<Port>;
  readonly defaultData: D;
  readonly defaultWidgets?: ReadonlyArray<NodeWidget>;
  readonly defaultRenderMode?: NodeRenderMode;
  readonly tags?: ReadonlyArray<string>;
  readonly factory?: (overrides?: Partial<Node<D>>) => Node<D>;
}

// Group ID
export type GroupId = string & Brand.Brand<'GroupId'>;
export const GroupId = Brand.nominal<GroupId>();

// Node group for visual grouping
export interface NodeGroup {
  readonly id: GroupId;
  readonly label: string;
  readonly nodeIds: ReadonlyArray<NodeId>;
  readonly collapsed: boolean;
  readonly color?: string;
  readonly position?: { readonly x: number; readonly y: number };
  readonly size?: { readonly width: number; readonly height: number };
  /** Where to render the label. Default 'inside' (legacy header bar). */
  readonly labelPosition?: 'inside' | 'above' | 'below';
  /** Label color override. Defaults to `color`. */
  readonly labelColor?: string;
  /** If true, suppress the filled header bar (use when labelPosition !== 'inside'). */
  readonly hideHeader?: boolean;
  /** If true, suppress the tinted background fill — only the dashed border remains. */
  readonly hideBackground?: boolean;
}

// Menu item for context menus
export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly separator?: boolean;
  readonly action?: () => void;
  readonly children?: ReadonlyArray<MenuItem>;
}

export type MenuContext =
  | { readonly type: 'canvas'; readonly x: number; readonly y: number }
  | { readonly type: 'node'; readonly nodeId: NodeId; readonly x: number; readonly y: number }
  | { readonly type: 'edge'; readonly edgeId: EdgeId; readonly x: number; readonly y: number }
  | { readonly type: 'port'; readonly nodeId: NodeId; readonly portId: PortId; readonly x: number; readonly y: number };
