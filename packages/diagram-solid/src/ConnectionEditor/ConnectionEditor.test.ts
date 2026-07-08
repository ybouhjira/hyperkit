import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import type { NodeId, EdgeId, PortId } from '@ybouhjira/diagram-core';
import { emptyGraph, addNode, addEdge } from '@ybouhjira/diagram-core';
import { itemToNode, wireToEdge, edgeToWire, buildGraph, extractWires } from './adapter.js';
import { createTypeValidator } from './type-validator.js';
import type { ConnectableItem, Wire } from './types.js';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const fileReaderItem: ConnectableItem = {
  id: 'file-reader',
  label: 'File Reader',
  icon: '📂',
  category: 'Input',
  inputs: [],
  outputs: [
    { name: 'filePath', type: 'FilePath', label: 'File Path' },
    { name: 'content', type: 'string', label: 'Content' },
  ],
};

const processorItem: ConnectableItem = {
  id: 'processor',
  label: 'Processor',
  inputs: [
    { name: 'input', type: 'string', label: 'Input', maxConnections: 1 },
    { name: 'config', type: 'object', label: 'Config' },
  ],
  outputs: [
    { name: 'result', type: 'string', label: 'Result' },
  ],
};

const sinkItem: ConnectableItem = {
  id: 'sink',
  label: 'Sink',
  inputs: [
    { name: 'data', type: 'string' },
  ],
  outputs: [],
};

const sampleWire: Wire = {
  from: { itemId: 'file-reader', port: 'content' },
  to: { itemId: 'processor', port: 'input' },
};

// ─── Adapter Tests ────────────────────────────────────────────────────────────

