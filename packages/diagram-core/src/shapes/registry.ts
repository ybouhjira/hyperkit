import type { Node } from '../graph/types';
import type { Rect } from '../geometry/rect';
import type { Point } from '../geometry/point';

// Shape definition - defines how to compute the boundary of a shape
export interface ShapeDefinition {
  readonly name: string;
  // Get the bounding rect of the node
  readonly getBounds: (node: Node) => Rect;
  // Get the intersection point where a line from center to external point hits the shape boundary
  readonly getBoundaryPoint: (node: Node, externalPoint: Point) => Point;
  // Get SVG path data for the shape outline
  readonly getPath: (node: Node) => string;
  // Get the points where ports should be placed (N/S/E/W centers)
  readonly getPortPositions: (node: Node) => {
    north: Point;
    south: Point;
    east: Point;
    west: Point;
  };
}

// Global shape registry
const registry = new Map<string, ShapeDefinition>();

export const registerShape = (shape: ShapeDefinition): void => {
  registry.set(shape.name, shape);
};

export const getShape = (name: string): ShapeDefinition | undefined =>
  registry.get(name);

export const getShapeOrDefault = (name: string): ShapeDefinition =>
  registry.get(name) ?? registry.get('rectangle')!;

export const listShapes = (): ReadonlyArray<string> => Array.from(registry.keys());

// ─── Helper Functions ───

/** Find where a ray from center hits a polygon boundary */
const polygonBoundaryPoint = (
  cx: number, cy: number,
  dx: number, dy: number,
  vertices: ReadonlyArray<{ x: number; y: number }>
): { x: number; y: number } => {
  let minT = Infinity;
  let bestPoint = { x: cx + dx, y: cy + dy };

  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i]!;
    const b = vertices[(i + 1) % vertices.length]!;

    // Ray from (cx, cy) in direction (dx, dy): P = (cx + t*dx, cy + t*dy)
    // Segment from a to b: Q = a + s*(b-a), s in [0,1]
    // Solve: cx + t*dx = a.x + s*(b.x - a.x)
    //        cy + t*dy = a.y + s*(b.y - a.y)

    const edgeDx = b.x - a.x;
    const edgeDy = b.y - a.y;
    const denom = dx * edgeDy - dy * edgeDx;

    if (Math.abs(denom) < 1e-10) continue; // Parallel

    const t = ((a.x - cx) * edgeDy - (a.y - cy) * edgeDx) / denom;
    const s = ((a.x - cx) * dy - (a.y - cy) * dx) / denom;

    if (t > 0 && s >= 0 && s <= 1 && t < minT) {
      minT = t;
      bestPoint = { x: cx + t * dx, y: cy + t * dy };
    }
  }

  return bestPoint;
};

// ─── Built-in Shapes ───

