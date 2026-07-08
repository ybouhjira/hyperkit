/**
 * D3-force Web Worker factory.
 *
 * Responsibility split:
 *   d3-force-worker-types.ts   — TypeScript message protocol interfaces
 *   d3-force-worker-source.ts  — Self-contained force simulation source string
 *   d3-force.worker.ts (this)  — Re-exports public types + worker factory
 */

// Re-export all public types so existing imports from this file continue to work
export type {
  WorkerNode,
  WorkerEdge,
  WorkerOptions,
  WorkerInput,
  WorkerPositionEntry,
  WorkerEdgeEntry,
  WorkerBounds,
  WorkerOutput,
} from './d3-force-worker-types';

import { buildWorkerSource } from './d3-force-worker-source';

// ─── Worker factory ───────────────────────────────────────────────────────────

/**
 * Creates a new Web Worker running the self-contained force simulation.
 * Returns `null` when `Worker` is not available (Node.js / SSR).
 */
export const createForceWorker = (): Worker | null => {
  if (typeof Worker === 'undefined') return null;
  const src = buildWorkerSource();
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  // Revoke the object URL immediately — the worker has already been created
  // and holds its own internal reference to the script.
  URL.revokeObjectURL(url);
  return worker;
};
