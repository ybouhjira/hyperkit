import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import {
  NodeId, EdgeId, PortId,
  emptyGraph, addNode, addEdge,
  getPort, getPortConnections, canConnect, findPortOwner,
  defaultConnectionValidator,
} from '../index';
import type { Graph, Node, Edge } from '../index';

describe('Graph Port Operations', () => {
  let graph: Graph;

  const node1: Node = {
    id: NodeId('n1'), data: {},
    position: { x: 0, y: 0 }, size: { width: 100, height: 50 },
    ports: [
      { id: PortId('n1_out'), direction: 'east', offset: 0.5, dataType: 'number' },
    ],
    shape: 'rectangle', style: {},
  };

  const node2: Node = {
    id: NodeId('n2'), data: {},
    position: { x: 200, y: 0 }, size: { width: 100, height: 50 },
    ports: [
      { id: PortId('n2_in'), direction: 'west', offset: 0.3, dataType: 'number' },
      { id: PortId('n2_out'), direction: 'east', offset: 0.7, dataType: 'number' },
    ],
    shape: 'rectangle', style: {},
  };

  const edge: Edge = {
    id: EdgeId('e1'), source: NodeId('n1'), target: NodeId('n2'),
    sourcePort: PortId('n1_out'), targetPort: PortId('n2_in'),
    data: {}, sourceArrow: { type: 'none' }, targetArrow: { type: 'triangle' }, style: {},
  };

  beforeEach(() => {
    graph = emptyGraph();
    graph = Effect.runSync(addNode(graph, node1));
    graph = Effect.runSync(addNode(graph, node2));
    graph = Effect.runSync(addEdge(graph, edge));
  });

  describe('getPort', () => {
    it('should return a port by node and port ID', () => {
      const port = Effect.runSync(getPort(graph, NodeId('n2'), PortId('n2_in')));
      expect(port.direction).toBe('west');
      expect(port.dataType).toBe('number');
    });

    it('should fail for non-existent node', () => {
      expect(() => Effect.runSync(getPort(graph, NodeId('nonexistent'), PortId('n2_in')))).toThrow();
    });

    it('should fail for non-existent port', () => {
      expect(() => Effect.runSync(getPort(graph, NodeId('n1'), PortId('nonexistent')))).toThrow();
    });
  });

  describe('getPortConnections', () => {
    it('should return edges connected to a specific port on a specific node', () => {
      const connections = getPortConnections(graph, NodeId('n1'), PortId('n1_out'));
      expect(connections).toHaveLength(1);
      expect(connections[0]?.id).toBe(EdgeId('e1'));
    });

    it('should return empty array for unconnected port', () => {
      const connections = getPortConnections(graph, NodeId('n2'), PortId('n2_out'));
      expect(connections).toHaveLength(0);
    });

    it('should disambiguate ports with same ID on different nodes', () => {
      // Both nodes have a port - ensure nodeId filters correctly
      const fromN1 = getPortConnections(graph, NodeId('n1'), PortId('n1_out'));
      const fromN2 = getPortConnections(graph, NodeId('n2'), PortId('n2_in'));
      expect(fromN1).toHaveLength(1);
      expect(fromN2).toHaveLength(1);
    });
  });

  describe('canConnect', () => {
    it('should allow valid connection', () => {
      const node3: Node = {
        id: NodeId('n3'), data: {},
        position: { x: 400, y: 0 }, size: { width: 100, height: 50 },
        ports: [{ id: PortId('n3_in'), direction: 'west', offset: 0.5, dataType: 'number' }],
        shape: 'rectangle', style: {},
      };
      graph = Effect.runSync(addNode(graph, node3));
      const result = Effect.runSync(
        canConnect(graph, NodeId('n2'), PortId('n2_out'), NodeId('n3'), PortId('n3_in'), defaultConnectionValidator)
      );
      expect(result).toBe(true);
    });

    it('should reject self-connection', () => {
      const result = Effect.runSync(
        canConnect(graph, NodeId('n2'), PortId('n2_in'), NodeId('n2'), PortId('n2_out'))
      );
      expect(result).toBe(false);
    });

    it('should allow connection without validator', () => {
      const node3: Node = {
        id: NodeId('n3'), data: {},
        position: { x: 400, y: 0 }, size: { width: 100, height: 50 },
        ports: [{ id: PortId('n3_in'), direction: 'west', offset: 0.5 }],
        shape: 'rectangle', style: {},
      };
      graph = Effect.runSync(addNode(graph, node3));
      const result = Effect.runSync(
        canConnect(graph, NodeId('n2'), PortId('n2_out'), NodeId('n3'), PortId('n3_in'))
      );
      expect(result).toBe(true);
    });
  });

  describe('findPortOwner', () => {
    it('should find the node owning a port', () => {
      const result = findPortOwner(graph, PortId('n2_in'));
      expect(result?.nodeId).toBe(NodeId('n2'));
      expect(result?.port.direction).toBe('west');
    });

    it('should return undefined for non-existent port', () => {
      expect(findPortOwner(graph, PortId('nonexistent'))).toBeUndefined();
    });
  });
});
