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
