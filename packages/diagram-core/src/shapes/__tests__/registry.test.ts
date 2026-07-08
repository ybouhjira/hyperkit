import { describe, it, expect } from 'vitest';
import { getShape, getShapeOrDefault, listShapes, registerShape, type ShapeDefinition } from '../registry';
import { createNode } from '../../graph/operations';

describe('Shape Registry', () => {
  it('has built-in shapes registered', () => {
    const shapes = listShapes();
    expect(shapes).toContain('rectangle');
    expect(shapes).toContain('ellipse');
    expect(shapes).toContain('diamond');
    expect(shapes).toContain('hexagon');
    expect(shapes).toContain('cylinder');
    expect(shapes).toContain('triangle');
    expect(shapes).toContain('document');
    expect(shapes).toContain('cloud');
    expect(shapes).toContain('note');
    expect(shapes).toContain('star');
    expect(shapes).toContain('parallelogram');
  });

  it('retrieves a shape by name', () => {
    const shape = getShape('rectangle');
    expect(shape).toBeDefined();
    expect(shape!.name).toBe('rectangle');
  });

  it('returns undefined for unknown shape', () => {
    expect(getShape('nonexistent')).toBeUndefined();
  });

  it('returns default (rectangle) for unknown shape via getShapeOrDefault', () => {
    const shape = getShapeOrDefault('nonexistent');
    expect(shape.name).toBe('rectangle');
  });

  it('allows registering custom shapes', () => {
    const custom: ShapeDefinition = {
      name: 'custom-test',
      getBounds: (node) => ({
        x: node.position.x,
        y: node.position.y,
        width: node.size.width,
        height: node.size.height,
      }),
      getBoundaryPoint: (node, ext) => ({
        x: node.position.x + node.size.width / 2,
        y: node.position.y + node.size.height / 2,
      }),
      getPath: (node) => `M 0 0 L ${node.size.width} 0`,
      getPortPositions: (node) => ({
        north: { x: node.position.x + node.size.width / 2, y: node.position.y },
        south: { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
        east: { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
        west: { x: node.position.x, y: node.position.y + node.size.height / 2 },
      }),
    };
    registerShape(custom);
    expect(getShape('custom-test')).toBe(custom);
  });

  describe('rectangle shape', () => {
    it('generates correct SVG path without border radius', () => {
      const node = createNode('n', {}, { position: { x: 10, y: 20 }, size: { width: 100, height: 50 }, style: { borderRadius: 0 } });
      const shape = getShapeOrDefault('rectangle');
      const path = shape.getPath(node);
      expect(path).toContain('M 10 20');
      expect(path).toContain('L 110 20');
      expect(path).toContain('L 110 70');
      expect(path).toContain('L 10 70');
    });

    it('generates rounded corners by default (borderRadius: 8)', () => {
      const node = createNode('n', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 } });
      const shape = getShapeOrDefault('rectangle');
      const path = shape.getPath(node);
      expect(path).toContain('Q'); // default borderRadius = 8 produces quadratic curves
    });

    it('generates correct SVG path with explicit border radius', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        style: { borderRadius: 5 },
      });
      const shape = getShapeOrDefault('rectangle');
      const path = shape.getPath(node);
      expect(path).toContain('Q'); // quadratic bezier for rounded corners
    });

    it('calculates correct boundary point - right', () => {
      const node = createNode('n', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } });
      const shape = getShapeOrDefault('rectangle');
      const bp = shape.getBoundaryPoint(node, { x: 200, y: 50 });
      expect(bp.x).toBeCloseTo(100);
      expect(bp.y).toBeCloseTo(50);
    });

    it('calculates correct boundary point - top', () => {
      const node = createNode('n', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } });
      const shape = getShapeOrDefault('rectangle');
      const bp = shape.getBoundaryPoint(node, { x: 50, y: -100 });
      expect(bp.x).toBeCloseTo(50);
      expect(bp.y).toBeCloseTo(0);
    });

    it('handles boundary point at center', () => {
      const node = createNode('n', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } });
      const shape = getShapeOrDefault('rectangle');
      const bp = shape.getBoundaryPoint(node, { x: 50, y: 50 });
      expect(bp).toEqual({ x: 50, y: 50 });
    });

    it('returns correct port positions', () => {
      const node = createNode('n', {}, { position: { x: 0, y: 0 }, size: { width: 100, height: 50 } });
      const shape = getShapeOrDefault('rectangle');
      const ports = shape.getPortPositions(node);
      expect(ports.north).toEqual({ x: 50, y: 0 });
      expect(ports.south).toEqual({ x: 50, y: 50 });
      expect(ports.east).toEqual({ x: 100, y: 25 });
      expect(ports.west).toEqual({ x: 0, y: 25 });
    });

    it('returns correct bounds', () => {
      const node = createNode('n', {}, { position: { x: 10, y: 20 }, size: { width: 100, height: 50 } });
      const shape = getShapeOrDefault('rectangle');
      const bounds = shape.getBounds(node);
      expect(bounds).toEqual({ x: 10, y: 20, width: 100, height: 50 });
    });
  });

  describe('ellipse shape', () => {
    it('calculates boundary point on horizontal axis', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 60 },
        shape: 'ellipse',
      });
      const shape = getShapeOrDefault('ellipse');
      const bp = shape.getBoundaryPoint(node, { x: 200, y: 30 });
      expect(bp.x).toBeCloseTo(100); // right edge of ellipse (cx + rx)
      expect(bp.y).toBeCloseTo(30); // center vertically
    });

    it('calculates boundary point on vertical axis', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 60 },
        shape: 'ellipse',
      });
      const shape = getShapeOrDefault('ellipse');
      const bp = shape.getBoundaryPoint(node, { x: 50, y: 100 });
      expect(bp.x).toBeCloseTo(50);
      expect(bp.y).toBeCloseTo(60); // bottom edge (cy + ry)
    });

    it('generates correct SVG path', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 60 },
        shape: 'ellipse',
      });
      const shape = getShapeOrDefault('ellipse');
      const path = shape.getPath(node);
      expect(path).toContain('A'); // arc command
      expect(path).toContain('50'); // rx
      expect(path).toContain('30'); // ry
    });
  });

  describe('diamond shape', () => {
    it('calculates boundary point correctly', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'diamond',
      });
      const shape = getShapeOrDefault('diamond');
      const bp = shape.getBoundaryPoint(node, { x: 200, y: 50 });
      // For diamond, boundary follows |dx/halfW| + |dy/halfH| = 1
      expect(bp.x).toBeGreaterThan(50);
      expect(bp.x).toBeLessThanOrEqual(100);
    });

    it('generates correct SVG path', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'diamond',
      });
      const shape = getShapeOrDefault('diamond');
      const path = shape.getPath(node);
      expect(path).toContain('M 50 0'); // top point
      expect(path).toContain('L 100 50'); // right point
      expect(path).toContain('L 50 100'); // bottom point
      expect(path).toContain('L 0 50'); // left point
    });
  });

  describe('hexagon shape', () => {
    it('generates correct SVG path', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'hexagon',
      });
      const shape = getShapeOrDefault('hexagon');
      const path = shape.getPath(node);
      expect(path).toContain('M'); // moveto
      expect(path).toContain('L'); // lineto
      expect(path).toContain('Z'); // closepath
    });

    it('returns correct port positions', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'hexagon',
      });
      const shape = getShapeOrDefault('hexagon');
      const ports = shape.getPortPositions(node);
      expect(ports.north.y).toBe(0);
      expect(ports.south.y).toBe(100);
      expect(ports.east.x).toBe(100);
      expect(ports.west.x).toBe(0);
    });
  });

  describe('triangle shape', () => {
    it('generates correct SVG path', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'triangle',
      });
      const shape = getShapeOrDefault('triangle');
      const path = shape.getPath(node);
      expect(path).toContain('M 50 0'); // top point
      expect(path).toContain('L 100 100'); // bottom right
      expect(path).toContain('L 0 100'); // bottom left
    });
  });

  describe('cylinder shape', () => {
    it('generates correct SVG path with arcs', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'cylinder',
      });
      const shape = getShapeOrDefault('cylinder');
      const path = shape.getPath(node);
      expect(path).toContain('A'); // arc for top ellipse
    });
  });

  describe('document shape', () => {
    it('generates correct SVG path with curved bottom', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'document',
      });
      const shape = getShapeOrDefault('document');
      const path = shape.getPath(node);
      expect(path).toContain('Q'); // quadratic bezier for wavy bottom
    });
  });

  describe('cloud shape', () => {
    it('generates correct SVG path with arcs', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'cloud',
      });
      const shape = getShapeOrDefault('cloud');
      const path = shape.getPath(node);
      expect(path).toContain('A'); // multiple arcs
    });
  });

  describe('note shape', () => {
    it('generates correct SVG path with folded corner', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'note',
      });
      const shape = getShapeOrDefault('note');
      const path = shape.getPath(node);
      expect(path).toContain('M'); // multiple move commands for fold
      expect(path.split('M').length).toBeGreaterThan(1);
    });
  });

  describe('star shape', () => {
    it('generates correct SVG path with 10 points', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        shape: 'star',
      });
      const shape = getShapeOrDefault('star');
      const path = shape.getPath(node);
      const lineCount = (path.match(/L/g) || []).length;
      expect(lineCount).toBe(9); // 10 points, first is M, rest are L
    });
  });

  describe('parallelogram shape', () => {
    it('generates correct SVG path with skew', () => {
      const node = createNode('n', {}, {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        shape: 'parallelogram',
      });
      const shape = getShapeOrDefault('parallelogram');
      const path = shape.getPath(node);
      expect(path).toContain('M'); // start
      expect(path).toContain('L'); // lines
      expect(path).toContain('Z'); // close
    });
  });
});
