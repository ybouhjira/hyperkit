import type { Point } from './point';
import type { Rect } from './rect';

// Line-line intersection
export const lineLineIntersection = (
  p1: Point, p2: Point,
  p3: Point, p4: Point
): Point | null => {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-10) return null; // parallel

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;

  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
};

// Segment-segment intersection
export const segmentSegmentIntersection = (
  p1: Point, p2: Point,
  p3: Point, p4: Point
): Point | null => {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-10) return null;

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;

  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
};

// Line-rect intersection (closest point from direction)
export const lineRectIntersection = (
  lineStart: Point,
  lineEnd: Point,
  r: Rect
): Point | null => {
  const sides: [Point, Point][] = [
    [{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }], // top
    [{ x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }], // right
    [{ x: r.x, y: r.y + r.height }, { x: r.x + r.width, y: r.y + r.height }], // bottom
    [{ x: r.x, y: r.y }, { x: r.x, y: r.y + r.height }], // left
  ];

  let closest: Point | null = null;
  let minDist = Infinity;

  for (const [s1, s2] of sides) {
    const hit = segmentSegmentIntersection(lineStart, lineEnd, s1, s2);
    if (hit) {
      const dist = Math.sqrt((hit.x - lineStart.x) ** 2 + (hit.y - lineStart.y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = hit;
      }
    }
  }

  return closest;
};

// Ellipse boundary point from center toward external point
export const ellipseBoundaryPoint = (
  cx: number, cy: number,
  rx: number, ry: number,
  externalPoint: Point
): Point => {
  const dx = externalPoint.x - cx;
  const dy = externalPoint.y - cy;
  const angle = Math.atan2(dy, dx);
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
};