const rectangleShape: ShapeDefinition = {
  name: 'rectangle',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const cx = node.position.x + node.size.width / 2;
    const cy = node.position.y + node.size.height / 2;
    const dx = ext.x - cx;
    const dy = ext.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    const halfW = node.size.width / 2;
    const halfH = node.size.height / 2;
    const t = Math.abs(dx) * halfH > Math.abs(dy) * halfW
      ? halfW / Math.abs(dx)
      : halfH / Math.abs(dy);
    return { x: cx + dx * t, y: cy + dy * t };
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const r = node.style.borderRadius ?? 8;
    if (r > 0) {
      const cr = Math.min(r, w / 2, h / 2);
      return `M ${x + cr} ${y} L ${x + w - cr} ${y} Q ${x + w} ${y} ${x + w} ${y + cr} L ${x + w} ${y + h - cr} Q ${x + w} ${y + h} ${x + w - cr} ${y + h} L ${x + cr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - cr} L ${x} ${y + cr} Q ${x} ${y} ${x + cr} ${y} Z`;
    }
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const ellipseShape: ShapeDefinition = {
  name: 'ellipse',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const cx = node.position.x + node.size.width / 2;
    const cy = node.position.y + node.size.height / 2;
    const rx = node.size.width / 2;
    const ry = node.size.height / 2;
    const angle = Math.atan2(ext.y - cy, ext.x - cx);
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  },
  getPath: (node) => {
    const cx = node.position.x + node.size.width / 2;
    const cy = node.position.y + node.size.height / 2;
    const rx = node.size.width / 2;
    const ry = node.size.height / 2;
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const diamondShape: ShapeDefinition = {
  name: 'diamond',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const cx = node.position.x + node.size.width / 2;
    const cy = node.position.y + node.size.height / 2;
    const dx = ext.x - cx;
    const dy = ext.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    const halfW = node.size.width / 2;
    const halfH = node.size.height / 2;
    // Diamond boundary: |dx/halfW| + |dy/halfH| = 1
    const scale = 1 / (Math.abs(dx) / halfW + Math.abs(dy) / halfH);
    return { x: cx + dx * scale, y: cy + dy * scale };
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const mx = x + w / 2;
    const my = y + h / 2;
    return `M ${mx} ${y} L ${x + w} ${my} L ${mx} ${y + h} L ${x} ${my} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const hexagonShape: ShapeDefinition = {
  name: 'hexagon',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = ext.x - cx;
    const dy = ext.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    const inset = w * 0.25;
    // Hexagon vertices
    const vertices = [
      { x: x + inset, y: y },
      { x: x + w - inset, y: y },
      { x: x + w, y: y + h / 2 },
      { x: x + w - inset, y: y + h },
      { x: x + inset, y: y + h },
      { x: x, y: y + h / 2 },
    ];

    return polygonBoundaryPoint(cx, cy, dx, dy, vertices);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const inset = w * 0.25;
    return `M ${x + inset} ${y} L ${x + w - inset} ${y} L ${x + w} ${y + h / 2} L ${x + w - inset} ${y + h} L ${x + inset} ${y + h} L ${x} ${y + h / 2} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const cylinderShape: ShapeDefinition = {
  name: 'cylinder',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    // Cylinder has straight vertical sides - rectangle boundary is visually accurate
    return rectangleShape.getBoundaryPoint(node, ext);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const ry = Math.min(h * 0.15, 20);
    return `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} L ${x + w} ${y + h - ry} A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const parallelogramShape: ShapeDefinition = {
  name: 'parallelogram',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = ext.x - cx;
    const dy = ext.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    const skew = w * 0.2;
    const vertices = [
      { x: x + skew, y: y },
      { x: x + w, y: y },
      { x: x + w - skew, y: y + h },
      { x: x, y: y + h },
    ];

    return polygonBoundaryPoint(cx, cy, dx, dy, vertices);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const skew = w * 0.2;
    return `M ${x + skew} ${y} L ${x + w} ${y} L ${x + w - skew} ${y + h} L ${x} ${y + h} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const triangleShape: ShapeDefinition = {
  name: 'triangle',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = ext.x - cx;
    const dy = ext.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    const vertices = [
      { x: x + w / 2, y: y },
      { x: x + w, y: y + h },
      { x: x, y: y + h },
    ];

    return polygonBoundaryPoint(cx, cy, dx, dy, vertices);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    return `M ${x + w / 2} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const documentShape: ShapeDefinition = {
  name: 'document',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    // Document is mostly rectangular with small wavy bottom - rectangle boundary is visually accurate
    return rectangleShape.getBoundaryPoint(node, ext);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const waveH = h * 0.15;
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h - waveH} Q ${x + w * 0.75} ${y + h} ${x + w / 2} ${y + h - waveH} Q ${x + w * 0.25} ${y + h - waveH * 2} ${x} ${y + h - waveH} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const cloudShape: ShapeDefinition = {
  name: 'cloud',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => ellipseShape.getBoundaryPoint(node, ext),
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    // Approximate cloud with overlapping arcs
    return `M ${x + w * 0.25} ${y + h * 0.7} A ${w * 0.25} ${h * 0.25} 0 1 1 ${x + w * 0.15} ${y + h * 0.45} A ${w * 0.2} ${h * 0.3} 0 1 1 ${x + w * 0.35} ${y + h * 0.2} A ${w * 0.25} ${h * 0.25} 0 1 1 ${x + w * 0.65} ${y + h * 0.2} A ${w * 0.2} ${h * 0.3} 0 1 1 ${x + w * 0.85} ${y + h * 0.45} A ${w * 0.25} ${h * 0.25} 0 1 1 ${x + w * 0.75} ${y + h * 0.7} Z`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const noteShape: ShapeDefinition = {
  name: 'note',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => {
    // Note is rectangular with small corner fold - rectangle boundary is visually accurate
    return rectangleShape.getBoundaryPoint(node, ext);
  },
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const fold = Math.min(w * 0.15, h * 0.15, 20);
    return `M ${x} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h} L ${x} ${y + h} Z M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold} L ${x + w} ${y + fold}`;
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

const starShape: ShapeDefinition = {
  name: 'star',
  getBounds: (node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height,
  }),
  getBoundaryPoint: (node, ext) => ellipseShape.getBoundaryPoint(node, ext),
  getPath: (node) => {
    const { x, y } = node.position;
    const { width: w, height: h } = node.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.4;
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      const px = cx + r * Math.cos(angle) * (w / Math.min(w, h));
      const py = cy + r * Math.sin(angle) * (h / Math.min(w, h));
      points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
    }
    return points.join(' ') + ' Z';
  },
  getPortPositions: (node) => ({
    north: { x: node.position.x + node.size.width / 2, y: node.position.y },
    south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
    east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
    west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
  }),
};

// Register all built-in shapes
export const registerBuiltinShapes = (): void => {
  registerShape(rectangleShape);
  registerShape(ellipseShape);
  registerShape(diamondShape);
  registerShape(hexagonShape);
  registerShape(cylinderShape);
  registerShape(parallelogramShape);
  registerShape(triangleShape);
  registerShape(documentShape);
  registerShape(cloudShape);
  registerShape(noteShape);
  registerShape(starShape);
};

// Auto-register on module load
registerBuiltinShapes();
