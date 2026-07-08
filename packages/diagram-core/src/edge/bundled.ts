import { Effect } from 'effect';
import type { EdgeRouter, EdgeRouterContext, EdgePath, Edge } from '../graph/types';
import type { EdgeRoutingError } from '../errors';
import { bezierRouter } from './bezier';

export interface BundledOptions {
  readonly bundleSpacing?: number; // spacing between bundled edges in px, default 12
  readonly curvature?: number; // passed to inner bezier router, default 0.5
}

const routeBundled = (context: EdgeRouterContext, options?: BundledOptions): Effect.Effect<EdgePath, EdgeRoutingError> => {
  const bundleIndex = (context.edge.metadata?.bundleIndex as number | undefined) ?? 0;
  const bundleSize = (context.edge.metadata?.bundleSize as number | undefined) ?? 1;
  const spacing = options?.bundleSpacing ?? 12;
  const curvature = options?.curvature ?? 0.5;

  // If single edge (no bundle), just use bezier
  if (bundleSize <= 1) {
    return bezierRouter.route(context, { curvature });
  }

  // Use bezier with parallel edge support
  return bezierRouter.route(context, {
    curvature,
    edgeIndex: bundleIndex,
    totalParallelEdges: bundleSize,
    parallelSpacing: spacing,
  });
};

/**
 * Pre-processes a graph's edges to assign bundle indices.
 * Groups edges by source-target pair (both directions count as the same pair).
 * Returns a map from edge id → { index, size }.
 */
export const computeEdgeBundles = (
  edges: ReadonlyArray<Edge>
): ReadonlyMap<string, { index: number; size: number }> => {
  // Group edges by source-target pair (both directions count as same pair)
  const groups = new Map<string, string[]>();
  for (const edge of edges) {
    const key = [edge.source as string, edge.target as string].sort().join('::');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(edge.id as string);
  }

  // Assign indices
  const result = new Map<string, { index: number; size: number }>();
  for (const [, edgeIds] of groups) {
    for (let i = 0; i < edgeIds.length; i++) {
      result.set(edgeIds[i]!, { index: i, size: edgeIds.length });
    }
  }
  return result;
};

export const bundledRouter: EdgeRouter<BundledOptions> = {
  name: 'bundled',
  route: routeBundled,
};
