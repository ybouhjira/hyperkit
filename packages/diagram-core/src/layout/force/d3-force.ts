import { Effect } from 'effect';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import type { Graph, LayoutResult, LayoutAlgorithm, NodeId, EdgeId, EdgePath } from '../../graph/types';
import { LayoutError } from '../../errors';
import type { BaseLayoutOptions } from '../types';
import { adjustEdgeEndpoints } from '../adjust-endpoints';
import { removeOverlaps } from '../overlap-removal';
import {
  createForceWorker,
  type WorkerInput,
  type WorkerOutput,
} from './d3-force.worker';

export interface D3ForceLayoutOptions extends BaseLayoutOptions {
  readonly strength?: number;
  readonly distance?: number;
  readonly charge?: number;
  readonly iterations?: number;
  readonly centerX?: number;
  readonly centerY?: number;
  readonly collisionRadius?: number;
  /**
   * Run the overlap-removal pass after the force simulation (default: true).
   * Force layouts produce approximate positions and may leave nodes overlapping;
   * this pass pushes them apart until all pairs are separated by at least
   * `overlapPadding` pixels.
   */
  readonly removeOverlaps?: boolean;
  /** Minimum gap between node boundaries when removeOverlaps is active (default: 20) */
  readonly overlapPadding?: number;
}

interface ForceNode extends SimulationNodeDatum {
  id: string;
  width: number;
  height: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  id: string;
}

const DEFAULT_OPTIONS: Required<D3ForceLayoutOptions> = {
  strength: 1,
  distance: 150,
  charge: -300,
  iterations: 300,
  centerX: 400,
  centerY: 300,
  collisionRadius: 80,
  padding: 40,
  removeOverlaps: true,
  overlapPadding: 20,
};

// ─── Synchronous implementation (keeps existing LayoutAlgorithm contract) ─────

const runD3ForceLayout = (
  graph: Graph,
  options: D3ForceLayoutOptions = {}
): Effect.Effect<LayoutResult, LayoutError> =>
  Effect.try({
    try: () => {
      const opts = { ...DEFAULT_OPTIONS, ...options };

      // Create simulation nodes
      const nodes: ForceNode[] = [...graph.nodes.entries()].map(([id, node]) => ({
        id,
        x: node.position.x || Math.random() * opts.centerX * 2,
        y: node.position.y || Math.random() * opts.centerY * 2,
        width: node.size.width,
        height: node.size.height,
      }));

      // Create simulation links
      const links: ForceLink[] = [...graph.edges.entries()].map(([id, edge]) => ({
        id,
        source: edge.source as string,
        target: edge.target as string,
      }));

      // Run simulation
      const simulation = forceSimulation(nodes)
        .force(
          'link',
          forceLink<ForceNode, ForceLink>(links)
            .id((d) => d.id)
            .distance(opts.distance)
            .strength(opts.strength)
        )
        .force('charge', forceManyBody().strength(opts.charge))
        .force('center', forceCenter(opts.centerX, opts.centerY))
        .force(
          'collide',
          forceCollide<ForceNode>().radius((d) => Math.max(d.width, d.height) / 2 + 10)
        )
        .stop();

      // Run iterations synchronously
      for (let i = 0; i < opts.iterations; i++) {
        simulation.tick();
      }

      // Extract positions
      const nodePositions = new Map<NodeId, { x: number; y: number }>();
      for (const node of nodes) {
        nodePositions.set(node.id as NodeId, {
          x: (node.x ?? 0) - node.width / 2,
          y: (node.y ?? 0) - node.height / 2,
        });
      }

      // Generate straight-line edge paths (edge routers handle curves later)
      const edgePaths = new Map<EdgeId, EdgePath>();
      for (const link of links) {
        const sourceNode = typeof link.source === 'object' ? link.source : nodes.find((n) => n.id === link.source);
        const targetNode = typeof link.target === 'object' ? link.target : nodes.find((n) => n.id === link.target);
        if (sourceNode && targetNode) {
          const sx = sourceNode.x ?? 0;
          const sy = sourceNode.y ?? 0;
          const tx = targetNode.x ?? 0;
          const ty = targetNode.y ?? 0;
          const points = [{ x: sx, y: sy }, { x: tx, y: ty }];
          edgePaths.set(link.id as EdgeId, {
            d: `M ${sx} ${sy} L ${tx} ${ty}`,
            points,
            sourceIntersection: points[0]!,
            targetIntersection: points[1]!,
            labelPosition: { x: (sx + tx) / 2, y: (sy + ty) / 2 },
          });
        }
      }

      // Compute bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [nodeId, pos] of nodePositions) {
        const node = graph.nodes.get(nodeId);
        if (node) {
          minX = Math.min(minX, pos.x);
          minY = Math.min(minY, pos.y);
          maxX = Math.max(maxX, pos.x + node.size.width);
          maxY = Math.max(maxY, pos.y + node.size.height);
        }
      }

      const bounds = {
        x: minX - opts.padding,
        y: minY - opts.padding,
        width: (maxX - minX) + opts.padding * 2,
        height: (maxY - minY) + opts.padding * 2,
      };

      const rawResult = { nodePositions, edgePaths, bounds } satisfies LayoutResult;
      const withEndpoints = adjustEdgeEndpoints(graph, rawResult);

      if (!opts.removeOverlaps) return withEndpoints;

      const deoverlapped = removeOverlaps(withEndpoints, graph, { padding: opts.overlapPadding });

      // removeOverlaps returns tight bounds (no layout padding). Recompute with
      // the same padding that the initial bounds used so the contract is preserved.
      const paddedBounds = {
        x: deoverlapped.bounds.x - opts.padding,
        y: deoverlapped.bounds.y - opts.padding,
        width: deoverlapped.bounds.width + opts.padding * 2,
        height: deoverlapped.bounds.height + opts.padding * 2,
      };

      // Re-run endpoint adjustment after nodes have been repositioned
      return adjustEdgeEndpoints(graph, { ...deoverlapped, bounds: paddedBounds });
    },
    catch: (error) =>
      new LayoutError({
        algorithm: 'd3-force',
        reason: error instanceof Error ? error.message : String(error),
      }),
  });

