import type { Point } from './point';

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

export const center = (r: Rect): Point => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
});

export const topLeft = (r: Rect): Point => ({ x: r.x, y: r.y });
export const topRight = (r: Rect): Point => ({ x: r.x + r.width, y: r.y });
export const bottomLeft = (r: Rect): Point => ({ x: r.x, y: r.y + r.height });
export const bottomRight = (r: Rect): Point => ({ x: r.x + r.width, y: r.y + r.height });

export const contains = (r: Rect, p: Point): boolean =>
  p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;

export const intersects = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

export const expand = (r: Rect, padding: number): Rect => ({
  x: r.x - padding,
  y: r.y - padding,
  width: r.width + padding * 2,
  height: r.height + padding * 2,
});

export const union = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
};

export const fromPoints = (points: ReadonlyArray<Point>): Rect => {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

// Find intersection point of a line from rect center to an external point with the rect boundary
export const boundaryIntersection = (r: Rect, externalPoint: Point): Point => {
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const dx = externalPoint.x - cx;
  const dy = externalPoint.y - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const halfW = r.width / 2;
  const halfH = r.height / 2;

  let t: number;
  if (absDx * halfH > absDy * halfW) {
    // Intersects left or right side
    t = halfW / absDx;
  } else {
    // Intersects top or bottom side
    t = halfH / absDy;
  }

  return { x: cx + dx * t, y: cy + dy * t };
};
