import type { LayoutResult, Graph } from '@ybouhjira/diagram-core';

export interface LabelPlacementOptions {
  readonly avoidNodes?: boolean;
  readonly avoidOtherLabels?: boolean;
  readonly maxOffset?: number;
  readonly labelPadding?: number;
  readonly charWidth?: number;
  readonly lineHeight?: number;
}

export interface LabelPlacement {
  readonly edgeId: string;
  readonly x: number;
  readonly y: number;
  readonly offset: { readonly dx: number; readonly dy: number };
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const rectsOverlap = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

const makeLabelRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
): Rect => ({
  x: x - width / 2 - padding,
  y: y - height / 2 - padding,
  width: width + padding * 2,
  height: height + padding * 2,
});

/**
 * Sample a point along a polyline defined by `points` at parameter t ∈ [0, 1].
 * t=0 is the start, t=1 is the end.
 */
const samplePolyline = (
  points: ReadonlyArray<{ readonly x: number; readonly y: number }>,
  t: number
): { x: number; y: number } => {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0]!.x, y: points[0]!.y };

  // Compute total length
  let totalLength = 0;
  const segmentLengths: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1]!.x - points[i]!.x;
    const dy = points[i + 1]!.y - points[i]!.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return { x: points[0]!.x, y: points[0]!.y };

  const target = t * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i]!;
    if (accumulated + segLen >= target) {
      const localT = segLen > 0 ? (target - accumulated) / segLen : 0;
      const p0 = points[i]!;
      const p1 = points[i + 1]!;
      return {
        x: p0.x + (p1.x - p0.x) * localT,
        y: p0.y + (p1.y - p0.y) * localT,
      };
    }
    accumulated += segLen;
  }

  // Fallback: last point
  return { x: points[points.length - 1]!.x, y: points[points.length - 1]!.y };
};

/**
 * Compute the perpendicular direction at t=0.5 for a polyline.
 * Returns a unit vector perpendicular to the edge at the midpoint.
 */
const perpendicularAtMid = (
  points: ReadonlyArray<{ readonly x: number; readonly y: number }>
): { dx: number; dy: number } => {
  if (points.length < 2) return { dx: 0, dy: -1 };

  // Find the segment containing t=0.5
  const mid = samplePolyline(points, 0.5);
  const midPlus = samplePolyline(points, 0.51);

  const edgeDx = midPlus.x - mid.x;
  const edgeDy = midPlus.y - mid.y;
  const len = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

  if (len === 0) return { dx: 0, dy: -1 };

  // Perpendicular: rotate 90 degrees
  return { dx: -edgeDy / len, dy: edgeDx / len };
};

/**
 * Compute adjusted label positions that avoid overlaps.
 * Returns a map from edge ID to adjusted label position.
 */
export const computeLabelPlacements = <ND, ED>(
  graph: Graph<ND, ED>,
  layout: LayoutResult,
  options?: LabelPlacementOptions
): ReadonlyMap<string, LabelPlacement> => {
  const {
    avoidNodes = true,
    avoidOtherLabels = true,
    maxOffset = 20,
    labelPadding = 4,
    charWidth = 7,
    lineHeight = 16,
  } = options ?? {};

  // Collect node bounding rects
  const nodeRects: Rect[] = [];
  if (avoidNodes) {
    for (const [nodeId, node] of graph.nodes) {
      const pos = layout.nodePositions.get(nodeId);
      if (!pos) continue;
      nodeRects.push({
        x: pos.x,
        y: pos.y,
        width: node.size.width,
        height: node.size.height,
      });
    }
  }

  // Gather candidate label info: edge ID, original position, estimated size, polyline points
  interface LabelCandidate {
    readonly edgeId: string;
    readonly origX: number;
    readonly origY: number;
    readonly width: number;
    readonly height: number;
    readonly points: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  }

  const candidates: LabelCandidate[] = [];
  for (const [edgeId, edge] of graph.edges) {
    if (!edge.label) continue;
    const path = layout.edgePaths.get(edgeId);
    if (!path?.labelPosition) continue;

    const labelText = edge.label.text;
    const estWidth = labelText.length * charWidth;
    const estHeight = lineHeight;

    candidates.push({
      edgeId,
      origX: path.labelPosition.x,
      origY: path.labelPosition.y,
      width: estWidth,
      height: estHeight,
      points: path.points,
    });
  }

  if (candidates.length === 0) {
    return new Map();
  }

  // For each candidate, find a non-overlapping position
  const placements = new Map<string, LabelPlacement>();
  const placedRects: Array<{ edgeId: string; rect: Rect }> = [];

  // Candidate t-values to try along the edge path
  const tCandidates = [0.5, 0.3, 0.7, 0.2, 0.8];

  for (const candidate of candidates) {
    const { edgeId, origX, origY, width, height, points } = candidate;

    let bestX = origX;
    let bestY = origY;
    let found = false;

    // Try t-based positions first
    for (const t of tCandidates) {
      const pos = t === 0.5 ? { x: origX, y: origY } : samplePolyline(points, t);
      const rect = makeLabelRect(pos.x, pos.y, width, height, labelPadding);

      const overlapsNode = avoidNodes && nodeRects.some((nr) => rectsOverlap(rect, nr));
      const overlapsLabel =
        avoidOtherLabels &&
        placedRects.some(({ rect: pr }) => rectsOverlap(rect, pr));

      if (!overlapsNode && !overlapsLabel) {
        bestX = pos.x;
        bestY = pos.y;
        found = true;
        break;
      }
    }

    // If no t-position worked, try perpendicular offsets at t=0.5
    if (!found) {
      const perp = perpendicularAtMid(points);
      // Try both directions (+perp and -perp) in steps up to maxOffset
      const offsetSteps = [0.5, 1.0].map((frac) => frac * maxOffset);

      outer: for (const magnitude of offsetSteps) {
        for (const sign of [1, -1]) {
          const ox = perp.dx * magnitude * sign;
          const oy = perp.dy * magnitude * sign;
          const px = origX + ox;
          const py = origY + oy;
          const rect = makeLabelRect(px, py, width, height, labelPadding);

          const overlapsNode = avoidNodes && nodeRects.some((nr) => rectsOverlap(rect, nr));
          const overlapsLabel =
            avoidOtherLabels &&
            placedRects.some(({ rect: pr }) => rectsOverlap(rect, pr));

          if (!overlapsNode && !overlapsLabel) {
            bestX = px;
            bestY = py;
            found = true;
            break outer;
          }
        }
      }

      // If still not resolved after both offset steps, use maxOffset in best direction
      if (!found) {
        for (const sign of [1, -1]) {
          const ox = perp.dx * maxOffset * sign;
          const oy = perp.dy * maxOffset * sign;
          const px = origX + ox;
          const py = origY + oy;
          const rect = makeLabelRect(px, py, width, height, labelPadding);

          const overlapsNode = avoidNodes && nodeRects.some((nr) => rectsOverlap(rect, nr));
          const overlapsLabel =
            avoidOtherLabels &&
            placedRects.some(({ rect: pr }) => rectsOverlap(rect, pr));

          if (!overlapsNode && !overlapsLabel) {
            bestX = px;
            bestY = py;
            break;
          }
        }

        // No valid position — keep original (best effort)
        bestX = origX;
        bestY = origY;
      }
    }

    const finalRect = makeLabelRect(bestX, bestY, width, height, labelPadding);
    placedRects.push({ edgeId, rect: finalRect });

    placements.set(edgeId, {
      edgeId,
      x: bestX,
      y: bestY,
      offset: { dx: bestX - origX, dy: bestY - origY },
    });
  }

  return placements;
};