describe('adapter', () => {
  describe('itemToNode', () => {
    it('creates a node with the correct id', () => {
      const node = itemToNode(fileReaderItem);
      expect(node.id).toBe('file-reader');
    });

    it('sets the label from item label (with icon prefix)', () => {
      const node = itemToNode(fileReaderItem);
      expect(node.label).toBe('📂 File Reader');
    });

    it('uses plain label when no icon', () => {
      const node = itemToNode(processorItem);
      expect(node.label).toBe('Processor');
    });

    it('uses provided position', () => {
      const node = itemToNode(fileReaderItem, { x: 100, y: 200 });
      expect(node.position).toEqual({ x: 100, y: 200 });
    });

    it('defaults position to origin when not provided', () => {
      const node = itemToNode(fileReaderItem);
      expect(node.position).toEqual({ x: 0, y: 0 });
    });

    it('creates output ports with east direction', () => {
      const node = itemToNode(fileReaderItem);
      const outputPorts = node.ports.filter((p) => p.direction === 'east');
      expect(outputPorts).toHaveLength(2);
      expect(outputPorts.map((p) => p.label)).toEqual(['File Path', 'Content']);
    });

    it('creates input ports with west direction', () => {
      const node = itemToNode(processorItem);
      const inputPorts = node.ports.filter((p) => p.direction === 'west');
      expect(inputPorts).toHaveLength(2);
    });

    it('sets port dataType from PortSpec.type', () => {
      const node = itemToNode(fileReaderItem);
      const filePathPort = node.ports.find((p) => p.id === 'file-reader:filePath');
      expect(filePathPort?.dataType).toBe('FilePath');
    });

    it('sets maxConnections=1 for input ports by default', () => {
      const node = itemToNode(processorItem);
      const inputPort = node.ports.find((p) => p.id === 'processor:input');
      expect(inputPort?.maxConnections).toBe(1);
    });

    it('sets maxConnections=Infinity for output ports by default', () => {
      const node = itemToNode(fileReaderItem);
      const outputPort = node.ports.find((p) => p.id === 'file-reader:content');
      expect(outputPort?.maxConnections).toBe(Infinity);
    });

    it('respects explicit maxConnections override in PortSpec', () => {
      const item: ConnectableItem = {
        id: 'custom',
        label: 'Custom',
        inputs: [{ name: 'multi', type: 'string', maxConnections: 5 }],
      };
      const node = itemToNode(item);
      const port = node.ports.find((p) => p.id === 'custom:multi');
      expect(port?.maxConnections).toBe(5);
    });

    it('generates PortIds in itemId:portName format', () => {
      const node = itemToNode(processorItem);
      const portIds = node.ports.map((p) => p.id);
      expect(portIds).toContain('processor:input');
      expect(portIds).toContain('processor:config');
      expect(portIds).toContain('processor:result');
    });

    it('sets headerColor from item.color', () => {
      const item: ConnectableItem = { id: 'colored', label: 'Colored', color: '#ff0000' };
      const node = itemToNode(item);
      expect(node.headerColor).toBe('#ff0000');
    });

    it('creates a node with no ports when item has no inputs/outputs', () => {
      const item: ConnectableItem = { id: 'empty', label: 'Empty' };
      const node = itemToNode(item);
      expect(node.ports).toHaveLength(0);
    });
  });

  describe('wireToEdge', () => {
    it('creates an edge with correct source and target', () => {
      const edge = wireToEdge(sampleWire);
      expect(edge.source).toBe('file-reader');
      expect(edge.target).toBe('processor');
    });

    it('sets sourcePort to itemId:portName format', () => {
      const edge = wireToEdge(sampleWire);
      expect(edge.sourcePort).toBe('file-reader:content');
    });

    it('sets targetPort to itemId:portName format', () => {
      const edge = wireToEdge(sampleWire);
      expect(edge.targetPort).toBe('processor:input');
    });

    it('generates a deterministic edge id', () => {
      const edge1 = wireToEdge(sampleWire);
      const edge2 = wireToEdge(sampleWire);
      expect(edge1.id).toBe(edge2.id);
    });
  });

  describe('edgeToWire', () => {
    it('extracts the correct Wire from an edge with ports', () => {
      const edge = wireToEdge(sampleWire);
      const wire = edgeToWire(edge);
      expect(wire).toEqual(sampleWire);
    });

    it('returns null for edges without sourcePort', () => {
      const edge = {
        id: 'e1' as EdgeId,
        source: 'a' as NodeId,
        target: 'b' as NodeId,
        data: undefined,
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      };
      expect(edgeToWire(edge)).toBeNull();
    });

    it('returns null for edges without targetPort', () => {
      const edge = {
        id: 'e1' as EdgeId,
        source: 'a' as NodeId,
        target: 'b' as NodeId,
        sourcePort: 'a:out' as PortId,
        data: undefined,
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      };
      expect(edgeToWire(edge)).toBeNull();
    });

    it('returns null for portIds without colon separator', () => {
      const edge = {
        id: 'e1' as EdgeId,
        source: 'a' as NodeId,
        target: 'b' as NodeId,
        sourcePort: 'nocolon' as PortId,
        targetPort: 'also-none' as PortId,
        data: undefined,
        sourceArrow: { type: 'none' as const },
        targetArrow: { type: 'triangle' as const },
        style: {},
      };
      expect(edgeToWire(edge)).toBeNull();
    });
  });

  describe('buildGraph', () => {
    it('creates a graph with all nodes from items', () => {
      const graph = buildGraph([fileReaderItem, processorItem], []);
      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.has('file-reader' as NodeId)).toBe(true);
      expect(graph.nodes.has('processor' as NodeId)).toBe(true);
    });

    it('creates edges from wires', () => {
      const graph = buildGraph([fileReaderItem, processorItem], [sampleWire]);
      expect(graph.edges.size).toBe(1);
    });

    it('skips wires where source item is not in items list', () => {
      const orphanWire: Wire = {
        from: { itemId: 'nonexistent', port: 'out' },
        to: { itemId: 'processor', port: 'input' },
      };
      const graph = buildGraph([processorItem], [orphanWire]);
      expect(graph.edges.size).toBe(0);
    });

    it('skips wires where target item is not in items list', () => {
      const orphanWire: Wire = {
        from: { itemId: 'file-reader', port: 'content' },
        to: { itemId: 'nonexistent', port: 'input' },
      };
      const graph = buildGraph([fileReaderItem], [orphanWire]);
      expect(graph.edges.size).toBe(0);
    });

    it('uses provided positions map', () => {
      const positions = new Map([['file-reader', { x: 50, y: 100 }]]);
      const graph = buildGraph([fileReaderItem], [], positions);
      const node = graph.nodes.get('file-reader' as NodeId);
      expect(node?.position).toEqual({ x: 50, y: 100 });
    });

    it('auto-spaces nodes horizontally when no positions provided', () => {
      const graph = buildGraph([fileReaderItem, processorItem], []);
      const n1 = graph.nodes.get('file-reader' as NodeId);
      const n2 = graph.nodes.get('processor' as NodeId);
      expect(n1?.position.x).not.toBe(n2?.position.x);
    });
  });

  describe('extractWires', () => {
    it('returns empty array for a graph with no edges', () => {
      const graph = buildGraph([fileReaderItem, processorItem], []);
      expect(extractWires(graph)).toEqual([]);
    });

    it('returns all wires from graph edges', () => {
      const graph = buildGraph([fileReaderItem, processorItem], [sampleWire]);
      const wires = extractWires(graph);
      expect(wires).toHaveLength(1);
      expect(wires[0]).toEqual(sampleWire);
    });

    it('round-trip: items+wires → buildGraph → extractWires matches original', () => {
      const wire2: Wire = {
        from: { itemId: 'processor', port: 'result' },
        to: { itemId: 'sink', port: 'data' },
      };
      const originalWires = [sampleWire, wire2];
      const graph = buildGraph([fileReaderItem, processorItem, sinkItem], originalWires);
      const extracted = extractWires(graph);

      // Sort both for stable comparison
      const sort = (ws: Wire[]) =>
        [...ws].sort((a, b) =>
          `${a.from.itemId}:${a.from.port}`.localeCompare(`${b.from.itemId}:${b.from.port}`)
        );

      expect(sort(extracted)).toEqual(sort(originalWires));
    });
  });
});