// ─── Async implementation using an inline Web Worker ─────────────────────────

/**
 * Converts a serialized worker result into a full {@link LayoutResult},
 * applying `adjustEdgeEndpoints` on the main thread (the worker cannot access
 * the shape registry).
 */
const workerOutputToLayoutResult = (
  output: Extract<WorkerOutput, { ok: true }>,
  graph: Graph,
  options: Required<D3ForceLayoutOptions>
): LayoutResult => {
  const nodePositions = new Map<NodeId, { x: number; y: number }>();
  for (const entry of output.positions) {
    nodePositions.set(entry.id as NodeId, { x: entry.x, y: entry.y });
  }

  const edgePaths = new Map<EdgeId, EdgePath>();
  for (const e of output.edges) {
    const points = [{ x: e.sx, y: e.sy }, { x: e.tx, y: e.ty }];
    edgePaths.set(e.id as EdgeId, {
      d: `M ${e.sx} ${e.sy} L ${e.tx} ${e.ty}`,
      points,
      sourceIntersection: points[0]!,
      targetIntersection: points[1]!,
      labelPosition: { x: (e.sx + e.tx) / 2, y: (e.sy + e.ty) / 2 },
    });
  }

  const rawResult: LayoutResult = { nodePositions, edgePaths, bounds: output.bounds };
  const withEndpoints = adjustEdgeEndpoints(graph, rawResult);

  if (!options.removeOverlaps) return withEndpoints;

  const deoverlapped = removeOverlaps(withEndpoints, graph, { padding: options.overlapPadding });

  // Recompute padded bounds after nodes have been repositioned
  const paddedBounds = {
    x: deoverlapped.bounds.x - options.padding,
    y: deoverlapped.bounds.y - options.padding,
    width: deoverlapped.bounds.width + options.padding * 2,
    height: deoverlapped.bounds.height + options.padding * 2,
  };

  return adjustEdgeEndpoints(graph, { ...deoverlapped, bounds: paddedBounds });
};

/**
 * Runs the D3-force layout in a Web Worker so the main thread is never blocked.
 *
 * Falls back to the synchronous implementation when `Worker` is unavailable
 * (Node.js / SSR environments).
 *
 * ```ts
 * const result = await Effect.runPromise(d3ForceLayoutAsync.layout(graph, {}));
 * ```
 */
const runD3ForceLayoutAsync = (
  graph: Graph,
  options: D3ForceLayoutOptions = {}
): Effect.Effect<LayoutResult, LayoutError> => {
  const worker = createForceWorker();

  // No Worker support — fall back to synchronous execution on the calling thread.
  if (worker === null) {
    return runD3ForceLayout(graph, options);
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const input: WorkerInput = {
    nodes: [...graph.nodes.entries()].map(([id, node]) => ({
      id,
      x: node.position.x || Math.random() * opts.centerX * 2,
      y: node.position.y || Math.random() * opts.centerY * 2,
      width: node.size.width,
      height: node.size.height,
    })),
    edges: [...graph.edges.entries()].map(([id, edge]) => ({
      id,
      source: edge.source as string,
      target: edge.target as string,
    })),
    options: opts,
  };

  return Effect.async<LayoutResult, LayoutError>((resume) => {
    worker.onmessage = (event: MessageEvent<WorkerOutput>) => {
      worker.terminate();
      const output = event.data;
      if (!output.ok) {
        resume(
          Effect.fail(
            new LayoutError({ algorithm: 'd3-force-worker', reason: output.error })
          )
        );
        return;
      }
      try {
        const result = workerOutputToLayoutResult(output, graph, opts);
        resume(Effect.succeed(result));
      } catch (err) {
        resume(
          Effect.fail(
            new LayoutError({
              algorithm: 'd3-force-worker',
              reason: err instanceof Error ? err.message : String(err),
            })
          )
        );
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      worker.terminate();
      resume(
        Effect.fail(
          new LayoutError({ algorithm: 'd3-force-worker', reason: event.message })
        )
      );
    };

    worker.postMessage(input);

    // Effect cleanup — terminate the worker if the Effect is interrupted.
    return Effect.sync(() => {
      worker.terminate();
    });
  });
};

// ─── Exported layout algorithm objects ───────────────────────────────────────

/**
 * Synchronous D3-force layout.  Runs 300 iterations on the calling thread.
 * Suitable for server-side rendering and environments without Worker support.
 * For interactive UIs prefer {@link d3ForceLayoutAsync}.
 */
export const d3ForceLayout: LayoutAlgorithm<D3ForceLayoutOptions> = {
  name: 'd3-force',
  category: 'force',
  layout: runD3ForceLayout,
};

/**
 * Async D3-force layout that offloads the simulation to a Web Worker,
 * keeping the main thread unblocked.
 *
 * Automatically falls back to synchronous execution in Node.js / SSR
 * environments where `Worker` is not available.
 */
export const d3ForceLayoutAsync: LayoutAlgorithm<D3ForceLayoutOptions> = {
  name: 'd3-force-async',
  category: 'force',
  layout: runD3ForceLayoutAsync,
};
