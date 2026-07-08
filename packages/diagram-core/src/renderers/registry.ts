export type NodeRendererFn = (node: import('../graph/types').Node) => HTMLElement;

const rendererRegistry = new Map<string, NodeRendererFn>();

/** Register a custom HTML renderer for a node type */
export const registerNodeRenderer = (nodeType: string, renderer: NodeRendererFn): void => {
  rendererRegistry.set(nodeType, renderer);
};

/** Get a registered renderer, or undefined if not found */
export const getNodeRenderer = (nodeType: string): NodeRendererFn | undefined => {
  return rendererRegistry.get(nodeType);
};

/** Check if a renderer is registered for a node type */
export const hasNodeRenderer = (nodeType: string): boolean => {
  return rendererRegistry.has(nodeType);
};

/** Unregister a renderer */
export const unregisterNodeRenderer = (nodeType: string): boolean => {
  return rendererRegistry.delete(nodeType);
};

/** Get all registered renderer type names */
export const getRegisteredRenderers = (): ReadonlyArray<string> => {
  return [...rendererRegistry.keys()];
};

/** Clear all registered renderers */
export const clearRenderers = (): void => {
  rendererRegistry.clear();
};
