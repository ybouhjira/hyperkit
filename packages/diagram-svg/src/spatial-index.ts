import RBush from 'rbush';
import type { LayoutResult, Graph, NodeId } from '@ybouhjira/diagram-core';
import type { ViewportController } from './viewport';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SpatialItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
  type: 'node' | 'edge';
}

export interface CullingOptions {
  /** Enable culling entirely. Defaults to `true` when the graph has >minNodes elements. */
  readonly enabled?: boolean;
  /** How much to expand the viewport rect before querying, as a fraction of viewport size. Default: 0.2 */
  readonly bufferRatio?: number;
  /** Minimum node count before culling activates when `enabled` is not explicitly set. Default: 50 */
  readonly minNodes?: number;
}

export interface CullingController {
  readonly update: () => void;
  readonly destroy: () => void;
}

// ─── Build ───────────────────────────────────────────────────────────────────

/**
 * Build an RBush spatial index from a graph and its computed layout.
 *
 * Node bounding boxes are derived from `layout.nodePositions` + `graph.nodes` sizes.
 * Edge bounding boxes are the axis-aligned bounding box of all path points.
 */
export const buildSpatialIndex = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult
): RBush<SpatialItem> => {
  const tree = new RBush<SpatialItem>();
  const items: SpatialItem[] = [];

  // ── Nodes ──────────────────────────────────────────────────────────────────
  for (const [nodeId, node] of graph.nodes) {
    const pos = layout.nodePositions.get(nodeId as NodeId);
    if (!pos) continue;

    const { width, height } = node.size;
    items.push({
      minX: pos.x,
      minY: pos.y,
      maxX: pos.x + width,
      maxY: pos.y + height,
      id: nodeId,
      type: 'node',
    });
  }

  // ── Edges ──────────────────────────────────────────────────────────────────
  for (const [edgeId, _edge] of graph.edges) {
    const path = layout.edgePaths.get(edgeId);
    if (!path || path.points.length === 0) continue;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pt of path.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    // Also fold in source / target intersection points for accuracy
    for (const pt of [path.sourceIntersection, path.targetIntersection]) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    items.push({ minX, minY, maxX, maxY, id: edgeId, type: 'edge' });
  }

  tree.load(items);
  return tree;
};

// ─── Query ───────────────────────────────────────────────────────────────────

/**
 * Query the spatial index for all elements whose bounding boxes overlap the
 * given viewport rectangle (optionally expanded by `bufferRatio`).
 */
export const queryVisibleElements = (
  index: RBush<SpatialItem>,
  viewportRect: { x: number; y: number; width: number; height: number },
  bufferRatio = 0.2
): { visibleNodes: Set<string>; visibleEdges: Set<string> } => {
  const expandX = viewportRect.width * bufferRatio;
  const expandY = viewportRect.height * bufferRatio;

  const results = index.search({
    minX: viewportRect.x - expandX,
    minY: viewportRect.y - expandY,
    maxX: viewportRect.x + viewportRect.width + expandX,
    maxY: viewportRect.y + viewportRect.height + expandY,
  });

  const visibleNodes = new Set<string>();
  const visibleEdges = new Set<string>();

  for (const item of results) {
    if (item.type === 'node') {
      visibleNodes.add(item.id);
    } else {
      visibleEdges.add(item.id);
    }
  }

  return { visibleNodes, visibleEdges };
};

// ─── Apply ───────────────────────────────────────────────────────────────────

/**
 * Toggle `display` on SVG child elements tagged with `data-node-id` or
 * `data-edge-id` to show only those present in the visible sets.
 *
 * Elements not tagged with either attribute are left untouched (background,
 * defs, grid, etc.).
 */
export const applyCulling = (
  svgRoot: SVGSVGElement,
  visibleNodes: Set<string>,
  visibleEdges: Set<string>
): void => {
  // Nodes — each rendered as <g data-node-id="…">
  const nodeEls = svgRoot.querySelectorAll<SVGElement>('[data-node-id]');
  for (const el of nodeEls) {
    const id = el.getAttribute('data-node-id');
    if (id !== null) {
      // Only top-level node groups should be toggled; port circles also carry
      // data-node-id so we check that the element is a <g> at the node level.
      if (el.tagName === 'g' && el.classList.contains('sk-diagram-node')) {
        el.style.display = visibleNodes.has(id) ? '' : 'none';
      }
    }
  }

  // Edges — each rendered as <g data-edge-id="…">
  const edgeEls = svgRoot.querySelectorAll<SVGElement>('[data-edge-id]');
  for (const el of edgeEls) {
    const id = el.getAttribute('data-edge-id');
    if (id !== null) {
      el.style.display = visibleEdges.has(id) ? '' : 'none';
    }
  }
};

// ─── Controller ──────────────────────────────────────────────────────────────

/**
 * Compute the current viewport rectangle in SVG/world coordinates from the
 * viewport state and SVG element.
 *
 * The viewBox `(vx, vy, vw, vh)` already encodes the visible world-space
 * rectangle in the SVG coordinate system, so we read it directly from the
 * element to stay in sync with any animations or external mutations.
 */
const getViewportRect = (
  svg: SVGSVGElement
): { x: number; y: number; width: number; height: number } | null => {
  const vb = svg.getAttribute('viewBox');
  if (!vb) return null;
  const parts = vb.split(' ').map(Number);
  if (parts.length < 4) return null;
  const [x, y, width, height] = parts as [number, number, number, number];
  return { x, y, width, height };
};

/**
 * Create a culling controller that hooks into an existing `ViewportController`
 * and applies viewport culling on every update.
 *
 * Call `update()` manually after initial render or when the graph changes.
 * The controller subscribes to viewport changes via `requestAnimationFrame`
 * polling — it does NOT mutate the viewport controller.
 *
 * Destroy the controller when the diagram is unmounted to stop the RAF loop.
 */
export const createCullingController = (
  svgRoot: SVGSVGElement,
  index: RBush<SpatialItem>,
  _viewportController: ViewportController,
  options?: CullingOptions
): CullingController => {
  const bufferRatio = options?.bufferRatio ?? 0.2;

  let destroyed = false;
  let rafId: number | null = null;
  let lastViewBox: string | null = null;

  const runCulling = (): void => {
    const rect = getViewportRect(svgRoot);
    if (!rect) return;
    const { visibleNodes, visibleEdges } = queryVisibleElements(index, rect, bufferRatio);
    applyCulling(svgRoot, visibleNodes, visibleEdges);
  };

  const loop = (): void => {
    if (destroyed) return;

    // Only re-cull when the viewBox actually changed (cheap string compare)
    const currentViewBox = svgRoot.getAttribute('viewBox');
    if (currentViewBox !== lastViewBox) {
      lastViewBox = currentViewBox;
      runCulling();
    }

    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  return {
    update: runCulling,
    destroy: () => {
      destroyed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
};
