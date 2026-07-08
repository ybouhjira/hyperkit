import type { Graph, Node } from '../graph/types';

export interface NodeSizingOptions {
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly padding?: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  readonly headerHeight?: number;
  readonly lineHeight?: number;
  readonly charWidth?: number;
  readonly fontSize?: number;
}

const DEFAULT_OPTIONS: Required<NodeSizingOptions> = {
  minWidth: 120,
  maxWidth: 400,
  minHeight: 40,
  padding: { top: 8, right: 12, bottom: 8, left: 12 },
  headerHeight: 32,
  lineHeight: 20,
  charWidth: 8,
  fontSize: 14,
};

/**
 * Compute appropriate size for a single node based on its content.
 */
export const computeNodeSize = (
  node: Node,
  options?: NodeSizingOptions
): { width: number; height: number } => {
  const opts: Required<NodeSizingOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    padding: { ...DEFAULT_OPTIONS.padding, ...options?.padding },
  };

  // Width: label text contribution
  const labelWidth = (node.label?.length ?? 0) * opts.charWidth;

  // Width: port labels on both sides
  let maxPortLabelWidth = 0;
  for (const port of node.ports) {
    const portLabelWidth = (port.label?.length ?? 0) * opts.charWidth;
    if (portLabelWidth > maxPortLabelWidth) maxPortLabelWidth = portLabelWidth;
  }

  // Width + height: widget rows
  let bodyItemCount = 0;
  let maxBodyWidth = 0;
  if (node.widgets) {
    bodyItemCount = node.widgets.length;
    for (const widget of node.widgets) {
      const widgetLabelWidth = (widget.label.length ?? 0) * opts.charWidth;
      const widgetRowWidth = widgetLabelWidth + 60; // 60px for the widget control
      if (widgetRowWidth > maxBodyWidth) maxBodyWidth = widgetRowWidth;
    }
  }

  const contentWidth = Math.max(
    labelWidth + opts.padding.left + opts.padding.right,
    maxBodyWidth + opts.padding.left + opts.padding.right,
    maxPortLabelWidth * 2 + opts.padding.left + opts.padding.right + 40 // both sides + centre gap
  );
  const width = Math.max(opts.minWidth, Math.min(opts.maxWidth, contentWidth));

  // Height
  let height = opts.padding.top + opts.padding.bottom;
  if (node.label) height += opts.headerHeight;
  height += bodyItemCount * opts.lineHeight;
  height = Math.max(opts.minHeight, height);

  return { width, height };
};

/**
 * Auto-size all nodes in a graph based on their content.
 * Returns a new graph with updated node sizes (immutable).
 */
export const autoSizeNodes = (graph: Graph, options?: NodeSizingOptions): Graph => {
  const updatedNodes = new Map(graph.nodes);

  for (const [id, node] of graph.nodes) {
    const newSize = computeNodeSize(node, options);
    if (newSize.width !== node.size.width || newSize.height !== node.size.height) {
      updatedNodes.set(id, { ...node, size: newSize });
    }
  }

  return { ...graph, nodes: updatedNodes };
};
