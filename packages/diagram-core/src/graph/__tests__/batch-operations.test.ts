import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { emptyGraph } from '../operations';
import {
  moveNodes,
  resizeNode,
  updateNodeLabel,
  updateEdgeLabel,
  reconnectEdge,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  cloneSubgraph,
  nodesInBox,
  snapToGrid,
} from '../batch-operations';
import { NodeId, EdgeId, GraphId, Node, Edge } from '../types';
import { NodeNotFoundError, EdgeNotFoundError } from '../../errors';

const createTestNode = (id: string, x: number, y: number): Node<{ value: string }> => ({
  id: id as NodeId,
  data: { value: `node-${id}` },
  position: { x, y },
  size: { width: 100, height: 60 },
  ports: [],
  shape: 'rectangle',
  label: `Node ${id}`,
  style: {},
});

const createTestEdge = (id: string, source: string, target: string): Edge<{ weight: number }> => ({
  id: id as EdgeId,
  source: source as NodeId,
  target: target as NodeId,
  data: { weight: 1 },
  sourceArrow: { type: 'none' },
  targetArrow: { type: 'triangle' },
  style: {},
});

describe('batch-operations', () => {
  describe('moveNodes', () => {
    it('moves a single node by delta', () => {
      const graph = emptyGraph('test');
      const node = createTestNode('n1', 10, 20);
      const withNode = { ...graph, nodes: new Map([[node.id, node]]) };

      const result = Effect.runSync(moveNodes(withNode, [node.id], { dx: 5, dy: 10 }));
      const movedNode = result.nodes.get(node.id);

      expect(movedNode?.position).toEqual({ x: 15, y: 30 });
    });

    it('moves multiple nodes preserving relative positions', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 50);
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1], [n2.id, n2]]) };

      const result = Effect.runSync(moveNodes(withNodes, [n1.id, n2.id], { dx: 10, dy: 20 }));

      expect(result.nodes.get(n1.id)?.position).toEqual({ x: 10, y: 20 });
      expect(result.nodes.get(n2.id)?.position).toEqual({ x: 110, y: 70 });
    });

    it('fails when node not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(moveNodes(graph, ['missing' as NodeId], { dx: 5, dy: 5 }));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'NodeNotFoundError' }),
        });
      }
    });
  });

  describe('resizeNode', () => {
    it('resizes a node to new dimensions', () => {
      const graph = emptyGraph('test');
      const node = createTestNode('n1', 10, 20);
      const withNode = { ...graph, nodes: new Map([[node.id, node]]) };

      const result = Effect.runSync(resizeNode(withNode, node.id, { width: 200, height: 120 }));
      const resizedNode = result.nodes.get(node.id);

      expect(resizedNode?.size).toEqual({ width: 200, height: 120 });
      expect(resizedNode?.position).toEqual({ x: 10, y: 20 }); // position unchanged
    });

    it('fails when node not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(resizeNode(graph, 'missing' as NodeId, { width: 100, height: 100 }));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'NodeNotFoundError' }),
        });
      }
    });
  });

  describe('updateNodeLabel', () => {
    it('updates a node label', () => {
      const graph = emptyGraph('test');
      const node = createTestNode('n1', 10, 20);
      const withNode = { ...graph, nodes: new Map([[node.id, node]]) };

      const result = Effect.runSync(updateNodeLabel(withNode, node.id, 'New Label'));
      const updatedNode = result.nodes.get(node.id);

      expect(updatedNode?.label).toBe('New Label');
    });

    it('fails when node not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(updateNodeLabel(graph, 'missing' as NodeId, 'Label'));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'NodeNotFoundError' }),
        });
      }
    });
  });

  describe('updateEdgeLabel', () => {
    it('updates an edge label', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const edge = createTestEdge('e1', 'n1', 'n2');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2]]),
        edges: new Map([[edge.id, edge]]),
      };

      const result = Effect.runSync(updateEdgeLabel(withGraph, edge.id, 'Edge Label'));
      const updatedEdge = result.edges.get(edge.id);

      expect(updatedEdge?.label?.text).toBe('Edge Label');
      expect(updatedEdge?.label?.position).toBe('center');
    });

    it('fails when edge not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(updateEdgeLabel(graph, 'missing' as EdgeId, 'Label'));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'EdgeNotFoundError' }),
        });
      }
    });
  });

  describe('reconnectEdge', () => {
    it('reconnects edge to new source', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const edge = createTestEdge('e1', 'n1', 'n2');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]),
        edges: new Map([[edge.id, edge]]),
      };

      const result = Effect.runSync(reconnectEdge(withGraph, edge.id, { source: n3.id }));
      const updatedEdge = result.edges.get(edge.id);

      expect(updatedEdge?.source).toBe(n3.id);
      expect(updatedEdge?.target).toBe(n2.id);
    });

    it('reconnects edge to new target', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const edge = createTestEdge('e1', 'n1', 'n2');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]),
        edges: new Map([[edge.id, edge]]),
      };

      const result = Effect.runSync(reconnectEdge(withGraph, edge.id, { target: n3.id }));
      const updatedEdge = result.edges.get(edge.id);

      expect(updatedEdge?.source).toBe(n1.id);
      expect(updatedEdge?.target).toBe(n3.id);
    });

    it('fails when edge not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(reconnectEdge(graph, 'missing' as EdgeId, { source: 'n1' as NodeId }));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'EdgeNotFoundError' }),
        });
      }
    });

    it('fails when new node not found', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const edge = createTestEdge('e1', 'n1', 'n2');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2]]),
        edges: new Map([[edge.id, edge]]),
      };

      const result = Effect.runSyncExit(reconnectEdge(withGraph, edge.id, { source: 'missing' as NodeId }));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'InvalidEdgeError' }),
        });
      }
    });
  });

  describe('addNodes', () => {
    it('adds multiple nodes at once', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);

      const result = Effect.runSync(addNodes(graph, [n1, n2]));

      expect(result.nodes.size).toBe(2);
      expect(result.nodes.get(n1.id)).toEqual(n1);
      expect(result.nodes.get(n2.id)).toEqual(n2);
    });

    it('fails when adding duplicate node', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n1Dup = createTestNode('n1', 50, 50);

      const result = Effect.runSyncExit(addNodes(graph, [n1, n1Dup]));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'DuplicateNodeError' }),
        });
      }
    });
  });

  describe('addEdges', () => {
    it('adds multiple edges at once', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]) };

      const e1 = createTestEdge('e1', 'n1', 'n2');
      const e2 = createTestEdge('e2', 'n2', 'n3');

      const result = Effect.runSync(addEdges(withNodes, [e1, e2]));

      expect(result.edges.size).toBe(2);
      expect(result.edges.get(e1.id)).toEqual(e1);
      expect(result.edges.get(e2.id)).toEqual(e2);
    });

    it('fails when adding duplicate edge', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1], [n2.id, n2]]) };

      const e1 = createTestEdge('e1', 'n1', 'n2');
      const e1Dup = createTestEdge('e1', 'n1', 'n2');

      const result = Effect.runSyncExit(addEdges(withNodes, [e1, e1Dup]));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'DuplicateEdgeError' }),
        });
      }
    });
  });

  describe('removeNodes', () => {
    it('removes multiple nodes and their edges', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const e1 = createTestEdge('e1', 'n1', 'n2');
      const e2 = createTestEdge('e2', 'n2', 'n3');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]),
        edges: new Map([[e1.id, e1], [e2.id, e2]]),
      };

      const result = Effect.runSync(removeNodes(withGraph, [n1.id, n2.id]));

      expect(result.nodes.size).toBe(1);
      expect(result.nodes.has(n3.id)).toBe(true);
      expect(result.edges.size).toBe(0); // both edges connected to removed nodes
    });

    it('fails when node not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(removeNodes(graph, ['missing' as NodeId]));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'NodeNotFoundError' }),
        });
      }
    });
  });

  describe('removeEdges', () => {
    it('removes multiple edges', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const e1 = createTestEdge('e1', 'n1', 'n2');
      const e2 = createTestEdge('e2', 'n2', 'n3');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]),
        edges: new Map([[e1.id, e1], [e2.id, e2]]),
      };

      const result = Effect.runSync(removeEdges(withGraph, [e1.id, e2.id]));

      expect(result.edges.size).toBe(0);
      expect(result.nodes.size).toBe(3); // nodes remain
    });

    it('fails when edge not found', () => {
      const graph = emptyGraph('test');
      const result = Effect.runSyncExit(removeEdges(graph, ['missing' as EdgeId]));

      expect(result._tag).toBe('Failure');
      if (result._tag === 'Failure') {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: expect.objectContaining({ _tag: 'EdgeNotFoundError' }),
        });
      }
    });
  });

  describe('cloneSubgraph', () => {
    it('clones nodes with offset', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1], [n2.id, n2]]) };

      const { nodes } = cloneSubgraph(withNodes, [n1.id, n2.id], { dx: 50, dy: 50 });

      expect(nodes.length).toBe(2);
      expect(nodes[0].position).toEqual({ x: 50, y: 50 });
      expect(nodes[1].position).toEqual({ x: 150, y: 50 });
      expect(nodes[0].id).not.toBe(n1.id);
      expect(nodes[1].id).not.toBe(n2.id);
    });

    it('includes internal edges in clone', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const e1 = createTestEdge('e1', 'n1', 'n2');
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2]]),
        edges: new Map([[e1.id, e1]]),
      };

      const { nodes, edges } = cloneSubgraph(withGraph, [n1.id, n2.id]);

      expect(nodes.length).toBe(2);
      expect(edges.length).toBe(1);
      expect(edges[0].id).not.toBe(e1.id);
      // Check that edge connects the cloned nodes
      const nodeIds = new Set(nodes.map((n) => n.id));
      expect(nodeIds.has(edges[0].source)).toBe(true);
      expect(nodeIds.has(edges[0].target)).toBe(true);
    });

    it('excludes external edges from clone', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const n2 = createTestNode('n2', 100, 0);
      const n3 = createTestNode('n3', 200, 0);
      const e1 = createTestEdge('e1', 'n1', 'n2');
      const e2 = createTestEdge('e2', 'n2', 'n3'); // external edge
      const withGraph = {
        ...graph,
        nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]),
        edges: new Map([[e1.id, e1], [e2.id, e2]]),
      };

      const { edges } = cloneSubgraph(withGraph, [n1.id, n2.id]);

      expect(edges.length).toBe(1); // only internal edge
    });
  });

  describe('nodesInBox', () => {
    it('finds nodes within selection box', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 10, 10); // 10,10 -> 110,70
      const n2 = createTestNode('n2', 50, 50); // 50,50 -> 150,110
      const n3 = createTestNode('n3', 200, 200); // outside box
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1], [n2.id, n2], [n3.id, n3]]) };

      const box = { x: 0, y: 0, width: 200, height: 200 };
      const result = nodesInBox(withNodes, new Map(), box);

      expect(result).toContain(n1.id);
      expect(result).toContain(n2.id);
      expect(result).not.toContain(n3.id);
    });

    it('excludes nodes partially outside box', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 10, 10); // 10,10 -> 110,70
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1]]) };

      const box = { x: 0, y: 0, width: 100, height: 60 }; // too small
      const result = nodesInBox(withNodes, new Map(), box);

      expect(result.length).toBe(0); // node extends beyond box
    });

    it('uses nodePositions override when provided', () => {
      const graph = emptyGraph('test');
      const n1 = createTestNode('n1', 0, 0);
      const withNodes = { ...graph, nodes: new Map([[n1.id, n1]]) };

      const nodePositions = new Map([[n1.id, { x: 50, y: 50 }]]);
      const box = { x: 0, y: 0, width: 200, height: 200 };
      const result = nodesInBox(withNodes, nodePositions, box);

      expect(result).toContain(n1.id);
    });
  });

  describe('snapToGrid', () => {
    it('snaps value to nearest grid point', () => {
      expect(snapToGrid(0, 10)).toBe(0);
      expect(snapToGrid(5, 10)).toBe(10);
      expect(snapToGrid(14, 10)).toBe(10);
      expect(snapToGrid(15, 10)).toBe(20);
      expect(snapToGrid(23, 5)).toBe(25);
      expect(snapToGrid(27, 5)).toBe(25);
    });

    it('handles negative values', () => {
      expect(snapToGrid(-5, 10)).toBe(-10);
      expect(snapToGrid(-14, 10)).toBe(-10);
      expect(snapToGrid(-15, 10)).toBe(-20);
    });

    it('handles decimal grid sizes', () => {
      expect(snapToGrid(1.3, 0.5)).toBe(1.5);
      expect(snapToGrid(1.2, 0.5)).toBe(1);
    });
  });
});
