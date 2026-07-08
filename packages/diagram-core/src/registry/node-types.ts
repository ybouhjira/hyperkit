import type { Node, NodeId, NodeTypeDefinition, Port, PortId } from '../graph/types';
import { NodeId as NodeIdBrand, PortId as PortIdBrand } from '../graph/types';
import { NodeTypeNotFoundError } from '../errors';

const nodeTypeRegistry = new Map<string, NodeTypeDefinition>();

/** Register a node type definition for the palette */
export const registerNodeType = <D = unknown>(definition: NodeTypeDefinition<D>): void => {
  nodeTypeRegistry.set(definition.type, definition as NodeTypeDefinition);
};

/** Get a registered node type definition */
export const getNodeType = (type: string): NodeTypeDefinition | undefined => {
  return nodeTypeRegistry.get(type);
};

/** Unregister a node type */
export const unregisterNodeType = (type: string): boolean => {
  return nodeTypeRegistry.delete(type);
};

/** Get all registered node types */
export const getAllNodeTypes = (): ReadonlyArray<NodeTypeDefinition> => {
  return [...nodeTypeRegistry.values()];
};

/** Get node types organized by category */
export const getNodeTypesByCategory = (): ReadonlyMap<string, ReadonlyArray<NodeTypeDefinition>> => {
  const categories = new Map<string, NodeTypeDefinition[]>();
  for (const def of nodeTypeRegistry.values()) {
    const list = categories.get(def.category) ?? [];
    list.push(def);
    categories.set(def.category, list);
  }
  return categories;
};

/** Search node types by query (matches label, type, description, tags) */
export const searchNodeTypes = (query: string): ReadonlyArray<NodeTypeDefinition> => {
  if (!query.trim()) return getAllNodeTypes();
  const q = query.toLowerCase();
  return getAllNodeTypes().filter(def => {
    return (
      def.label.toLowerCase().includes(q) ||
      def.type.toLowerCase().includes(q) ||
      (def.description?.toLowerCase().includes(q) ?? false) ||
      (def.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false)
    );
  });
};

/** Get node types compatible with a given output port (have an input port with matching dataType) */
export const getCompatibleNodeTypes = (
  sourcePort: Port
): ReadonlyArray<NodeTypeDefinition> => {
  return getAllNodeTypes().filter(def => {
    return def.defaultPorts.some(port => {
      // Must be an input port (opposite direction)
      const isInput = (
        (sourcePort.direction === 'east' && port.direction === 'west') ||
        (sourcePort.direction === 'south' && port.direction === 'north')
      );
      if (!isInput) return false;
      // dataType must match if both specified
      if (sourcePort.dataType && port.dataType) {
        return sourcePort.dataType === port.dataType;
      }
      return true; // no type constraint = compatible
    });
  });
};

/** Create a node instance from a registered type definition */
/** Create a node instance from a registered type definition. Throws NodeTypeNotFoundError if type not registered. */
export const createNodeFromType = <D = unknown>(
  type: string,
  position: { x: number; y: number },
  overrides?: Partial<Node<D>>
): Node<D> => {
  const def = nodeTypeRegistry.get(type) as NodeTypeDefinition<D> | undefined;
  if (!def) throw new NodeTypeNotFoundError({ nodeType: type });

  if (def.factory) {
    return def.factory({ position, ...overrides } as Partial<Node<D>>);
  }

  const id = NodeIdBrand(`${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const ports = def.defaultPorts.map(p => ({
    ...p,
    id: PortIdBrand(`${id}_${p.id}`) as PortId,
  }));

  return {
    id,
    data: { ...def.defaultData } as D,
    position,
    size: { ...def.defaultSize },
    ports,
    shape: 'rectangle',
    label: def.label,
    style: {},
    renderMode: def.defaultRenderMode,
    widgets: def.defaultWidgets ? [...def.defaultWidgets] : undefined,
    ...overrides,
  } as Node<D>;
};

/** Clear all registered node types */
export const clearNodeTypes = (): void => {
  nodeTypeRegistry.clear();
};
