/**
 * SVG diagram renderer — orchestrates all rendering sub-modules.
 *
 * Public API is re-exported here for backward compatibility.
 * Implementations live in:
 *   - renderer-presets.ts  (DiagramPreset, RenderOptions, preset objects)
 *   - renderer-filters.ts  (createSvgElement, appendArrowMarkers, filters, grid)
 *   - renderer-styles.ts   (getDiagramStyles)
 *   - renderer-nodes.ts    (renderPorts, renderCardNode, renderSketchNode, renderNode)
 *   - renderer-edges.ts    (renderEdge)
 */
import type { Graph, LayoutResult, Node, NodeId } from '@ybouhjira/diagram-core';
import { renderGroup } from './group-renderer';
import { computeLabelPlacements, type LabelPlacementOptions } from './label-placement';

// Re-export the public surface (consumed by index.ts)
export type { DiagramPreset, RenderOptions } from './renderer-presets';
export {
  modernPreset,
  enterprisePreset,
  sketchPreset,
  minimalPreset,
  blueprintPreset,
} from './renderer-presets';

import type { DiagramPreset, RenderOptions } from './renderer-presets';
import { createSvgElement, appendArrowMarkers, appendDropShadowFilter, appendHandDrawnFilter, appendInfiniteGrid } from './renderer-filters';
import { getDiagramStyles } from './renderer-styles';
import { renderNode } from './renderer-nodes';
import { renderEdge } from './renderer-edges';

export const renderDiagram = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult,
  options: RenderOptions = {}
): SVGSVGElement => {
  const {
    width = layout.bounds.width,
    height = layout.bounds.height,
    padding = 20,
    showGrid = false,
    gridSize = options.preset?.canvas.gridSize ?? 20,
    preset,
  } = options;

  // Compute viewBox dimensions
  const canvasScale = 1.15;
  const contentW = layout.bounds.width + padding * 2;
  const contentH = layout.bounds.height + padding * 2;
  const aspectW = contentW / width;
  const aspectH = contentH / height;
  const fitScale = Math.max(aspectW, aspectH) * canvasScale;
  const vbW = width * fitScale;
  const vbH = height * fitScale;
  const vbX = layout.bounds.x - padding - (vbW - contentW) / 2;
  const vbY = layout.bounds.y - padding - (vbH - contentH) / 2;

  const svg = createSvgElement('svg', {
    width,
    height,
    viewBox: `${Math.round(vbX)} ${Math.round(vbY)} ${Math.round(vbW)} ${Math.round(vbH)}`,
    class: 'sk-diagram',
  }) as SVGSVGElement;

  // CSS styles
  const style = createSvgElement('style');
  style.textContent = getDiagramStyles(preset);
  svg.appendChild(style);

  // Defs (arrow markers, filters)
  const defs = createSvgElement('defs');
  appendArrowMarkers(defs, graph);
  appendDropShadowFilter(defs, preset);
  if (preset?.effects.handDrawn) {
    appendHandDrawnFilter(defs, preset.effects.handDrawnIntensity ?? 3);
  }
  svg.appendChild(defs);

  // Background
  const bgColor = preset?.canvas.background ?? 'var(--sk-diagram-bg, #ffffff)';
  const bg = createSvgElement('rect', {
    x: vbX - vbW * 2,
    y: vbY - vbH * 2,
    width: vbW * 5,
    height: vbH * 5,
    class: 'sk-diagram-bg',
  });
  if (preset) bg.style.fill = bgColor;
  svg.appendChild(bg);

  // Grid
  const effectiveShowGrid = showGrid || (preset?.canvas.gridStyle !== undefined && preset.canvas.gridStyle !== 'none');
  if (effectiveShowGrid) {
    appendInfiniteGrid(defs, gridSize, preset);
    const gridRect = createSvgElement('rect', {
      x: vbX - vbW * 2,
      y: vbY - vbH * 2,
      width: vbW * 5,
      height: vbH * 5,
      class: 'sk-diagram-grid',
      fill: 'url(#sk-grid-large)',
    });
    svg.appendChild(gridRect);
  }

  // Groups (rendered behind everything)
  if (options.groups && options.groups.length > 0) {
    const groupsGroup = createSvgElement('g', { class: 'sk-diagram-groups' });
    for (const group of options.groups) {
      const groupEl = renderGroup(group);
      groupsGroup.appendChild(groupEl);
    }
    svg.appendChild(groupsGroup);
  }

  // Label placements (collision avoidance)
  const labelPlacements =
    options.labelPlacement !== false
      ? computeLabelPlacements(graph, layout, options.labelPlacement ?? undefined)
      : new Map();

  // Edges group (rendered below nodes)
  const edgesGroup = createSvgElement('g', { class: 'sk-diagram-edges' });
  for (const [edgeId, edge] of graph.edges) {
    const path = layout.edgePaths.get(edgeId);
    if (path) {
      const placement = labelPlacements.get(edgeId);
      const edgeEl = renderEdge(edge, path, edgeId, placement, preset);
      edgesGroup.appendChild(edgeEl);
    }
  }
  svg.appendChild(edgesGroup);

  // Nodes group
  const nodesGroup = createSvgElement('g', { class: 'sk-diagram-nodes' });
  const sortedNodes = [...graph.nodes.entries()].sort(
    ([, a], [, b]) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
  );
  for (const [nodeId, node] of sortedNodes) {
    const pos = layout.nodePositions.get(nodeId);
    if (pos) {
      const positionedNode = { ...node, position: pos } as Node<ND>;
      const nodeEl = renderNode(positionedNode, nodeId, preset);
      nodesGroup.appendChild(nodeEl);
    }
  }
  svg.appendChild(nodesGroup);

  return svg;
};
