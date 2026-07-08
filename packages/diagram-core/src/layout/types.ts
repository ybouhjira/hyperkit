export type { LayoutAlgorithm, LayoutCategory, LayoutResult } from '../graph/types';
export type { LayoutError } from '../errors';

// Layout direction for hierarchical layouts
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

// Common layout options shared across algorithms
export interface BaseLayoutOptions {
  readonly padding?: number; // padding around the graph bounds
}
