// Pure geometric point operations
export interface Point {
  readonly x: number;
  readonly y: number;
}

export const point = (x: number, y: number): Point => ({ x, y });

export const add = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const subtract = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const scale = (p: Point, factor: number): Point => ({
  x: p.x * factor,
  y: p.y * factor,
});

export const distance = (a: Point, b: Point): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const normalize = (p: Point): Point => {
  const len = Math.sqrt(p.x ** 2 + p.y ** 2);
  if (len === 0) return { x: 0, y: 0 };
  return { x: p.x / len, y: p.y / len };
};

export const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;

export const angle = (a: Point, b: Point): number =>
  Math.atan2(b.y - a.y, b.x - a.x);

export const rotate = (p: Point, radians: number, origin: Point = { x: 0, y: 0 }): Point => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
};

export const equals = (a: Point, b: Point, epsilon = 0.001): boolean =>
  Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
