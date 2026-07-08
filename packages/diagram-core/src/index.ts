// @ybouhjira/diagram-core - Framework-agnostic diagramming engine

// Graph model
export * from './graph/types';
export * from './graph/operations';
export { getPort, getPortConnections, canConnect, findPortOwner } from './graph/operations';

// Batch operations
export {
  moveNodes, resizeNode, updateNodeLabel, updateEdgeLabel,
  reconnectEdge, addNodes, addEdges, removeNodes, removeEdges,
  cloneSubgraph, nodesInBox, snapToGrid,
} from './graph/batch-operations';

// Editing types
export type {
  InteractionMode, GridConfig, SelectionBox, DragState, DrawEdgeState,
  PortConnectionState, NodeWidget, WidgetType, NodeRenderMode,
  NodeTypeDefinition, NodeGroup, MenuItem, MenuContext,
} from './graph/types';

// Errors
export * from './errors';

// Geometry
export * from './geometry/point';
export * from './geometry/rect';
export * from './geometry/intersections';

// Shapes
export * from './shapes/registry';

// Arrows
export * from './arrows/presets';

// Layout
export * from './layout/types';
export * from './layout/registry';
export * from './layout/presets';
export { removeOverlaps } from './layout/overlap-removal';
export type { OverlapRemovalOptions } from './layout/overlap-removal';
export { computeNodeSize, autoSizeNodes } from './layout/auto-size';
export type { NodeSizingOptions } from './layout/auto-size';

// Edge routing — uses barrel export to trigger router auto-registration side effects
export * from './edge';

// Port validation
export * from './ports/index';

// Node renderers
export * from './renderers/index';

// Node type registry
export * from './registry/index';

// Group operations
export * from './graph/group-operations';

// Serialization
export * from './serialization/index';

// Editing utilities
export * from './editing/index';

// Preset system
export type { DiagramPreset, DiagramShadow } from './preset';
export { getPaletteEntry } from './preset';
