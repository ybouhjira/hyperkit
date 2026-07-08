import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NodeId, EdgeId } from '@ybouhjira/diagram-core';
import { DiagramProvider } from '../DiagramProvider';
import {
  useDiagram,
  useLayout,
  useSelection,
  useGraphQuery,
  useEditMode,
  useHistory,
  useClipboard,
  useViewport,
  useKeyboardShortcuts,
} from '../hooks';
import { makeNode, makeEdge, buildGraph, renderWithProvider } from './test-helpers';

describe('hooks', () => {
  describe('useDiagram', () => {
    it('should return state and actions', () => {
      const { state, actions } = renderWithProvider();

      expect(state).toBeDefined();
      expect(state.graph).toBeDefined();
      expect(state.selectedNodes).toBeDefined();
      expect(actions).toBeDefined();
      expect(actions.selectNode).toBeTypeOf('function');
    });

    it('should access the same context as DiagramProvider', () => {
      const node1 = makeNode('n1', 10, 20);
      const graph = buildGraph([node1]);

      let hookState: Record<string, unknown>;
      let hookActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { state, actions } = useDiagram();
        hookState = state;
        hookActions = actions;
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(hookState.graph.nodes.size).toBe(1);
      expect(hookActions.selectNode).toBeTypeOf('function');
    });
  });

  describe('useLayout', () => {
    it('should return layout state and actions', () => {
      let layoutHook: Record<string, unknown>;

      const TestHarness = () => {
        layoutHook = useLayout();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(layoutHook.layout).toBeTypeOf('function');
      expect(layoutHook.isLayouting).toBeTypeOf('function');
      expect(layoutHook.algorithm).toBeTypeOf('function');
      expect(layoutHook.setAlgorithm).toBeTypeOf('function');
      expect(layoutHook.runLayout).toBeTypeOf('function');
    });

    it('should reflect isLayouting state', () => {
      let layoutHook: Record<string, unknown>;

      const TestHarness = () => {
        layoutHook = useLayout();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(layoutHook.isLayouting()).toBe(false);
    });
  });

  describe('useSelection', () => {
    it('should return selection state and actions', () => {
      let selectionHook: Record<string, unknown>;

      const TestHarness = () => {
        selectionHook = useSelection();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(selectionHook.selectedNodes).toBeTypeOf('function');
      expect(selectionHook.selectedEdges).toBeTypeOf('function');
      expect(selectionHook.selectNode).toBeTypeOf('function');
      expect(selectionHook.selectEdge).toBeTypeOf('function');
      expect(selectionHook.deselectAll).toBeTypeOf('function');
      expect(selectionHook.isNodeSelected).toBeTypeOf('function');
      expect(selectionHook.isEdgeSelected).toBeTypeOf('function');
    });

    it('should correctly identify selected nodes', () => {
      const node1 = makeNode('n1');
      const graph = buildGraph([node1]);

      let selectionHook: Record<string, unknown>;

      const TestHarness = () => {
        selectionHook = useSelection();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(selectionHook.isNodeSelected('n1' as NodeId)).toBe(false);

      selectionHook.selectNode('n1' as NodeId, false);

      expect(selectionHook.isNodeSelected('n1' as NodeId)).toBe(true);
    });

    it('should correctly identify selected edges', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const edge1 = makeEdge('e1', 'n1', 'n2');
      const graph = buildGraph([node1, node2], [edge1]);

      let selectionHook: Record<string, unknown>;

      const TestHarness = () => {
        selectionHook = useSelection();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(selectionHook.isEdgeSelected('e1' as EdgeId)).toBe(false);

      selectionHook.selectEdge('e1' as EdgeId, false);

      expect(selectionHook.isEdgeSelected('e1' as EdgeId)).toBe(true);
    });
  });

  describe('useGraphQuery', () => {
    it('should return graph query functions', () => {
      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(queryHook.nodeCount).toBeTypeOf('function');
      expect(queryHook.edgeCount).toBeTypeOf('function');
      expect(queryHook.getNode).toBeTypeOf('function');
      expect(queryHook.getEdge).toBeTypeOf('function');
      expect(queryHook.allNodes).toBeTypeOf('function');
      expect(queryHook.allEdges).toBeTypeOf('function');
    });

    it('should return correct node count', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const graph = buildGraph([node1, node2]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(queryHook.nodeCount()).toBe(2);
    });

    it('should return correct edge count', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const edge1 = makeEdge('e1', 'n1', 'n2');
      const graph = buildGraph([node1, node2], [edge1]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(queryHook.edgeCount()).toBe(1);
    });

    it('should get node by id', () => {
      const node1 = makeNode('n1', 10, 20);
      const graph = buildGraph([node1]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      const foundNode = queryHook.getNode('n1' as NodeId);
      expect(foundNode).toBeDefined();
      expect(foundNode?.id).toBe('n1');
      expect(foundNode?.position.x).toBe(10);
    });

    it('should get edge by id', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const edge1 = makeEdge('e1', 'n1', 'n2');
      const graph = buildGraph([node1, node2], [edge1]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      const foundEdge = queryHook.getEdge('e1' as EdgeId);
      expect(foundEdge).toBeDefined();
      expect(foundEdge?.source).toBe('n1');
      expect(foundEdge?.target).toBe('n2');
    });

    it('should return all nodes', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const graph = buildGraph([node1, node2]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      const allNodes = queryHook.allNodes();
      expect(allNodes).toHaveLength(2);
      expect(allNodes.map((n: { id: string }) => n.id)).toContain('n1');
      expect(allNodes.map((n: { id: string }) => n.id)).toContain('n2');
    });

    it('should return all edges', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const edge1 = makeEdge('e1', 'n1', 'n2');
      const edge2 = makeEdge('e2', 'n2', 'n1');
      const graph = buildGraph([node1, node2], [edge1, edge2]);

      let queryHook: Record<string, unknown>;

      const TestHarness = () => {
        queryHook = useGraphQuery();
        return null;
      };

      render(() => (
        <DiagramProvider initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      const allEdges = queryHook.allEdges();
      expect(allEdges).toHaveLength(2);
      expect(allEdges.map((e: { id: string }) => e.id)).toContain('e1');
      expect(allEdges.map((e: { id: string }) => e.id)).toContain('e2');
    });
  });

  describe('useEditMode', () => {
    it('should return edit mode state and actions', () => {
      let editHook: Record<string, unknown>;

      const TestHarness = () => {
        editHook = useEditMode();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(editHook.editable).toBeTypeOf('function');
      expect(editHook.setEditable).toBeTypeOf('function');
      expect(editHook.mode).toBeTypeOf('function');
      expect(editHook.setMode).toBeTypeOf('function');
      expect(editHook.gridSnap).toBeTypeOf('function');
      expect(editHook.setGridSnap).toBeTypeOf('function');
    });

    it('should reflect editable state', () => {
      let editHook: Record<string, unknown>;

      const TestHarness = () => {
        editHook = useEditMode();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(editHook.editable()).toBe(true);
    });
  });

  describe('useHistory', () => {
    it('should return history actions and state', () => {
      let historyHook: Record<string, unknown>;

      const TestHarness = () => {
        historyHook = useHistory();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(historyHook.undo).toBeTypeOf('function');
      expect(historyHook.redo).toBeTypeOf('function');
      expect(historyHook.canUndo).toBeTypeOf('function');
      expect(historyHook.canRedo).toBeTypeOf('function');
      expect(historyHook.historySize).toBeTypeOf('function');
      expect(historyHook.currentIndex).toBeTypeOf('function');
    });

    it('should reflect initial history state', () => {
      let historyHook: Record<string, unknown>;

      const TestHarness = () => {
        historyHook = useHistory();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(historyHook.canUndo()).toBe(false);
      expect(historyHook.canRedo()).toBe(false);
      expect(historyHook.historySize()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('useClipboard', () => {
    it('should return clipboard actions', () => {
      let clipboardHook: Record<string, unknown>;

      const TestHarness = () => {
        clipboardHook = useClipboard();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(clipboardHook.copy).toBeTypeOf('function');
      expect(clipboardHook.cut).toBeTypeOf('function');
      expect(clipboardHook.paste).toBeTypeOf('function');
      expect(clipboardHook.duplicate).toBeTypeOf('function');
    });
  });

  describe('useViewport', () => {
    it('should return viewport actions', () => {
      let viewportHook: Record<string, unknown>;

      const TestHarness = () => {
        viewportHook = useViewport();
        return null;
      };

      render(() => (
        <DiagramProvider>
          <TestHarness />
        </DiagramProvider>
      ));

      expect(viewportHook.zoomIn).toBeTypeOf('function');
      expect(viewportHook.zoomOut).toBeTypeOf('function');
      expect(viewportHook.fitView).toBeTypeOf('function');
      expect(viewportHook.resetView).toBeTypeOf('function');
    });
  });

  describe('useKeyboardShortcuts', () => {
    let dispatchKey: (key: string, opts?: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) => void;

    beforeEach(() => {
      dispatchKey = (key: string, opts = {}) => {
        const event = new KeyboardEvent('keydown', {
          key,
          ctrlKey: opts.ctrlKey || false,
          shiftKey: opts.shiftKey || false,
          altKey: opts.altKey || false,
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(event);
        return event;
      };
    });

    it('should do nothing when editable is false', () => {
      const { actions } = renderWithProvider({ editable: false });
      const deleteSelectedSpy = vi.spyOn(actions, 'deleteSelected');

      const TestHarness = () => {
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={false}>
          <TestHarness />
        </DiagramProvider>
      ));

      dispatchKey('Delete');
      expect(deleteSelectedSpy).not.toHaveBeenCalled();
    });

    it('should handle Delete key', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'deleteSelected');
      dispatchKey('Delete');
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Backspace key', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'deleteSelected');
      dispatchKey('Backspace');
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+z (undo)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'undo');
      dispatchKey('z', { ctrlKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+Shift+z (redo)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'redo');
      dispatchKey('z', { ctrlKey: true, shiftKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+Shift+Z (redo alternate)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'redo');
      dispatchKey('Z', { ctrlKey: true, shiftKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+c (copy)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'copy');
      dispatchKey('c', { ctrlKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+x (cut)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'cut');
      dispatchKey('x', { ctrlKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+v (paste)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'paste');
      dispatchKey('v', { ctrlKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Ctrl+d (duplicate)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'duplicate');
      dispatchKey('d', { ctrlKey: true });
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Escape (deselect all)', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const deselectSpy = vi.spyOn(capturedActions, 'deselectAll');
      const cancelSpy = vi.spyOn(capturedActions, 'cancelDrawEdge');
      dispatchKey('Escape');
      expect(deselectSpy).toHaveBeenCalled();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should handle Ctrl+a (select all)', () => {
      const node1 = makeNode('n1');
      const node2 = makeNode('n2');
      const graph = buildGraph([node1, node2]);

      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true} initialGraph={graph}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'selectNode');
      dispatchKey('a', { ctrlKey: true });
      expect(spy).toHaveBeenCalledWith('n1', true);
      expect(spy).toHaveBeenCalledWith('n2', true);
    });

    it('should call preventDefault on matched combos', () => {
      const TestHarness = () => {
        useKeyboardShortcuts();
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const event = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should support custom shortcuts', () => {
      const customHandler = vi.fn();

      const TestHarness = () => {
        useKeyboardShortcuts({
          'Mod+k': customHandler,
        });
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      dispatchKey('k', { ctrlKey: true });
      expect(customHandler).toHaveBeenCalled();
    });

    it('should allow custom shortcuts to override defaults', () => {
      const customDelete = vi.fn();

      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts({
          'Delete': customDelete,
        });
        return null;
      };

      render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const defaultDeleteSpy = vi.spyOn(capturedActions, 'deleteSelected');
      dispatchKey('Delete');

      expect(customDelete).toHaveBeenCalled();
      expect(defaultDeleteSpy).not.toHaveBeenCalled();
    });

    it('should cleanup listener on unmount', () => {
      let capturedActions: Record<string, (...args: unknown[]) => unknown>;

      const TestHarness = () => {
        const { actions } = useDiagram();
        capturedActions = actions;
        useKeyboardShortcuts();
        return null;
      };

      const { unmount } = render(() => (
        <DiagramProvider editable={true}>
          <TestHarness />
        </DiagramProvider>
      ));

      const spy = vi.spyOn(capturedActions, 'deleteSelected');

      unmount();

      dispatchKey('Delete');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
