import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import {
  NodeId, EdgeId, PortId, GraphId,
  emptyGraph, addNode, addEdge,
  directionValidator, dataTypeValidator, maxConnectionsValidator,
  noDuplicateValidator, composeValidators, defaultConnectionValidator,
} from '../index';
import type { Port, Graph } from '../index';

const makePort = (overrides: Partial<Port> & { id: string; direction: string }): Port => ({
  id: PortId(overrides.id),
  direction: overrides.direction as 'north' | 'south' | 'east' | 'west',
  offset: overrides.offset ?? 0.5,
  dataType: overrides.dataType,
  maxConnections: overrides.maxConnections,
  label: overrides.label,
});

describe('Port Validators', () => {
  let graph: Graph;

  beforeEach(() => {
    graph = emptyGraph();
  });

  describe('directionValidator', () => {
    it('should allow east→west connection', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(true);
    });

    it('should allow south→north connection', () => {
      const source = makePort({ id: 'out', direction: 'south' });
      const target = makePort({ id: 'in', direction: 'north' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(true);
    });

    it('should allow west→east connection', () => {
      const source = makePort({ id: 'out', direction: 'west' });
      const target = makePort({ id: 'in', direction: 'east' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(true);
    });

    it('should reject east→east connection', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'east' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(false);
    });

    it('should reject north→north connection', () => {
      const source = makePort({ id: 'out', direction: 'north' });
      const target = makePort({ id: 'in', direction: 'north' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(false);
    });

    it('should reject east→north connection', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'north' });
      expect(Effect.runSync(directionValidator(source, target, graph))).toBe(false);
    });
  });

  describe('dataTypeValidator', () => {
    it('should allow matching data types', () => {
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'number' });
      expect(Effect.runSync(dataTypeValidator(source, target, graph))).toBe(true);
    });

    it('should reject mismatched data types', () => {
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'string' });
      expect(Effect.runSync(dataTypeValidator(source, target, graph))).toBe(false);
    });

    it('should allow when source has no dataType (wildcard)', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'number' });
      expect(Effect.runSync(dataTypeValidator(source, target, graph))).toBe(true);
    });

    it('should allow when target has no dataType (wildcard)', () => {
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(dataTypeValidator(source, target, graph))).toBe(true);
    });

    it('should allow when neither has dataType', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(dataTypeValidator(source, target, graph))).toBe(true);
    });
  });

  describe('maxConnectionsValidator', () => {
    it('should allow connection when maxConnections not set', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(maxConnectionsValidator(source, target, graph))).toBe(true);
    });

    it('should allow connection when under maxConnections', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west', maxConnections: 2 });
      expect(Effect.runSync(maxConnectionsValidator(source, target, graph))).toBe(true);
    });

    it('should reject when at maxConnections', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west', maxConnections: 1 });
      // Add existing edge to target port
      const node1 = { id: NodeId('n1'), data: {}, position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, ports: [source], shape: 'rectangle', style: {} };
      const node2 = { id: NodeId('n2'), data: {}, position: { x: 200, y: 0 }, size: { width: 100, height: 50 }, ports: [target], shape: 'rectangle', style: {} };
      graph = Effect.runSync(addNode(graph, node1));
      graph = Effect.runSync(addNode(graph, node2));
      const edge = {
        id: EdgeId('e1'), source: NodeId('n1'), target: NodeId('n2'),
        sourcePort: PortId('out'), targetPort: PortId('in'),
        data: {}, sourceArrow: { type: 'none' as const }, targetArrow: { type: 'triangle' as const }, style: {},
      };
      graph = Effect.runSync(addEdge(graph, edge));

      expect(Effect.runSync(maxConnectionsValidator(source, target, graph))).toBe(false);
    });
  });

  describe('noDuplicateValidator', () => {
    it('should allow new connection', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(noDuplicateValidator(source, target, graph))).toBe(true);
    });

    it('should reject duplicate connection', () => {
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      const node1 = { id: NodeId('n1'), data: {}, position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, ports: [source], shape: 'rectangle', style: {} };
      const node2 = { id: NodeId('n2'), data: {}, position: { x: 200, y: 0 }, size: { width: 100, height: 50 }, ports: [target], shape: 'rectangle', style: {} };
      graph = Effect.runSync(addNode(graph, node1));
      graph = Effect.runSync(addNode(graph, node2));
      const edge = {
        id: EdgeId('e1'), source: NodeId('n1'), target: NodeId('n2'),
        sourcePort: PortId('out'), targetPort: PortId('in'),
        data: {}, sourceArrow: { type: 'none' as const }, targetArrow: { type: 'triangle' as const }, style: {},
      };
      graph = Effect.runSync(addEdge(graph, edge));

      expect(Effect.runSync(noDuplicateValidator(source, target, graph))).toBe(false);
    });
  });

  describe('composeValidators', () => {
    it('should pass with empty validators', () => {
      const validator = composeValidators([]);
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      expect(Effect.runSync(validator(source, target, graph))).toBe(true);
    });

    it('should fail if any validator fails', () => {
      const validator = composeValidators([directionValidator, dataTypeValidator]);
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'string' });
      expect(Effect.runSync(validator(source, target, graph))).toBe(false);
    });

    it('should pass if all validators pass', () => {
      const validator = composeValidators([directionValidator, dataTypeValidator]);
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'number' });
      expect(Effect.runSync(validator(source, target, graph))).toBe(true);
    });

    it('should short-circuit on first failure', () => {
      let callCount = 0;
      const countingValidator = () => { callCount++; return Effect.succeed(true); };
      const failValidator = () => Effect.succeed(false);
      const validator = composeValidators([failValidator, countingValidator]);
      const source = makePort({ id: 'out', direction: 'east' });
      const target = makePort({ id: 'in', direction: 'west' });
      Effect.runSync(validator(source, target, graph));
      expect(callCount).toBe(0);
    });
  });

  describe('defaultConnectionValidator', () => {
    it('should validate a valid connection', () => {
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'west', dataType: 'number' });
      expect(Effect.runSync(defaultConnectionValidator(source, target, graph))).toBe(true);
    });

    it('should reject invalid direction', () => {
      const source = makePort({ id: 'out', direction: 'east', dataType: 'number' });
      const target = makePort({ id: 'in', direction: 'east', dataType: 'number' });
      expect(Effect.runSync(defaultConnectionValidator(source, target, graph))).toBe(false);
    });
  });
});
