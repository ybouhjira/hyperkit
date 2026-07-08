import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  emptyGraph,
  addNode,
  removeNode,
  updateNode,
  addEdge,
  removeEdge,
  updateEdge,
  mergeGraphs,
  subgraph,
  getNeighbors,
  getConnectedEdges,
  topologicalSort,
  detectCycles,
  createNode,
  createEdge,
} from '../operations';
import { NodeId, EdgeId, PortId } from '../types';

// Helper to run Effect and get success value
const runEffect = <A, E>(effect: Effect.Effect<A, E>): A =>
  Effect.runSync(effect);

// Helper to expect effect to fail
const expectFailure = <A, E>(effect: Effect.Effect<A, E>): void => {
  expect(() => runEffect(effect)).toThrow();
};

describe('Graph Operations', () => {
  describe('emptyGraph', () => {
    it('creates an empty graph with no nodes or edges', () => {
      const graph = emptyGraph();
      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.size).toBe(0);
    });

    it('creates a graph with specified id', () => {
      const graph = emptyGraph('test-graph');
      expect(graph.id).toBe('test-graph');
    });

    it('creates a graph with random id when not specified', () => {
      const graph = emptyGraph();
      expect(graph.id).toBeDefined();
      expect(typeof graph.id).toBe('string');
    });
  });

  describe('createNode', () => {
    it('creates a node with default values', () => {
      const node = createNode('n1', { label: 'Test' });
      expect(node.id).toBe('n1');
      expect(node.data).toEqual({ label: 'Test' });
      expect(node.position).toEqual({ x: 0, y: 0 });
      expect(node.size).toEqual({ width: 150, height: 50 });
      expect(node.shape).toBe('rectangle');
      expect(node.ports).toEqual([]);
      expect(node.style).toEqual({});
    });

    it('creates a node with custom options', () => {
      const node = createNode('n1', {}, {
        position: { x: 100, y: 200 },
        size: { width: 200, height: 100 },
        shape: 'ellipse',
        label: 'Custom',
      });
      expect(node.position).toEqual({ x: 100, y: 200 });
      expect(node.size).toEqual({ width: 200, height: 100 });
      expect(node.shape).toBe('ellipse');
      expect(node.label).toBe('Custom');
    });
  });

  describe('createEdge', () => {
    it('creates an edge with default values', () => {
      const edge = createEdge('e1', 'n1', 'n2', {});
      expect(edge.id).toBe('e1');
      expect(edge.source).toBe('n1');
      expect(edge.target).toBe('n2');
      expect(edge.sourceArrow).toEqual({ type: 'none' });
      expect(edge.targetArrow).toEqual({ type: 'triangle' });
      expect(edge.style).toEqual({});
    });

    it('creates an edge with custom options', () => {
      const edge = createEdge('e1', 'n1', 'n2', {}, {
        label: { text: 'label', position: 'center' },
        sourceArrow: { type: 'diamond' },
      });
      expect(edge.label).toEqual({ text: 'label', position: 'center' });
      expect(edge.sourceArrow).toEqual({ type: 'diamond' });
    });

    // Regression: sourcePort/targetPort used to be silently dropped because
    // the helper enumerated fields instead of spreading options (the same bug
    // createNode had). Port-to-port wiring depends on these surviving.
    it('forwards sourcePort/targetPort (and any optional Edge field)', () => {
      const edge = createEdge('e1', 'n1', 'n2', {}, {
        sourcePort: PortId('out'),
        targetPort: PortId('in:prompt'),
      });
      expect(edge.sourcePort).toBe('out');
      expect(edge.targetPort).toBe('in:prompt');
      // id/source/target/data can never be overridden by options spread
      expect(edge.id).toBe('e1');
      expect(edge.source).toBe('n1');
      expect(edge.target).toBe('n2');
    });
  });

  describe('addNode', () => {
    it('adds a node to an empty graph', () => {
      const graph = emptyGraph();
      const node = createNode('n1', { label: 'Test' });
      const result = runEffect(addNode(graph, node));
      expect(result.nodes.size).toBe(1);
      expect(result.nodes.get(node.id)).toEqual(node);
    });

    it('fails when adding duplicate node', () => {
      const graph = emptyGraph();
      const node = createNode('n1', { label: 'Test' });
      const g1 = runEffect(addNode(graph, node));
      expectFailure(addNode(g1, node));
    });

    it('does not mutate original graph', () => {
      const graph = emptyGraph();
      const node = createNode('n1', { label: 'Test' });
      runEffect(addNode(graph, node));
      expect(graph.nodes.size).toBe(0);
    });

    it('adds multiple nodes sequentially', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      expect(g.nodes.size).toBe(2);
    });
  });

  describe('removeNode', () => {
    it('removes a node and its connected edges', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, e1));

      const result = runEffect(removeNode(g, n1.id));
      expect(result.nodes.size).toBe(1);
      expect(result.edges.size).toBe(0); // edge removed with node
    });

    it('fails when node does not exist', () => {
      const graph = emptyGraph();
      expectFailure(removeNode(graph, 'nonexistent' as NodeId));
    });

    it('removes only edges connected to the removed node', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n3', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const result = runEffect(removeNode(g, n1.id));
      expect(result.nodes.size).toBe(2);
      expect(result.edges.size).toBe(1); // only e2 remains
    });
  });

  describe('updateNode', () => {
    it('updates node properties immutably', () => {
      const graph = emptyGraph();
      const node = createNode('n1', {}, { label: 'Original' });
      const g = runEffect(addNode(graph, node));
      const result = runEffect(updateNode(g, node.id, { label: 'Updated' }));
      expect(result.nodes.get(node.id)?.label).toBe('Updated');
      expect(g.nodes.get(node.id)?.label).toBe('Original'); // original unchanged
    });

    it('fails when node does not exist', () => {
      const graph = emptyGraph();
      expectFailure(updateNode(graph, 'nonexistent' as NodeId, {}));
    });

    it('updates position and size', () => {
      const graph = emptyGraph();
      const node = createNode('n1', {});
      let g = runEffect(addNode(graph, node));
      g = runEffect(updateNode(g, node.id, {
        position: { x: 100, y: 200 },
        size: { width: 300, height: 150 },
      }));
      const updated = g.nodes.get(node.id);
      expect(updated?.position).toEqual({ x: 100, y: 200 });
      expect(updated?.size).toEqual({ width: 300, height: 150 });
    });
  });

  describe('addEdge', () => {
    it('adds an edge between existing nodes', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      const result = runEffect(addEdge(g, edge));
      expect(result.edges.size).toBe(1);
      expect(result.edges.get(edge.id)).toEqual(edge);
    });

    it('fails when source node does not exist', () => {
      const graph = emptyGraph();
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});
      const g = runEffect(addNode(graph, n2));
      expectFailure(addEdge(g, edge));
    });

    it('fails when target node does not exist', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const edge = createEdge('e1', 'n1', 'n2', {});
      const g = runEffect(addNode(graph, n1));
      expectFailure(addEdge(g, edge));
    });

    it('fails when adding duplicate edge', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});
      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, edge));
      expectFailure(addEdge(g, edge));
    });

    it('allows self-loops', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const edge = createEdge('e1', 'n1', 'n1', {});
      let g = runEffect(addNode(graph, n1));
      g = runEffect(addEdge(g, edge));
      expect(g.edges.size).toBe(1);
    });
  });

  describe('removeEdge', () => {
    it('removes an edge', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, edge));
      const result = runEffect(removeEdge(g, edge.id));
      expect(result.edges.size).toBe(0);
    });

    it('fails when edge does not exist', () => {
      const graph = emptyGraph();
      expectFailure(removeEdge(graph, EdgeId('nonexistent')));
    });

    it('does not remove nodes when removing edge', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, edge));
      const result = runEffect(removeEdge(g, edge.id));
      expect(result.nodes.size).toBe(2);
    });
  });

  describe('updateEdge', () => {
    it('updates edge properties', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const edge = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, edge));
      const result = runEffect(updateEdge(g, edge.id, {
        label: { text: 'Updated', position: 'center' },
      }));
      expect(result.edges.get(edge.id)?.label).toEqual({ text: 'Updated', position: 'center' });
    });

    it('fails when edge does not exist', () => {
      const graph = emptyGraph();
      expectFailure(updateEdge(graph, EdgeId('nonexistent'), {}));
    });
  });

  describe('mergeGraphs', () => {
    it('combines nodes and edges from two graphs', () => {
      const g1 = emptyGraph('g1');
      const g2 = emptyGraph('g2');
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});

      const ga = runEffect(addNode(g1, n1));
      const gb = runEffect(addNode(g2, n2));
      const merged = mergeGraphs(ga, gb);

      expect(merged.nodes.size).toBe(2);
      expect(merged.id).toBe('g1'); // keeps first graph's id
    });

    it('overwrites nodes with same id from second graph', () => {
      const g1 = emptyGraph();
      const g2 = emptyGraph();
      const n1a = createNode('n1', {}, { label: 'First' });
      const n1b = createNode('n1', {}, { label: 'Second' });

      const ga = runEffect(addNode(g1, n1a));
      const gb = runEffect(addNode(g2, n1b));
      const merged = mergeGraphs(ga, gb);

      expect(merged.nodes.size).toBe(1);
      expect(merged.nodes.get(n1a.id)?.label).toBe('Second');
    });

    it('merges metadata', () => {
      const g1 = emptyGraph();
      const g2 = emptyGraph();
      const ga = { ...g1, metadata: { a: 1 } };
      const gb = { ...g2, metadata: { b: 2 } };
      const merged = mergeGraphs(ga, gb);
      expect(merged.metadata).toEqual({ a: 1, b: 2 });
    });
  });

  describe('subgraph', () => {
    it('extracts a subgraph with only specified nodes', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n3', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const sub = subgraph(g, new Set([n1.id, n2.id]));
      expect(sub.nodes.size).toBe(2);
      expect(sub.edges.size).toBe(1); // only e1 connects n1-n2
      expect(sub.edges.has(e1.id)).toBe(true);
    });

    it('returns empty graph for empty node set', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      let g = runEffect(addNode(graph, n1));
      const sub = subgraph(g, new Set());
      expect(sub.nodes.size).toBe(0);
      expect(sub.edges.size).toBe(0);
    });

    it('ignores nonexistent node ids', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      let g = runEffect(addNode(graph, n1));
      const sub = subgraph(g, new Set([n1.id, 'nonexistent' as NodeId]));
      expect(sub.nodes.size).toBe(1);
    });
  });

  describe('getNeighbors', () => {
    it('returns all neighbors of a node', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n3', 'n1', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const neighbors = runEffect(getNeighbors(g, n1.id));
      expect(neighbors.size).toBe(2);
      expect(neighbors.has(n2.id)).toBe(true);
      expect(neighbors.has(n3.id)).toBe(true);
    });

    it('returns empty set for isolated node', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      let g = runEffect(addNode(graph, n1));
      const neighbors = runEffect(getNeighbors(g, n1.id));
      expect(neighbors.size).toBe(0);
    });

    it('fails when node does not exist', () => {
      const graph = emptyGraph();
      expectFailure(getNeighbors(graph, 'nonexistent' as NodeId));
    });

    it('includes self in neighbors for self-loop', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const edge = createEdge('e1', 'n1', 'n1', {});
      let g = runEffect(addNode(graph, n1));
      g = runEffect(addEdge(g, edge));
      const neighbors = runEffect(getNeighbors(g, n1.id));
      expect(neighbors.has(n1.id)).toBe(true);
    });
  });

  describe('getConnectedEdges', () => {
    it('returns all edges connected to a node', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n3', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const edges = runEffect(getConnectedEdges(g, n2.id));
      expect(edges.length).toBe(2);
      expect(edges.some(e => e.id === e1.id)).toBe(true);
      expect(edges.some(e => e.id === e2.id)).toBe(true);
    });

    it('returns empty array for isolated node', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      let g = runEffect(addNode(graph, n1));
      const edges = runEffect(getConnectedEdges(g, n1.id));
      expect(edges.length).toBe(0);
    });

    it('fails when node does not exist', () => {
      const graph = emptyGraph();
      expectFailure(getConnectedEdges(graph, 'nonexistent' as NodeId));
    });
  });

  describe('topologicalSort', () => {
    it('returns nodes in topological order for DAG', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n3', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const sorted = runEffect(topologicalSort(g));
      expect(sorted.indexOf(n1.id)).toBeLessThan(sorted.indexOf(n2.id));
      expect(sorted.indexOf(n2.id)).toBeLessThan(sorted.indexOf(n3.id));
    });

    it('fails when graph has cycles', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n1', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      expectFailure(topologicalSort(g));
    });

    it('handles disconnected components', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const n3 = createNode('n3', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addNode(g, n3));
      g = runEffect(addEdge(g, e1));

      const sorted = runEffect(topologicalSort(g));
      expect(sorted.length).toBe(3);
      expect(sorted.indexOf(n1.id)).toBeLessThan(sorted.indexOf(n2.id));
    });

    it('handles empty graph', () => {
      const graph = emptyGraph();
      const sorted = runEffect(topologicalSort(graph));
      expect(sorted.length).toBe(0);
    });
  });

  describe('detectCycles', () => {
    it('returns false for DAG', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, e1));

      const hasCycles = runEffect(detectCycles(g));
      expect(hasCycles).toBe(false);
    });

    it('returns true for cyclic graph', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const n2 = createNode('n2', {});
      const e1 = createEdge('e1', 'n1', 'n2', {});
      const e2 = createEdge('e2', 'n2', 'n1', {});

      let g = runEffect(addNode(graph, n1));
      g = runEffect(addNode(g, n2));
      g = runEffect(addEdge(g, e1));
      g = runEffect(addEdge(g, e2));

      const hasCycles = runEffect(detectCycles(g));
      expect(hasCycles).toBe(true);
    });

    it('returns false for empty graph', () => {
      const graph = emptyGraph();
      const hasCycles = runEffect(detectCycles(graph));
      expect(hasCycles).toBe(false);
    });

    it('returns true for self-loop', () => {
      const graph = emptyGraph();
      const n1 = createNode('n1', {});
      const edge = createEdge('e1', 'n1', 'n1', {});
      let g = runEffect(addNode(graph, n1));
      g = runEffect(addEdge(g, edge));
      const hasCycles = runEffect(detectCycles(g));
      expect(hasCycles).toBe(true);
    });
  });
});
