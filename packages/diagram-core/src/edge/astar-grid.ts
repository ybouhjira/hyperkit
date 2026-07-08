/**
 * A* grid infrastructure: types, geometry helpers, occupancy grid, MinHeap,
 * and the core A* search algorithm.
 *
 * This module has no dependency on the shape registry or SolidJS — it is
 * purely algorithmic and independently testable.
 */
import type { Node } from '../graph/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Point = { readonly x: number; readonly y: number };
export type Direction = 'north' | 'south' | 'east' | 'west';

export interface GridCell {
  readonly gx: number;
  readonly gy: number;
}

export interface AStarNode {
  readonly gx: number;
  readonly gy: number;
  readonly g: number; // cost from start
  readonly h: number; // heuristic to goal
  readonly f: number; // g + h
  readonly parent: AStarNode | null;
  readonly dir: Direction | null; // direction we came from
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

const nodeRect = (
  node: Node,
  padding: number
): { x: number; y: number; width: number; height: number } => ({
  x: node.position.x - padding,
  y: node.position.y - padding,
  width: node.size.width + padding * 2,
  height: node.size.height + padding * 2,
});

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

export const extendPoint = (p: Point, dir: Direction, padding: number): Point => {
  const v = directionVector(dir);
  return { x: p.x + v.x * padding, y: p.y + v.y * padding };
};

// ─── Occupancy grid ───────────────────────────────────────────────────────────

export const buildOccupancyGrid = (
  obstacles: ReadonlyArray<Node>,
  padding: number,
  gridSize: number
): Set<string> => {
  const blocked = new Set<string>();

  for (const node of obstacles) {
    const rect = nodeRect(node, padding);

    const minGx = Math.floor(rect.x / gridSize);
    const maxGx = Math.ceil((rect.x + rect.width) / gridSize);
    const minGy = Math.floor(rect.y / gridSize);
    const maxGy = Math.ceil((rect.y + rect.height) / gridSize);

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gy = minGy; gy <= maxGy; gy++) {
        blocked.add(`${gx},${gy}`);
      }
    }
  }

  return blocked;
};

export const cellKey = (gx: number, gy: number): string => `${gx},${gy}`;

// ─── Priority queue (min-heap by f) ──────────────────────────────────────────

export class MinHeap {
  private readonly heap: AStarNode[] = [];

  get size(): number {
    return this.heap.length;
  }

  push(node: AStarNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): AStarNode | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent]!.f <= this.heap[i]!.f) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i]!, this.heap[parent]!];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left]!.f < this.heap[smallest]!.f) smallest = left;
      if (right < n && this.heap[right]!.f < this.heap[smallest]!.f) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest]!, this.heap[i]!];
      i = smallest;
    }
  }
}

// ─── A* algorithm ─────────────────────────────────────────────────────────────

const NEIGHBOR_DIRECTIONS: ReadonlyArray<{ gx: number; gy: number; dir: Direction }> = [
  { gx: 0, gy: -1, dir: 'north' },
  { gx: 0, gy: 1, dir: 'south' },
  { gx: 1, gy: 0, dir: 'east' },
  { gx: -1, gy: 0, dir: 'west' },
];

export const runAStar = (
  startCell: GridCell,
  goalCell: GridCell,
  blocked: Set<string>,
  maxSearchNodes: number
): AStarNode | null => {
  const openSet = new MinHeap();
  // closed set: tracks best g-cost seen per cell
  const closedMap = new Map<string, number>();

  const startH = Math.abs(goalCell.gx - startCell.gx) + Math.abs(goalCell.gy - startCell.gy);
  const startNode: AStarNode = {
    gx: startCell.gx,
    gy: startCell.gy,
    g: 0,
    h: startH,
    f: startH,
    parent: null,
    dir: null,
  };

  openSet.push(startNode);
  let searchedNodes = 0;

  while (openSet.size > 0 && searchedNodes < maxSearchNodes) {
    const current = openSet.pop()!;
    searchedNodes++;

    const key = cellKey(current.gx, current.gy);

    // Skip if we already processed this cell with a lower or equal cost
    const bestG = closedMap.get(key);
    if (bestG !== undefined && bestG <= current.g) continue;
    closedMap.set(key, current.g);

    // Goal reached
    if (current.gx === goalCell.gx && current.gy === goalCell.gy) {
      return current;
    }

    for (const neighbor of NEIGHBOR_DIRECTIONS) {
      const ngx = current.gx + neighbor.gx;
      const ngy = current.gy + neighbor.gy;
      const nkey = cellKey(ngx, ngy);

      if (blocked.has(nkey)) continue;

      // Slight turn penalty to prefer continuing in same direction (cleaner paths)
      const turnCost = current.dir !== null && neighbor.dir !== current.dir ? 0.001 : 0;
      const ng = current.g + 1 + turnCost;

      const existingBest = closedMap.get(nkey);
      if (existingBest !== undefined && existingBest <= ng) continue;

      const nh = Math.abs(goalCell.gx - ngx) + Math.abs(goalCell.gy - ngy);
      openSet.push({
        gx: ngx,
        gy: ngy,
        g: ng,
        h: nh,
        f: ng + nh,
        parent: current,
        dir: neighbor.dir,
      });
    }
  }

  return null; // no path found
};
