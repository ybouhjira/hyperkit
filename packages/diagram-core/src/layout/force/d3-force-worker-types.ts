/**
 * TypeScript type definitions for the D3-force Web Worker message protocol.
 * Used by both d3-force.ts (main thread) and d3-force.worker.ts (worker factory).
 */

export interface WorkerNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface WorkerEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
}

export interface WorkerOptions {
  readonly strength: number;
  readonly distance: number;
  readonly charge: number;
  readonly iterations: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly collisionRadius: number;
  readonly padding: number;
}

export interface WorkerInput {
  readonly nodes: ReadonlyArray<WorkerNode>;
  readonly edges: ReadonlyArray<WorkerEdge>;
  readonly options: WorkerOptions;
}

/** Raw positions (before adjustEdgeEndpoints).  Key = node id. */
export interface WorkerPositionEntry {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/** Raw edge path data (centre-to-centre, before adjustEdgeEndpoints). */
export interface WorkerEdgeEntry {
  readonly id: string;
  readonly sx: number;
  readonly sy: number;
  readonly tx: number;
  readonly ty: number;
}

export interface WorkerBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type WorkerOutput =
  | {
      readonly ok: true;
      readonly positions: ReadonlyArray<WorkerPositionEntry>;
      readonly edges: ReadonlyArray<WorkerEdgeEntry>;
      readonly bounds: WorkerBounds;
    }
  | { readonly ok: false; readonly error: string };
