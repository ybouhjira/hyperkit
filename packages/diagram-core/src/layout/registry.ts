import type { LayoutAlgorithm } from '../graph/types';

const layoutRegistry = new Map<string, LayoutAlgorithm>();

export const registerLayout = (algorithm: LayoutAlgorithm): void => {
  layoutRegistry.set(algorithm.name, algorithm);
};

export const getLayout = (name: string): LayoutAlgorithm | undefined =>
  layoutRegistry.get(name);

export const listLayouts = (): ReadonlyArray<string> => [...layoutRegistry.keys()];