// ─── Type Validator Tests ─────────────────────────────────────────────────────

describe('createTypeValidator', () => {
  const makePort = (direction: 'east' | 'west', dataType?: string) => ({
    id: `port-${Math.random()}` as PortId,
    direction,
    offset: 0.5,
    dataType,
  });

  const emptyGraph = () => ({
    id: 'g' as import('@ybouhjira/diagram-core').GraphId,
    nodes: new Map(),
    edges: new Map(),
  });

  it('default validator allows connection when source and target types match', () => {
    const validator = createTypeValidator();
    const result = Effect.runSync(
      validator(makePort('east', 'string'), makePort('west', 'string'), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('default validator blocks connection when types differ', () => {
    const validator = createTypeValidator();
    const result = Effect.runSync(
      validator(makePort('east', 'string'), makePort('west', 'number'), emptyGraph())
    );
    expect(result).toBe(false);
  });

  it('default validator allows connection when source dataType is undefined', () => {
    const validator = createTypeValidator();
    const result = Effect.runSync(
      validator(makePort('east', undefined), makePort('west', 'string'), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('default validator allows connection when target dataType is undefined', () => {
    const validator = createTypeValidator();
    const result = Effect.runSync(
      validator(makePort('east', 'string'), makePort('west', undefined), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('custom map allows compatible types', () => {
    const validator = createTypeValidator({ string: ['FilePath', 'URL'] });
    const result = Effect.runSync(
      validator(makePort('east', 'FilePath'), makePort('west', 'string'), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('custom map blocks incompatible types', () => {
    const validator = createTypeValidator({ string: ['FilePath', 'URL'] });
    const result = Effect.runSync(
      validator(makePort('east', 'number'), makePort('west', 'string'), emptyGraph())
    );
    expect(result).toBe(false);
  });

  it('wildcard * source accepts any type', () => {
    const validator = createTypeValidator({ string: ['*'] });
    const result = Effect.runSync(
      validator(makePort('east', 'anything'), makePort('west', 'string'), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('target type "any" accepts anything', () => {
    const validator = createTypeValidator({ any: ['*'] });
    const result = Effect.runSync(
      validator(makePort('east', 'SomeRandomType'), makePort('west', 'any'), emptyGraph())
    );
    expect(result).toBe(true);
  });

  it('blocks wrong directions even when types match', () => {
    const validator = createTypeValidator();
    // east → east is invalid (should be east → west)
    const result = Effect.runSync(
      validator(makePort('east', 'string'), makePort('east', 'string'), emptyGraph())
    );
    expect(result).toBe(false);
  });

  it('returns false for unknown target type in custom map', () => {
    const validator = createTypeValidator({ known: ['string'] });
    const result = Effect.runSync(
      validator(makePort('east', 'string'), makePort('west', 'unknown'), emptyGraph())
    );
    expect(result).toBe(false);
  });
});
