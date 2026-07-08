export * from './types';
export * from './registry';
export { bezierRouter, bezierPoint, type BezierOptions } from './bezier';
export { straightRouter } from './straight';
export { stepRouter, type StepOptions } from './step';
export { bundledRouter, computeEdgeBundles, type BundledOptions } from './bundled';
export { manhattanRouter, type ManhattanOptions } from './manhattan';
export { aStarRouter, type AStarOptions } from './astar';

// Auto-register all built-in edge routers
import type { EdgeRouter } from '../graph/types';
import { registerEdgeRouter } from './registry';
import { bezierRouter } from './bezier';
import { straightRouter } from './straight';
import { stepRouter } from './step';
import { manhattanRouter } from './manhattan';
import { aStarRouter } from './astar';
import { bundledRouter } from './bundled';

registerEdgeRouter(bezierRouter as EdgeRouter);
registerEdgeRouter(straightRouter);
registerEdgeRouter(stepRouter as EdgeRouter);
registerEdgeRouter(manhattanRouter as EdgeRouter);
registerEdgeRouter(aStarRouter as EdgeRouter);
registerEdgeRouter(bundledRouter as EdgeRouter);
