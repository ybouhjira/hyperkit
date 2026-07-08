import { describe, it, expect } from 'vitest';
import { point, add, subtract, scale, distance, midpoint, lerp, normalize, dot, angle, rotate, equals } from '../point';
import { rect, center, topLeft, topRight, bottomLeft, bottomRight, contains, intersects, expand, union, fromPoints, boundaryIntersection } from '../rect';
import { lineLineIntersection, segmentSegmentIntersection, lineRectIntersection, ellipseBoundaryPoint } from '../intersections';

describe('Point operations', () => {
  it('creates a point', () => {
    const p = point(3, 4);
    expect(p).toEqual({ x: 3, y: 4 });
  });

  it('adds two points', () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it('subtracts two points', () => {
    expect(subtract({ x: 5, y: 8 }, { x: 3, y: 2 })).toEqual({ x: 2, y: 6 });
  });

  it('scales a point', () => {
    expect(scale({ x: 2, y: 3 }, 2)).toEqual({ x: 4, y: 6 });
  });

  it('calculates distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('calculates distance for same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates midpoint', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 5, y: 5 });
  });

  it('calculates midpoint for negative coordinates', () => {
    expect(midpoint({ x: -10, y: -10 }, { x: 10, y: 10 })).toEqual({ x: 0, y: 0 });
  });

  it('linear interpolation at t=0', () => {
    const result = lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('linear interpolation at t=0.5', () => {
    const result = lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5);
    expect(result).toEqual({ x: 5, y: 10 });
  });

  it('linear interpolation at t=1', () => {
    const result = lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 1);
    expect(result).toEqual({ x: 10, y: 20 });
  });

  it('normalizes a vector', () => {
    const n = normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
    expect(distance({ x: 0, y: 0 }, n)).toBeCloseTo(1);
  });

  it('handles zero vector normalization', () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('calculates dot product', () => {
    expect(dot({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11); // 1*3 + 2*4
  });

  it('calculates dot product for perpendicular vectors', () => {
    expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
  });

  it('calculates angle between points', () => {
    expect(angle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(0);
    expect(angle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
    expect(angle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
    expect(angle({ x: 0, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2);
  });

  it('rotates a point 90 degrees', () => {
    const result = rotate({ x: 1, y: 0 }, Math.PI / 2);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(1);
  });

  it('rotates a point 180 degrees', () => {
    const result = rotate({ x: 1, y: 0 }, Math.PI);
    expect(result.x).toBeCloseTo(-1);
    expect(result.y).toBeCloseTo(0);
  });

  it('rotates around custom origin', () => {
    const result = rotate({ x: 2, y: 1 }, Math.PI / 2, { x: 1, y: 1 });
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(2);
  });

  it('checks point equality with epsilon', () => {
    expect(equals({ x: 1.0001, y: 2.0001 }, { x: 1, y: 2 })).toBe(true); // within default epsilon 0.001
    expect(equals({ x: 1.0001, y: 2.0001 }, { x: 1, y: 2 }, 0.01)).toBe(true);
    expect(equals({ x: 1.5, y: 2 }, { x: 1, y: 2 })).toBe(false);
    expect(equals({ x: 1.002, y: 2 }, { x: 1, y: 2 }, 0.001)).toBe(false); // outside epsilon
  });

  it('checks point exact equality', () => {
    expect(equals({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
  });
});

describe('Rect operations', () => {
  it('creates a rect', () => {
    const r = rect(10, 20, 100, 50);
    expect(r).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('calculates center', () => {
    expect(center({ x: 0, y: 0, width: 100, height: 50 })).toEqual({ x: 50, y: 25 });
  });

  it('calculates center for negative position', () => {
    expect(center({ x: -100, y: -50, width: 200, height: 100 })).toEqual({ x: 0, y: 0 });
  });

  it('calculates topLeft', () => {
    expect(topLeft({ x: 10, y: 20, width: 100, height: 50 })).toEqual({ x: 10, y: 20 });
  });

  it('calculates topRight', () => {
    expect(topRight({ x: 10, y: 20, width: 100, height: 50 })).toEqual({ x: 110, y: 20 });
  });

  it('calculates bottomLeft', () => {
    expect(bottomLeft({ x: 10, y: 20, width: 100, height: 50 })).toEqual({ x: 10, y: 70 });
  });

  it('calculates bottomRight', () => {
    expect(bottomRight({ x: 10, y: 20, width: 100, height: 50 })).toEqual({ x: 110, y: 70 });
  });

  it('checks containment - point inside', () => {
    const r = rect(0, 0, 100, 100);
    expect(contains(r, { x: 50, y: 50 })).toBe(true);
  });

  it('checks containment - point on edge', () => {
    const r = rect(0, 0, 100, 100);
    expect(contains(r, { x: 0, y: 0 })).toBe(true);
    expect(contains(r, { x: 100, y: 100 })).toBe(true);
  });

  it('checks containment - point outside', () => {
    const r = rect(0, 0, 100, 100);
    expect(contains(r, { x: 150, y: 50 })).toBe(false);
    expect(contains(r, { x: 50, y: 150 })).toBe(false);
  });

  it('checks intersection - overlapping rects', () => {
    const a = rect(0, 0, 100, 100);
    const b = rect(50, 50, 100, 100);
    expect(intersects(a, b)).toBe(true);
  });

  it('checks intersection - non-overlapping rects', () => {
    const a = rect(0, 0, 100, 100);
    const c = rect(200, 200, 100, 100);
    expect(intersects(a, c)).toBe(false);
  });

  it('checks intersection - touching rects', () => {
    const a = rect(0, 0, 100, 100);
    const b = rect(100, 0, 100, 100);
    expect(intersects(a, b)).toBe(false); // touching but not overlapping
  });

  it('expands a rect', () => {
    const r = expand(rect(10, 10, 100, 100), 5);
    expect(r).toEqual({ x: 5, y: 5, width: 110, height: 110 });
  });

  it('expands with negative padding (shrink)', () => {
    const r = expand(rect(10, 10, 100, 100), -5);
    expect(r).toEqual({ x: 15, y: 15, width: 90, height: 90 });
  });

  it('computes union of two rects', () => {
    const u = union(rect(0, 0, 50, 50), rect(25, 25, 50, 50));
    expect(u).toEqual({ x: 0, y: 0, width: 75, height: 75 });
  });

  it('computes union of non-overlapping rects', () => {
    const u = union(rect(0, 0, 50, 50), rect(100, 100, 50, 50));
    expect(u).toEqual({ x: 0, y: 0, width: 150, height: 150 });
  });

  it('creates rect from points', () => {
    const r = fromPoints([{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 25 }]);
    expect(r).toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });

  it('creates rect from single point', () => {
    const r = fromPoints([{ x: 50, y: 75 }]);
    expect(r).toEqual({ x: 50, y: 75, width: 0, height: 0 });
  });

  it('returns zero rect for empty points', () => {
    expect(fromPoints([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('creates rect from negative coordinates', () => {
    const r = fromPoints([{ x: -50, y: -100 }, { x: 50, y: 100 }]);
    expect(r).toEqual({ x: -50, y: -100, width: 100, height: 200 });
  });

  it('calculates boundary intersection - right side', () => {
    const r = rect(0, 0, 100, 100);
    const intersection = boundaryIntersection(r, { x: 150, y: 50 });
    expect(intersection.x).toBeCloseTo(100);
    expect(intersection.y).toBeCloseTo(50);
  });

  it('calculates boundary intersection - top side', () => {
    const r = rect(0, 0, 100, 100);
    const intersection = boundaryIntersection(r, { x: 50, y: -50 });
    expect(intersection.x).toBeCloseTo(50);
    expect(intersection.y).toBeCloseTo(0);
  });

  it('calculates boundary intersection - bottom side', () => {
    const r = rect(0, 0, 100, 100);
    const intersection = boundaryIntersection(r, { x: 50, y: 200 });
    expect(intersection.x).toBeCloseTo(50);
    expect(intersection.y).toBeCloseTo(100);
  });

  it('calculates boundary intersection - left side', () => {
    const r = rect(0, 0, 100, 100);
    const intersection = boundaryIntersection(r, { x: -50, y: 50 });
    expect(intersection.x).toBeCloseTo(0);
    expect(intersection.y).toBeCloseTo(50);
  });

  it('handles boundary intersection from center', () => {
    const r = rect(0, 0, 100, 100);
    const intersection = boundaryIntersection(r, { x: 50, y: 50 });
    expect(intersection.x).toBeCloseTo(50);
    expect(intersection.y).toBeCloseTo(50);
  });
});

describe('Intersection operations', () => {
  it('finds line-line intersection', () => {
    const result = lineLineIntersection(
      { x: 0, y: 0 }, { x: 10, y: 10 },
      { x: 0, y: 10 }, { x: 10, y: 0 }
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(5);
    expect(result!.y).toBeCloseTo(5);
  });

  it('returns null for parallel lines', () => {
    const result = lineLineIntersection(
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 0, y: 5 }, { x: 10, y: 5 }
    );
    expect(result).toBeNull();
  });

  it('finds intersection of perpendicular lines', () => {
    const result = lineLineIntersection(
      { x: 5, y: 0 }, { x: 5, y: 10 },
      { x: 0, y: 5 }, { x: 10, y: 5 }
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(5);
    expect(result!.y).toBeCloseTo(5);
  });

  it('finds segment-segment intersection', () => {
    const result = segmentSegmentIntersection(
      { x: 0, y: 0 }, { x: 10, y: 10 },
      { x: 0, y: 10 }, { x: 10, y: 0 }
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(5);
    expect(result!.y).toBeCloseTo(5);
  });

  it('returns null for non-intersecting segments', () => {
    const result = segmentSegmentIntersection(
      { x: 0, y: 0 }, { x: 5, y: 5 },
      { x: 6, y: 0 }, { x: 10, y: 0 }
    );
    expect(result).toBeNull();
  });

  it('returns null for parallel segments', () => {
    const result = segmentSegmentIntersection(
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 0, y: 5 }, { x: 10, y: 5 }
    );
    expect(result).toBeNull();
  });

  it('finds intersection at segment endpoints', () => {
    const result = segmentSegmentIntersection(
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 10, y: 0 }, { x: 10, y: 10 }
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(10);
    expect(result!.y).toBeCloseTo(0);
  });

  it('finds line-rect intersection - right side', () => {
    const r = rect(0, 0, 100, 100);
    const result = lineRectIntersection({ x: 50, y: 50 }, { x: 150, y: 50 }, r);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(100);
    expect(result!.y).toBeCloseTo(50);
  });

  it('finds line-rect intersection - top side', () => {
    const r = rect(0, 0, 100, 100);
    const result = lineRectIntersection({ x: 50, y: 50 }, { x: 50, y: -50 }, r);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(50);
    expect(result!.y).toBeCloseTo(0);
  });

  it('returns null for line not intersecting rect', () => {
    const r = rect(0, 0, 100, 100);
    const result = lineRectIntersection({ x: 150, y: 50 }, { x: 200, y: 50 }, r);
    expect(result).toBeNull();
  });

  it('calculates ellipse boundary point - right', () => {
    const p = ellipseBoundaryPoint(50, 50, 40, 30, { x: 150, y: 50 });
    expect(p.x).toBeCloseTo(90); // 50 + 40
    expect(p.y).toBeCloseTo(50);
  });

  it('calculates ellipse boundary point - top', () => {
    const p = ellipseBoundaryPoint(50, 50, 40, 30, { x: 50, y: -50 });
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(20); // 50 - 30
  });

  it('calculates ellipse boundary point - diagonal', () => {
    const p = ellipseBoundaryPoint(50, 50, 40, 30, { x: 100, y: 100 });
    const angle = Math.atan2(50, 50); // 45 degrees
    expect(p.x).toBeCloseTo(50 + 40 * Math.cos(angle));
    expect(p.y).toBeCloseTo(50 + 30 * Math.sin(angle));
  });

  it('calculates ellipse boundary point - same as center', () => {
    const p = ellipseBoundaryPoint(50, 50, 40, 30, { x: 50, y: 50 });
    expect(p.x).toBeCloseTo(90); // defaults to right
    expect(p.y).toBeCloseTo(50);
  });
});
