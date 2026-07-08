import type { EdgeRouter } from '../graph/types';

const edgeRouterRegistry = new Map<string, EdgeRouter>();

export const registerEdgeRouter = (router: EdgeRouter): void => {
  edgeRouterRegistry.set(router.name, router);
};

export const getEdgeRouter = (name: string): EdgeRouter | undefined =>
  edgeRouterRegistry.get(name);

export const listEdgeRouters = (): ReadonlyArray<string> => [...edgeRouterRegistry.keys()];
