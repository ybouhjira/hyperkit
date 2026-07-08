/**
 * Shared geometry helpers for the A* edge router.
 * Covers direction types, node boundary math, stub/join helpers,
 * point simplification, and SVG path builders.
 */
import type { Node, Port } from '../graph/types';
import { getShapeOrDefault } from '../shapes/registry';

export type Direction = 'north' | 'south' | 'east' | 'west';
export type Point = { readonly x: number; readonly y: number };

// ─── Node geometry ────────────────────────────────────────────────────────────

export const nodeRect = (
  node: Node,
  padding: number
): { x: number; y: number; width: number; height: number } => ({
  x: node.position.x - padding,
  y: node.position.y - padding,
  width: node.size.width + padding * 2,
  height: node.size.height + padding * 2,
});

// ─── Direction helpers ────────────────────────────────────────────────────────

export const directionVector = (dir: Direction): Point => {
  switch (dir) {
    case 'north':
      return { x: 0, y: -1 };
    case 'south':
      return { x: 0, y: 1 };
    case 'east':
      return { x: 1, y: 0 };
    case 'west':
      return { x: -1, y: 0 };
  }
};

export const portDirection = (port: Port): Direction => port.direction;

export const dominantExitDirection = (sourceCenter: Point, targetCenter: Point): Direction => {
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  if (Math.abs(dy) > Math.abs(dx)) {
    return dy > 0 ? 'south' : 'north';
  }
  return dx > 0 ? 'east' : 'west';
};

export const oppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case 'north':
      return 'south';
    case 'south':
      return 'north';
    case 'east':
      return 'west';
    case 'west':
      return 'east';
  }
};

// ─── Port / boundary position helpers ────────────────────────────────────────

export const getPortPosition = (node: Node, port: Port): Point => {
  const shape = getShapeOrDefault(node.shape);
  const positions = shape.getPortPositions(node);
  switch (port.direction) {
    case 'north':
      return positions.north;
    case 'south':
      return positions.south;
    case 'east':
      return positions.east;
    case 'west':
      return positions.west;
  }
};

export const getBoundaryInDirection = (node: Node, dir: Direction): Point => {
  const shape = getShapeOrDefault(node.shape);
  const center = {
    x: node.position.x + node.size.width / 2,
    y: node.position.y + node.size.height / 2,
  };
  const v = directionVector(dir);
  const far: Point = { x: center.x + v.x * 10000, y: center.y + v.y * 10000 };
  return shape.getBoundaryPoint(node, far);
};

export const extendPoint = (p: Point, dir: Direction, padding: number): Point => {
  const v = directionVector(dir);
  return { x: p.x + v.x * padding, y: p.y + v.y * padding };
};

// ─── Point simplification ─────────────────────────────────────────────────────

/** Remove intermediate points that are collinear with their neighbours. */
export const simplifyPoints = (points: ReadonlyArray<Point>): ReadonlyArray<Point> => {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]!];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;
    const isCollinear =
      (Math.abs(prev.x - curr.x) < 1e-6 && Math.abs(curr.x - next.x) < 1e-6) ||
      (Math.abs(prev.y - curr.y) < 1e-6 && Math.abs(curr.y - next.y) < 1e-6);
    if (!isCollinear) {
      result.push(curr);
    }
  }
  result.push(points[points.length - 1]!);
  return result;
};

// ─── SVG path builders ────────────────────────────────────────────────────────

export const buildRoundedPath = (points: ReadonlyArray<Point>, radius: number): string => {
  if (points.length < 2) return '';
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };

    const lenPrev = Math.sqrt(toPrev.x ** 2 + toPrev.y ** 2);
    const lenNext = Math.sqrt(toNext.x ** 2 + toNext.y ** 2);

    if (lenPrev < 1e-6 || lenNext < 1e-6) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const r = Math.min(radius, lenPrev / 2, lenNext / 2);

    const arcStart = {
      x: curr.x + (toPrev.x / lenPrev) * r,
      y: curr.y + (toPrev.y / lenPrev) * r,
    };
    const arcEnd = {
      x: curr.x + (toNext.x / lenNext) * r,
      y: curr.y + (toNext.y / lenNext) * r,
    };

    d += ` L ${arcStart.x} ${arcStart.y}`;
    d += ` Q ${curr.x} ${curr.y} ${arcEnd.x} ${arcEnd.y}`;
  }

  const last = points[points.length - 1]!;
  d += ` L ${last.x} ${last.y}`;
  return d;
};

export const buildSharpPath = (points: ReadonlyArray<Point>): string =>
  points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

// ─── Label position (midpoint by arc length) ─────────────────────────────────

export const midpointByLength = (points: ReadonlyArray<Point>): Point => {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };

  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x;
    const dy = points[i]!.y - points[i - 1]!.y;
    total += Math.sqrt(dx * dx + dy * dy);
  }

  const half = total / 2;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x;
    const dy = points[i]!.y - points[i - 1]!.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLen >= half) {
      const t = (half - accumulated) / segLen;
      return {
        x: points[i - 1]!.x + dx * t,
        y: points[i - 1]!.y + dy * t,
      };
    }
    accumulated += segLen;
  }

  return points[points.length - 1]!;
};

// ─── Orthogonal join / fallback helpers ──────────────────────────────────────

/**
 * Build an orthogonal connector from `from` (heading in `dir`) to `to`.
 * Returns the intermediate points (not including `from` itself, but including `to`).
 */
export const buildOrthogonalJoin = (
  from: Point,
  dir: Direction,
  to: Point
): ReadonlyArray<Point> => {
  const horizontal = (d: Direction) => d === 'east' || d === 'west';

  if (horizontal(dir)) {
    if (Math.abs(from.y - to.y) < 1e-6) {
      return [to];
    }
    return [{ x: to.x, y: from.y }, to];
  } else {
    if (Math.abs(from.x - to.x) < 1e-6) {
      return [to];
    }
    return [{ x: from.x, y: to.y }, to];
  }
};

/** Simple orthogonal fallback when A* cannot find a path (mirrors manhattan logic). */
export const buildManhattanFallback = (
  exitStub: Point,
  exitDir: Direction,
  entryStub: Point,
  entryDir: Direction
): ReadonlyArray<Point> => {
  const horizontal = (d: Direction) => d === 'east' || d === 'west';

  if (horizontal(exitDir) === horizontal(entryDir)) {
    if (horizontal(exitDir)) {
      const midX = (exitStub.x + entryStub.x) / 2;
      return [
        { x: midX, y: exitStub.y },
        { x: midX, y: entryStub.y },
      ];
    } else {
      const midY = (exitStub.y + entryStub.y) / 2;
      return [
        { x: exitStub.x, y: midY },
        { x: entryStub.x, y: midY },
      ];
    }
  }

  if (horizontal(exitDir)) {
    return [{ x: entryStub.x, y: exitStub.y }];
  } else {
    return [{ x: exitStub.x, y: entryStub.y }];
  }
};
