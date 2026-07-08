import { describe, it, expect, beforeEach } from 'vitest';
import {
  NodeId, PortId,
  registerNodeType, getNodeType, unregisterNodeType, getAllNodeTypes,
  getNodeTypesByCategory, searchNodeTypes, getCompatibleNodeTypes,
  createNodeFromType, clearNodeTypes,
  NodeTypeNotFoundError,
} from '../index';
import type { NodeTypeDefinition, Port, Node } from '../index';

describe('Node Type Registry', () => {
  beforeEach(() => {
    clearNodeTypes();
  });

  const sampleDef: NodeTypeDefinition = {
    type: 'test-node',
    category: 'Test',
    label: 'Test Node',
    description: 'A test node type',
    defaultSize: { width: 200, height: 100 },
    defaultPorts: [
      { id: PortId('in'), direction: 'west', offset: 0.5, dataType: 'number' },
      { id: PortId('out'), direction: 'east', offset: 0.5, dataType: 'number' },
    ],
    defaultData: { value: 0 },
    tags: ['test', 'sample'],
  };

  describe('registerNodeType / getNodeType', () => {
    it('should register and retrieve a node type', () => {
      registerNodeType(sampleDef);
      const result = getNodeType('test-node');
      expect(result).toBeDefined();
      expect(result!.label).toBe('Test Node');
    });

    it('should return undefined for unregistered type', () => {
      expect(getNodeType('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing registration', () => {
      registerNodeType(sampleDef);
      registerNodeType({ ...sampleDef, label: 'Updated' });
      expect(getNodeType('test-node')?.label).toBe('Updated');
    });
  });

  describe('unregisterNodeType', () => {
    it('should remove a registered type', () => {
      registerNodeType(sampleDef);
      expect(unregisterNodeType('test-node')).toBe(true);
      expect(getNodeType('test-node')).toBeUndefined();
    });

    it('should return false for non-existent type', () => {
      expect(unregisterNodeType('nonexistent')).toBe(false);
    });
  });

  describe('getAllNodeTypes', () => {
    it('should return empty array when no types registered', () => {
      expect(getAllNodeTypes()).toHaveLength(0);
    });

    it('should return all registered types', () => {
      registerNodeType(sampleDef);
      registerNodeType({ ...sampleDef, type: 'another', label: 'Another' });
      expect(getAllNodeTypes()).toHaveLength(2);
    });
  });

  describe('getNodeTypesByCategory', () => {
    it('should group types by category', () => {
      registerNodeType({ ...sampleDef, type: 'a', category: 'Input' });
      registerNodeType({ ...sampleDef, type: 'b', category: 'Input' });
      registerNodeType({ ...sampleDef, type: 'c', category: 'Output' });
      const categories = getNodeTypesByCategory();
      expect(categories.get('Input')).toHaveLength(2);
      expect(categories.get('Output')).toHaveLength(1);
    });
  });

  describe('searchNodeTypes', () => {
    beforeEach(() => {
      registerNodeType({ ...sampleDef, type: 'load-image', label: 'Load Image', tags: ['image', 'input'] });
      registerNodeType({ ...sampleDef, type: 'save-image', label: 'Save Image', tags: ['image', 'output'] });
      registerNodeType({ ...sampleDef, type: 'blur', label: 'Blur', description: 'Apply gaussian blur' });
    });

    it('should search by label', () => {
      expect(searchNodeTypes('image')).toHaveLength(2);
    });

    it('should search by type', () => {
      expect(searchNodeTypes('load')).toHaveLength(1);
    });

    it('should search by tag', () => {
      expect(searchNodeTypes('input')).toHaveLength(1);
    });

    it('should search by description', () => {
      expect(searchNodeTypes('gaussian')).toHaveLength(1);
    });

    it('should be case insensitive', () => {
      expect(searchNodeTypes('BLUR')).toHaveLength(1);
    });

    it('should return all types for empty query', () => {
      expect(searchNodeTypes('')).toHaveLength(3);
    });
  });

  describe('getCompatibleNodeTypes', () => {
    beforeEach(() => {
      registerNodeType({
        ...sampleDef, type: 'number-input',
        defaultPorts: [{ id: PortId('out'), direction: 'east', offset: 0.5, dataType: 'number' }],
      });
      registerNodeType({
        ...sampleDef, type: 'number-output',
        defaultPorts: [{ id: PortId('in'), direction: 'west', offset: 0.5, dataType: 'number' }],
      });
      registerNodeType({
        ...sampleDef, type: 'string-output',
        defaultPorts: [{ id: PortId('in'), direction: 'west', offset: 0.5, dataType: 'string' }],
      });
    });

    it('should find types with compatible input ports', () => {
      const sourcePort: Port = { id: PortId('out'), direction: 'east', offset: 0.5, dataType: 'number' };
      const compatible = getCompatibleNodeTypes(sourcePort);
      expect(compatible.some(d => d.type === 'number-output')).toBe(true);
      expect(compatible.some(d => d.type === 'string-output')).toBe(false);
    });

    it('should match wildcard ports', () => {
      registerNodeType({
        ...sampleDef, type: 'any-input',
        defaultPorts: [{ id: PortId('in'), direction: 'west', offset: 0.5 }],
      });
      const sourcePort: Port = { id: PortId('out'), direction: 'east', offset: 0.5, dataType: 'number' };
      const compatible = getCompatibleNodeTypes(sourcePort);
      expect(compatible.some(d => d.type === 'any-input')).toBe(true);
    });
  });

  describe('createNodeFromType', () => {
    it('should create a node from registered type', () => {
      registerNodeType(sampleDef);
      const node = createNodeFromType('test-node', { x: 100, y: 200 });
      expect(node.position).toEqual({ x: 100, y: 200 });
      expect(node.size).toEqual({ width: 200, height: 100 });
      expect(node.label).toBe('Test Node');
      expect(node.ports).toHaveLength(2);
    });

    it('should throw NodeTypeNotFoundError for unknown type', () => {
      expect(() => createNodeFromType('unknown', { x: 0, y: 0 })).toThrow();
    });

    it('should generate unique IDs', () => {
      registerNodeType(sampleDef);
      const node1 = createNodeFromType('test-node', { x: 0, y: 0 });
      const node2 = createNodeFromType('test-node', { x: 100, y: 0 });
      expect(node1.id).not.toBe(node2.id);
    });

    it('should prefix port IDs with node ID', () => {
      registerNodeType(sampleDef);
      const node = createNodeFromType('test-node', { x: 0, y: 0 });
      for (const port of node.ports) {
        expect(String(port.id)).toContain(String(node.id));
      }
    });

    it('should apply overrides', () => {
      registerNodeType(sampleDef);
      const node = createNodeFromType('test-node', { x: 0, y: 0 }, { label: 'Custom Label' });
      expect(node.label).toBe('Custom Label');
    });

    it('should use custom factory when provided', () => {
      const factoryDef = {
        ...sampleDef,
        type: 'factory-node',
        factory: (overrides?: Partial<Node>) => ({
          id: NodeId('custom-id'),
          data: {},
          position: overrides?.position ?? { x: 0, y: 0 },
          size: { width: 300, height: 150 },
          ports: [],
          shape: 'diamond',
          label: 'Factory Node',
          style: {},
        }),
      };
      registerNodeType(factoryDef);
      const node = createNodeFromType('factory-node', { x: 50, y: 50 });
      expect(node.id).toBe(NodeId('custom-id'));
      expect(node.shape).toBe('diamond');
    });
  });

  describe('clearNodeTypes', () => {
    it('should remove all registered types', () => {
      registerNodeType(sampleDef);
      clearNodeTypes();
      expect(getAllNodeTypes()).toHaveLength(0);
    });
  });
});
