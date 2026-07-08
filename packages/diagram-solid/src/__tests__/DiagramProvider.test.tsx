import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Node, Edge, NodeId, EdgeId } from '@ybouhjira/diagram-core';
import { renderWithProvider, makeNode, makeEdge, buildGraph } from './test-helpers';

describe('DiagramProvider', () => {
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe('Initialization', () => {
    it('initializes with default values', () => {
      const { state } = renderWithProvider();

      expect(state.graph.nodes.size).toBe(0);
      expect(state.graph.edges.size).toBe(0);
      expect(state.selectedNodes.size).toBe(0);
      expect(state.selectedEdges.size).toBe(0);
      expect(state.editable).toBe(false);
      expect(state.interactionMode).toBe('select');
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
      expect(state.clipboard).toBeNull();
      expect(state.gridConfig).toEqual({ enabled: false, size: 20 });
      expect(state.dragState).toBeNull();
      expect(state.drawEdgeState).toBeNull();
      expect(state.selectionBox).toBeNull();
    });

    it('accepts initialGraph prop', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);

      const { state } = renderWithProvider({ initialGraph });

      expect(state.graph.nodes.size).toBe(2);
      expect(state.history[0]).toStrictEqual(initialGraph);
    });

    it('accepts editable prop', () => {
      const { state } = renderWithProvider({ editable: true });

      expect(state.editable).toBe(true);
    });

    it('accepts gridConfig prop', () => {
      const gridConfig = { enabled: true, size: 10 };
      const { state } = renderWithProvider({ gridConfig });

      expect(state.gridConfig).toEqual(gridConfig);
    });

    it('accepts maxHistorySize prop', () => {
      const { state, actions } = renderWithProvider({ maxHistorySize: 3 });

      // Add 5 nodes to exceed maxHistorySize of 3
      actions.addNode(makeNode('n1'));
      actions.addNode(makeNode('n2'));
      actions.addNode(makeNode('n3'));
      actions.addNode(makeNode('n4'));
      actions.addNode(makeNode('n5'));

      // History should be truncated to maxHistorySize
      expect(state.history.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Graph CRUD - addNode', () => {
    it('adds a node to the graph', () => {
      const { state, actions } = renderWithProvider();
      const node = makeNode('n1', 10, 20);

      actions.addNode(node);

      expect(state.graph.nodes.size).toBe(1);
      expect(state.graph.nodes.get('n1' as NodeId)).toMatchObject({ id: 'n1', position: { x: 10, y: 20 } });
    });

    it('pushes history after addNode', () => {
      const { state, actions } = renderWithProvider();

      expect(state.history).toHaveLength(1);
      actions.addNode(makeNode('n1'));

      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
    });

    it('calls onError if addNode fails', () => {
      const onError = vi.fn();
      const { actions } = renderWithProvider({ onError });

      // Attempt to add duplicate node
      actions.addNode(makeNode('n1'));
      actions.addNode(makeNode('n1'));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Graph CRUD - removeNode', () => {
    it('removes a node from the graph', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.removeNode('n1' as NodeId);

      expect(state.graph.nodes.size).toBe(1);
      expect(state.graph.nodes.get('n2' as NodeId)).toBeDefined();
      expect(state.graph.nodes.get('n1' as NodeId)).toBeUndefined();
    });

    it('removes node from selectedNodes', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(true);

      actions.removeNode('n1' as NodeId);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(false);
    });

    it('pushes history after removeNode', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.removeNode('n1' as NodeId);

      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Graph CRUD - updateNode', () => {
    it('updates a node in the graph', () => {
      const nodes = [makeNode('n1', 10, 20)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.updateNode('n1' as NodeId, { position: { x: 100, y: 200 } });

      expect(state.graph.nodes.get('n1' as NodeId)?.position).toEqual({ x: 100, y: 200 });
    });

    it('pushes history after updateNode', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.updateNode('n1' as NodeId, { label: 'Updated' });

      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Graph CRUD - addEdge', () => {
    it('adds an edge to the graph', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const edge = makeEdge('e1', 'n1', 'n2');
      actions.addEdge(edge);

      expect(state.graph.edges.size).toBe(1);
      expect(state.graph.edges.get('e1' as EdgeId)).toMatchObject({ id: 'e1', source: 'n1', target: 'n2' });
    });

    it('pushes history after addEdge', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.addEdge(makeEdge('e1', 'n1', 'n2'));

      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Graph CRUD - removeEdge', () => {
    it('removes an edge from the graph', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.removeEdge('e1' as EdgeId);

      expect(state.graph.edges.size).toBe(0);
    });

    it('removes edge from selectedEdges', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectEdge('e1' as EdgeId);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(true);

      actions.removeEdge('e1' as EdgeId);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(false);
    });

    it('pushes history after removeEdge', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.removeEdge('e1' as EdgeId);

      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Graph CRUD - setGraph', () => {
    it('sets the graph without pushing history', () => {
      const { state, actions } = renderWithProvider();
      const newGraph = buildGraph([makeNode('n1'), makeNode('n2')]);

      const historyLength = state.history.length;
      actions.setGraph(newGraph);

      expect(state.graph.nodes.size).toBe(2);
      expect(state.history.length).toBe(historyLength); // No history push
    });
  });

  describe('Selection - selectNode', () => {
    it('selects a single node (replacing previous selection)', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      expect(state.selectedNodes.size).toBe(1);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(true);

      actions.selectNode('n2' as NodeId);
      expect(state.selectedNodes.size).toBe(1);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(false);
      expect(state.selectedNodes.has('n2' as NodeId)).toBe(true);
    });

    it('multi-selects nodes when multi=true', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId, true);
      actions.selectNode('n2' as NodeId, true);

      expect(state.selectedNodes.size).toBe(2);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(true);
      expect(state.selectedNodes.has('n2' as NodeId)).toBe(true);
    });

    it('toggles node selection when multi=true and already selected', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId, true);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(true);

      actions.selectNode('n1' as NodeId, true);
      expect(state.selectedNodes.has('n1' as NodeId)).toBe(false);
    });
  });

  describe('Selection - selectEdge', () => {
    it('selects a single edge (replacing previous selection)', () => {
      const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')];
      const edges = [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectEdge('e1' as EdgeId);
      expect(state.selectedEdges.size).toBe(1);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(true);

      actions.selectEdge('e2' as EdgeId);
      expect(state.selectedEdges.size).toBe(1);
      expect(state.selectedEdges.has('e2' as EdgeId)).toBe(true);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(false);
    });

    it('multi-selects edges when multi=true', () => {
      const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')];
      const edges = [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectEdge('e1' as EdgeId, true);
      actions.selectEdge('e2' as EdgeId, true);

      expect(state.selectedEdges.size).toBe(2);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(true);
      expect(state.selectedEdges.has('e2' as EdgeId)).toBe(true);
    });

    it('toggles edge selection when multi=true and already selected', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectEdge('e1' as EdgeId, true);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(true);

      actions.selectEdge('e1' as EdgeId, true);
      expect(state.selectedEdges.has('e1' as EdgeId)).toBe(false);
    });
  });

  describe('Selection - deselectAll', () => {
    it('clears all node and edge selections', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId, true);
      actions.selectNode('n2' as NodeId, true);
      actions.selectEdge('e1' as EdgeId, true);

      expect(state.selectedNodes.size).toBe(2);
      expect(state.selectedEdges.size).toBe(1);

      actions.deselectAll();

      expect(state.selectedNodes.size).toBe(0);
      expect(state.selectedEdges.size).toBe(0);
    });
  });

  describe('Undo/Redo History', () => {
    it('undo decrements history index and restores graph', () => {
      const initialGraph = buildGraph([makeNode('initial')]);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Start with 1 node (the initial node)
      expect(state.graph.nodes.size).toBe(1);
      expect(state.historyIndex).toBe(0);

      // Add a second node
      actions.addNode(makeNode('n1'));
      expect(state.historyIndex).toBe(1);
      expect(state.history.length).toBe(2);

      // Undo should restore to initial graph with 1 node
      actions.undo();
      expect(state.historyIndex).toBe(0);
      expect(state.graph).toBe(state.history[0]); // Should be same reference
    });

    it('undo does nothing at historyIndex 0', () => {
      const { state, actions } = renderWithProvider();

      expect(state.historyIndex).toBe(0);
      actions.undo();

      expect(state.historyIndex).toBe(0);
    });

    it('redo increments history index and restores graph', () => {
      const initialGraph = buildGraph([makeNode('initial')]);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.addNode(makeNode('n1'));
      const graphAfterAdd = state.graph;
      expect(state.historyIndex).toBe(1);

      actions.undo();
      expect(state.historyIndex).toBe(0);

      actions.redo();
      expect(state.historyIndex).toBe(1);
      expect(state.graph).toBe(graphAfterAdd); // Should restore to same graph
    });

    it('redo does nothing at end of history', () => {
      const { state, actions } = renderWithProvider();

      actions.addNode(makeNode('n1'));
      const index = state.historyIndex;

      actions.redo();
      expect(state.historyIndex).toBe(index);
    });

    it('canUndo returns correct value', () => {
      const { state, actions } = renderWithProvider();

      expect(actions.canUndo()).toBe(false);

      actions.addNode(makeNode('n1'));
      expect(actions.canUndo()).toBe(true);

      actions.undo();
      expect(actions.canUndo()).toBe(false);
    });

    it('canRedo returns correct value', () => {
      const { state, actions } = renderWithProvider();

      expect(actions.canRedo()).toBe(false);

      actions.addNode(makeNode('n1'));
      expect(actions.canRedo()).toBe(false);

      actions.undo();
      expect(actions.canRedo()).toBe(true);

      actions.redo();
      expect(actions.canRedo()).toBe(false);
    });

    it('new action after undo discards forward history', () => {
      const { state, actions } = renderWithProvider();

      actions.addNode(makeNode('n1'));
      expect(state.historyIndex).toBe(1);
      expect(state.history.length).toBe(2);

      actions.addNode(makeNode('n2'));
      expect(state.historyIndex).toBe(2);
      expect(state.history.length).toBe(3);
      const historyLength = state.history.length;

      actions.undo();
      expect(state.historyIndex).toBe(1);
      expect(state.history.length).toBe(historyLength); // History not truncated yet

      actions.addNode(makeNode('n3'));

      // After adding n3, forward history should be truncated
      // The old history[2] (with n2) should be replaced with new history[2] (with n3)
      expect(state.history.length).toBe(historyLength);
      expect(state.historyIndex).toBe(2);

      // Verify n3 is in the current graph
      expect(state.graph.nodes.get('n3' as NodeId)).toBeDefined();

      // Verify that we can't redo to the old n2 state
      expect(actions.canRedo()).toBe(false);
    });

    it('respects maxHistorySize limit', () => {
      const { state, actions } = renderWithProvider({ maxHistorySize: 3 });

      actions.addNode(makeNode('n1'));
      actions.addNode(makeNode('n2'));
      actions.addNode(makeNode('n3'));
      actions.addNode(makeNode('n4'));

      expect(state.history.length).toBe(3);
    });
  });

  describe('Clipboard - copy', () => {
    it('copies selected nodes and connected edges', () => {
      const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')];
      const edges = [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId, true);
      actions.selectNode('n2' as NodeId, true);
      actions.copy();

      expect(state.clipboard).not.toBeNull();
      expect(state.clipboard?.nodes.length).toBe(2);
      expect(state.clipboard?.edges.length).toBe(1); // Only e1 connects n1-n2
    });

    it('does nothing if no nodes selected', () => {
      const { state, actions } = renderWithProvider();

      actions.copy();
      expect(state.clipboard).toBeNull();
    });
  });

  describe('Clipboard - cut', () => {
    it('copies and deletes selected nodes', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.cut();

      expect(state.clipboard).not.toBeNull();
      expect(state.clipboard?.nodes.length).toBe(1);
      expect(state.graph.nodes.size).toBe(1);
      expect(state.graph.nodes.get('n2' as NodeId)).toBeDefined();
    });
  });

  describe('Clipboard - paste', () => {
    it('pastes nodes with new IDs and offset positions', () => {
      const nodes = [makeNode('n1', 0, 0)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.copy();
      actions.paste({ dx: 10, dy: 20 });

      expect(state.graph.nodes.size).toBe(2);

      const allNodes = Array.from(state.graph.nodes.values());
      const pastedNode = allNodes.find(n => n.id !== 'n1');
      expect(pastedNode?.id).toContain('_copy_1234567890');
      expect(pastedNode?.position).toEqual({ x: 10, y: 20 });
    });

    it('pastes edges with remapped node IDs', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId, true);
      actions.selectNode('n2' as NodeId, true);
      actions.copy();
      actions.paste();

      expect(state.graph.edges.size).toBe(2);

      const allEdges = Array.from(state.graph.edges.values());
      const pastedEdge = allEdges.find(e => e.id !== 'e1');
      expect(pastedEdge?.id).toContain('_copy_');
      expect(pastedEdge?.source).toContain('_copy_');
      expect(pastedEdge?.target).toContain('_copy_');

      // Verify edge source/target point to the pasted node IDs, not the originals
      const pastedNodeIds = Array.from(state.graph.nodes.keys()).filter(id => id.toString().includes('_copy_'));
      expect(pastedNodeIds).toHaveLength(2);
      expect(pastedEdge?.source.toString()).toContain('_copy_');
      expect(pastedEdge?.target.toString()).toContain('_copy_');
      // Verify the pasted edge references the newly pasted nodes
      expect(pastedNodeIds.includes(pastedEdge!.source)).toBe(true);
      expect(pastedNodeIds.includes(pastedEdge!.target)).toBe(true);
    });

    it('selects pasted nodes', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.copy();
      actions.paste();

      expect(state.selectedNodes.size).toBe(1);
      const selectedId = Array.from(state.selectedNodes)[0];
      expect(selectedId).toContain('_copy_');
    });

    it('pushes history after paste', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.copy();

      const historyLength = state.history.length;
      actions.paste();

      expect(state.history.length).toBe(historyLength + 1);
    });

    it('does nothing if clipboard is empty', () => {
      const { state, actions } = renderWithProvider();

      actions.paste();
      expect(state.graph.nodes.size).toBe(0);
    });

    it('uses default offset if not provided', () => {
      const nodes = [makeNode('n1', 0, 0)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.copy();
      actions.paste(); // No offset argument

      const allNodes = Array.from(state.graph.nodes.values());
      const pastedNode = allNodes.find(n => n.id !== 'n1');
      expect(pastedNode?.position).toEqual({ x: 20, y: 20 }); // Default offset
    });
  });

  describe('Clipboard - duplicate', () => {
    it('copies and pastes selected nodes', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.duplicate();

      expect(state.graph.nodes.size).toBe(2);
      expect(state.clipboard?.nodes.length).toBe(1);
    });
  });

  describe('Delete - deleteSelected', () => {
    it('deletes selected nodes and their edges', () => {
      const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')];
      const edges = [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n2' as NodeId);
      actions.deleteSelected();

      expect(state.graph.nodes.size).toBe(2);
      expect(state.graph.edges.size).toBe(0); // Both edges connected to n2
    });

    it('deletes selected edges', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectEdge('e1' as EdgeId);
      actions.deleteSelected();

      expect(state.graph.edges.size).toBe(0);
      expect(state.graph.nodes.size).toBe(2); // Nodes remain
    });

    it('clears selections after delete', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);
      actions.deleteSelected();

      expect(state.selectedNodes.size).toBe(0);
      expect(state.selectedEdges.size).toBe(0);
    });

    it('pushes history after delete', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNode('n1' as NodeId);

      const historyLength = state.history.length;
      actions.deleteSelected();

      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Drag lifecycle', () => {
    it('startDrag sets dragState', () => {
      const { state, actions } = renderWithProvider();

      const dragState = {
        nodeIds: ['n1' as NodeId],
        startX: 0,
        startY: 0,
        lastCursorX: 0,
        lastCursorY: 0,
      };

      actions.startDrag(dragState);
      expect(state.dragState).toEqual(dragState);
    });

    it('updateDrag updates current position', () => {
      const { state, actions } = renderWithProvider();

      actions.startDrag({
        nodeIds: ['n1' as NodeId],
        startX: 0,
        startY: 0,
        lastCursorX: 0,
        lastCursorY: 0,
      });

      actions.updateDrag(10, 20);

      expect(state.dragState?.lastCursorX).toBe(10);
      expect(state.dragState?.lastCursorY).toBe(20);
    });

    it('endDrag clears dragState and pushes history', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.startDrag({
        nodeIds: ['n1' as NodeId],
        startX: 0,
        startY: 0,
        lastCursorX: 10,
        lastCursorY: 10,
      });

      const historyLength = state.history.length;
      actions.endDrag();

      expect(state.dragState).toBeNull();
      expect(state.history.length).toBe(historyLength + 1);
    });

    it('endDrag does nothing if no dragState', () => {
      const { state, actions } = renderWithProvider();

      const historyLength = state.history.length;
      actions.endDrag();

      expect(state.history.length).toBe(historyLength);
    });
  });

  describe('Draw edge lifecycle', () => {
    it('startDrawEdge sets drawEdgeState', () => {
      const { state, actions } = renderWithProvider();

      actions.startDrawEdge('n1' as NodeId, 10, 20);

      expect(state.drawEdgeState).toEqual({
        sourceNodeId: 'n1',
        currentX: 10,
        currentY: 20,
      });
    });

    it('updateDrawEdge updates current position', () => {
      const { state, actions } = renderWithProvider();

      actions.startDrawEdge('n1' as NodeId, 0, 0);
      actions.updateDrawEdge(100, 200);

      expect(state.drawEdgeState?.currentX).toBe(100);
      expect(state.drawEdgeState?.currentY).toBe(200);
    });

    it('completeDrawEdge creates edge with triangle targetArrow', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.startDrawEdge('n1' as NodeId, 0, 0);
      actions.completeDrawEdge('n2' as NodeId);

      expect(state.graph.edges.size).toBe(1);
      const edge = Array.from(state.graph.edges.values())[0];
      expect(edge?.source).toBe('n1');
      expect(edge?.target).toBe('n2');
      expect(edge?.targetArrow.type).toBe('triangle');
      expect(state.drawEdgeState).toBeNull();
    });

    it('completeDrawEdge generates deterministic edge ID', () => {
      const nodes = [makeNode('n1'), makeNode('n2')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.startDrawEdge('n1' as NodeId, 0, 0);
      actions.completeDrawEdge('n2' as NodeId);

      const edge = Array.from(state.graph.edges.values())[0];
      expect(edge?.id).toBe('edge_n1_n2_1234567890');
    });

    it('cancelDrawEdge clears drawEdgeState without creating edge', () => {
      const { state, actions } = renderWithProvider();

      actions.startDrawEdge('n1' as NodeId, 0, 0);
      actions.cancelDrawEdge();

      expect(state.drawEdgeState).toBeNull();
      expect(state.graph.edges.size).toBe(0);
    });
  });

  describe('Selection box', () => {
    it('setSelectionBox sets the box', () => {
      const { state, actions } = renderWithProvider();

      const box = { x: 0, y: 0, width: 100, height: 100 };
      actions.setSelectionBox(box);

      expect(state.selectionBox).toEqual(box);
    });

    it('setSelectionBox can clear the box', () => {
      const { state, actions } = renderWithProvider();

      actions.setSelectionBox({ x: 0, y: 0, width: 100, height: 100 });
      actions.setSelectionBox(null);

      expect(state.selectionBox).toBeNull();
    });

    it('selectNodesInBox does nothing if no layout', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      actions.selectNodesInBox({ x: 0, y: 0, width: 200, height: 200 });

      expect(state.selectedNodes.size).toBe(0);
    });
  });

  describe('Grid config', () => {
    it('setGridSnap updates enabled and size', () => {
      const { state, actions } = renderWithProvider();

      actions.setGridSnap(true, 10);

      expect(state.gridConfig.enabled).toBe(true);
      expect(state.gridConfig.size).toBe(10);
    });

    it('setGridSnap keeps existing size if not provided', () => {
      const { state, actions } = renderWithProvider({ gridConfig: { enabled: false, size: 30 } });

      actions.setGridSnap(true);

      expect(state.gridConfig.enabled).toBe(true);
      expect(state.gridConfig.size).toBe(30);
    });
  });

  describe('Editable and interaction mode', () => {
    it('setEditable updates editable state', () => {
      const { state, actions } = renderWithProvider({ editable: false });

      actions.setEditable(true);
      expect(state.editable).toBe(true);

      actions.setEditable(false);
      expect(state.editable).toBe(false);
    });

    it('setInteractionMode updates mode', () => {
      const { state, actions } = renderWithProvider();

      actions.setInteractionMode('pan');
      expect(state.interactionMode).toBe('pan');

      actions.setInteractionMode('select');
      expect(state.interactionMode).toBe('select');
    });
  });

  describe('moveNodes action', () => {
    it('moves nodes without pushing history', () => {
      const nodes = [makeNode('n1', 0, 0)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.moveNodes(['n1' as NodeId], 10, 20);

      expect(state.graph.nodes.get('n1' as NodeId)?.position).toEqual({ x: 10, y: 20 });
      expect(state.history.length).toBe(historyLength); // No history push
    });
  });

  describe('resizeNode action', () => {
    it('resizes node and pushes history', () => {
      const nodes = [makeNode('n1', 0, 0)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.resizeNode('n1' as NodeId, 200, 150);

      expect(state.graph.nodes.get('n1' as NodeId)?.size).toEqual({ width: 200, height: 150 });
      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('updateNodeLabel action', () => {
    it('updates node label and pushes history', () => {
      const nodes = [makeNode('n1')];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      const historyLength = state.history.length;
      actions.updateNodeLabel('n1' as NodeId, 'New Label');

      expect(state.graph.nodes.get('n1' as NodeId)?.label).toBe('New Label');
      expect(state.history.length).toBe(historyLength + 1);
    });
  });

  describe('Error handling', () => {
    it('calls onError when operations fail', () => {
      const onError = vi.fn();
      const { actions } = renderWithProvider({ onError });

      // Attempt invalid operation
      actions.removeNode('nonexistent' as NodeId);

      expect(onError).toHaveBeenCalled();
    });

    it('calls onError for invalid edge source', () => {
      const onError = vi.fn();
      const { actions } = renderWithProvider({ onError });

      // Add edge with non-existent nodes
      actions.addEdge(makeEdge('e1', 'n1', 'n2'));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Layout synchronization', () => {
    it('initializes layout when first node is added', () => {
      const { state, actions } = renderWithProvider();

      expect(state.layout).toBeNull();

      actions.addNode(makeNode('n1', 100, 200));

      expect(state.layout).not.toBeNull();
      expect(state.layout?.nodePositions.size).toBe(1);
      expect(state.layout?.nodePositions.get('n1' as NodeId)).toEqual({ x: 100, y: 200 });
    });

    it('updates layout when nodes are moved', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 100, 100)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n3', 200, 200));

      const initialPos = state.layout?.nodePositions.get('n1' as NodeId);
      expect(initialPos).toEqual({ x: 0, y: 0 });

      actions.moveNodes(['n1' as NodeId], 50, 50);

      const updatedPos = state.layout?.nodePositions.get('n1' as NodeId);
      expect(updatedPos).toEqual({ x: 50, y: 50 });
    });

    it('updates layout when nodes are removed', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 100, 100)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n3', 200, 200));

      expect(state.layout?.nodePositions.size).toBe(3);

      actions.removeNode('n1' as NodeId);

      expect(state.layout?.nodePositions.size).toBe(2);
      expect(state.layout?.nodePositions.has('n1' as NodeId)).toBe(false);
    });

    it('updates layout and edge paths when edge is added', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 100, 100)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n3', 200, 200));

      expect(state.layout?.edgePaths.size).toBe(0);

      actions.addEdge(makeEdge('e1', 'n1', 'n2'));

      expect(state.layout?.edgePaths.size).toBe(1);
      const edgePath = state.layout?.edgePaths.get('e1' as EdgeId);
      expect(edgePath).toBeDefined();
      expect(edgePath?.d).toContain('M'); // SVG path should start with M (move)
      expect(edgePath?.d).toContain('L'); // SVG path should contain L (line)
    });

    it('updates edge paths when connected nodes are moved', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 100, 100)];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n3', 200, 200));

      const initialEdgePath = state.layout?.edgePaths.get('e1' as EdgeId);
      expect(initialEdgePath).toBeDefined();

      actions.moveNodes(['n1' as NodeId], 50, 50);

      const updatedEdgePath = state.layout?.edgePaths.get('e1' as EdgeId);
      expect(updatedEdgePath).toBeDefined();
      expect(updatedEdgePath?.d).not.toBe(initialEdgePath?.d); // Path should change
    });

    it('removes edge paths when edge is removed', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 100, 100)];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      const initialGraph = buildGraph(nodes, edges);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n3', 200, 200));

      expect(state.layout?.edgePaths.size).toBe(1);

      actions.removeEdge('e1' as EdgeId);

      expect(state.layout?.edgePaths.size).toBe(0);
    });

    it('syncs layout on paste', () => {
      const nodes = [makeNode('n1', 0, 0)];
      const initialGraph = buildGraph(nodes);
      const { state, actions } = renderWithProvider({ initialGraph });

      // Initialize layout
      actions.addNode(makeNode('n2', 100, 100));

      actions.selectNode('n1' as NodeId);
      actions.copy();

      const initialLayoutSize = state.layout?.nodePositions.size;

      actions.paste({ dx: 50, dy: 50 });

      expect(state.layout?.nodePositions.size).toBeGreaterThan(initialLayoutSize!);
    });

    it('syncs layout on undo/redo', () => {
      const { state, actions } = renderWithProvider();

      actions.addNode(makeNode('n1', 0, 0));

      const layoutAfterAdd = state.layout;
      expect(layoutAfterAdd?.nodePositions.size).toBe(1);

      actions.addNode(makeNode('n2', 100, 100));
      expect(state.layout?.nodePositions.size).toBe(2);

      actions.undo();
      expect(state.layout?.nodePositions.size).toBe(1);

      actions.redo();
      expect(state.layout?.nodePositions.size).toBe(2);
    });

    it('updates bounds when layout changes', () => {
      const { state, actions } = renderWithProvider();

      actions.addNode(makeNode('n1', 0, 0));

      const initialBounds = state.layout?.bounds;
      expect(initialBounds).toBeDefined();
      expect(initialBounds?.width).toBeGreaterThan(0);
      expect(initialBounds?.height).toBeGreaterThan(0);

      actions.addNode(makeNode('n2', 500, 500));

      const updatedBounds = state.layout?.bounds;
      expect(updatedBounds?.width).toBeGreaterThan(initialBounds!.width);
      expect(updatedBounds?.height).toBeGreaterThan(initialBounds!.height);
    });
  });
});
