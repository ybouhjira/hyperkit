import type { Graph, LayoutResult, NodeId } from '../graph/types';

// ─── Options ──────────────────────────────────────────────────────────────

export interface OverlapRemovalOptions {
  /** Minimum gap between node boundaries (default: 20) */
  readonly padding?: number;
  /** Safety cap on iterations to prevent infinite loops (default: 100) */
  readonly maxIterations?: number;
}

// ─── Internal types ────────────────────────────────────────────────────────

interface NodeRect {
  readonly id: NodeId;
  x: number; // top-left x (mutable during algorithm)
  y: number; // top-left y (mutable during algorithm)
  readonly width: number;
  readonly height: number;
}

// ─── Core algorithm ────────────────────────────────────────────────────────

/**
 * Post-layout overlap removal pass.
 *
 * Takes a LayoutResult (where positions are top-left corners) and a Graph
 * (for node sizes), then iteratively pushes overlapping nodes apart until
 * all pairs are separated by at least `padding` pixels.
 *
 * This is a pure, synchronous function — no Effects needed since it is
 * deterministic math with no possible error states.
 *
 * Algorithm: PRISM-inspired separation constraints
 * - Detects AABB overlaps between all pairs
 * - Computes minimum translation vector (MTV) along the shorter axis
 * - Applies half-displacement to each node simultaneously
 * - Repeats until no overlaps remain or maxIterations is reached
 *
 * Complexity: O(N² × iterations) — fast enough for < 500 nodes
 */
export const removeOverlaps = (
  layoutResult: LayoutResult,
  graph: Graph,
  options: OverlapRemovalOptions = {}
): LayoutResult => {
  const padding = options.padding ?? 20;
  const maxIterations = options.maxIterations ?? 100;

  // Nothing to do for empty or single-node graphs
  if (graph.nodes.size <= 1) return layoutResult;

  // Build mutable rect list from layout positions + graph sizes
  const rects: NodeRect[] = [];
  for (const [id, node] of graph.nodes) {
    const pos = layoutResult.nodePositions.get(id);
    if (!pos) continue; // node not in layout result — skip
    rects.push({
      id,
      x: pos.x,
      y: pos.y,
      width: node.size.width,
      height: node.size.height,
    });
  }

  if (rects.length <= 1) return layoutResult;

  // Iterative separation loop
  for (let iter = 0; iter < maxIterations; iter++) {
    // Collect all overlapping pairs and their displacements
    // We apply displacements simultaneously (not sequentially) to avoid drift
    const dx = new Float64Array(rects.length);
    const dy = new Float64Array(rects.length);
    let hasOverlap = false;

    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]!;
        const b = rects[j]!;

        // Center coordinates
        const cax = a.x + a.width * 0.5;
        const cay = a.y + a.height * 0.5;
        const cbx = b.x + b.width * 0.5;
        const cby = b.y + b.height * 0.5;

        // Half-extents including padding
        const halfW = (a.width + b.width) * 0.5 + padding;
        const halfH = (a.height + b.height) * 0.5 + padding;

        // Gap on each axis (positive = overlap, negative = separated)
        const gapX = halfW - Math.abs(cax - cbx);
        const gapY = halfH - Math.abs(cay - cby);

        // Only act if BOTH axes overlap (AABB intersection)
        if (gapX <= 0 || gapY <= 0) continue;

        hasOverlap = true;

        // Choose the axis of minimum penetration (MTV)
        // Push along whichever axis requires less movement
        if (gapX <= gapY) {
          // Separate along X axis
          const half = gapX * 0.5;
          if (cbx >= cax) {
            dx[i]! -= half;
            dx[j]! += half;
          } else {
            dx[i]! += half;
            dx[j]! -= half;
          }
        } else {
          // Separate along Y axis
          const half = gapY * 0.5;
          if (cby >= cay) {
            dy[i]! -= half;
            dy[j]! += half;
          } else {
            dy[i]! += half;
            dy[j]! -= half;
          }
        }
      }
    }

    // No overlaps found — we are done
    if (!hasOverlap) break;

    // Apply accumulated displacements simultaneously
    for (let i = 0; i < rects.length; i++) {
      rects[i]!.x += dx[i]!;
      rects[i]!.y += dy[i]!;
    }
  }

  // Build updated nodePositions map
  const nodePositions = new Map<NodeId, { readonly x: number; readonly y: number }>(
    layoutResult.nodePositions
  );
  for (const rect of rects) {
    nodePositions.set(rect.id, { x: rect.x, y: rect.y });
  }

  // Recompute bounds to encompass all moved nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  // Handle degenerate case (all rects filtered out, though guarded above)
  const bounds =
    rects.length > 0
      ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
      : layoutResult.bounds;

  return {
    nodePositions,
    edgePaths: layoutResult.edgePaths, // preserved — caller re-routes edges after
    bounds,
  };
};
