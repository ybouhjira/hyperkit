import { describe, it, expect } from 'vitest';
import {
  createDragState,
  startDrag,
  updateDropTarget,
  completeDrop,
  cancelDrag,
  reorderItems,
  moveBetweenGroups,
  dragItemClass,
  dropZoneClass,
  isDraggableShape,
  type DragState,
  type DraggableConfig,
} from './drag-drop';

describe('drag-drop', () => {
  describe('createDragState', () => {
    it('returns initial state with all null/false', () => {
      const state = createDragState();
      expect(state.dragging).toBeNull();
      expect(state.dropTarget).toBeNull();
      expect(state.sourceZone).toBeNull();
      expect(state.isDragging).toBe(false);
    });

    it('works with generic types', () => {
      const state = createDragState<number>();
      expect(state.dragging).toBeNull();
      expect(state.dropTarget).toBeNull();
      expect(state.sourceZone).toBeNull();
      expect(state.isDragging).toBe(false);
    });
  });

  describe('startDrag', () => {
    it('sets dragging, sourceZone, isDragging', () => {
      const state = createDragState<string>();
      const result = startDrag(state, 'item-1', 'zone-a');
      expect(result.dragging).toBe('item-1');
      expect(result.sourceZone).toBe('zone-a');
      expect(result.isDragging).toBe(true);
      expect(result.dropTarget).toBeNull();
    });

    it('works with numeric types', () => {
      const state = createDragState<number>();
      const result = startDrag(state, 42, 1);
      expect(result.dragging).toBe(42);
      expect(result.sourceZone).toBe(1);
      expect(result.isDragging).toBe(true);
    });
  });

  describe('updateDropTarget', () => {
    it('updates dropTarget while preserving rest', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const updated = updateDropTarget(initial, 'zone-b');
      expect(updated.dropTarget).toBe('zone-b');
      expect(updated.dragging).toBe('item-1');
      expect(updated.sourceZone).toBe('zone-a');
      expect(updated.isDragging).toBe(true);
    });

    it('can set dropTarget to null', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const withTarget = updateDropTarget(initial, 'zone-b');
      const cleared = updateDropTarget(withTarget, null);
      expect(cleared.dropTarget).toBeNull();
      expect(cleared.dragging).toBe('item-1');
    });
  });

  describe('completeDrop', () => {
    it('returns result when over target, resets state', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const withTarget = updateDropTarget(initial, 'zone-b');
      const { state, result } = completeDrop(withTarget);

      expect(result).not.toBeNull();
      expect(result?.item).toBe('item-1');
      expect(result?.from).toBe('zone-a');
      expect(result?.to).toBe('zone-b');
      expect(result?.index).toBe(0);

      expect(state.dragging).toBeNull();
      expect(state.dropTarget).toBeNull();
      expect(state.sourceZone).toBeNull();
      expect(state.isDragging).toBe(false);
    });

    it('returns null result when not over target', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const { state, result } = completeDrop(initial);

      expect(result).toBeNull();
      expect(state.dragging).toBeNull();
      expect(state.isDragging).toBe(false);
    });

    it('returns null result when not dragging', () => {
      const notDragging = createDragState<string>();
      const { state, result } = completeDrop(notDragging);

      expect(result).toBeNull();
      expect(state.isDragging).toBe(false);
    });

    it('returns null result when dragging is null', () => {
      const state: DragState<string> = {
        dragging: null,
        dropTarget: 'zone-b',
        sourceZone: 'zone-a',
        isDragging: false,
      };
      const { result } = completeDrop(state);
      expect(result).toBeNull();
    });

    it('returns null result when sourceZone is null', () => {
      const state: DragState<string> = {
        dragging: 'item-1',
        dropTarget: 'zone-b',
        sourceZone: null,
        isDragging: true,
      };
      const { result } = completeDrop(state);
      expect(result).toBeNull();
    });
  });

  describe('cancelDrag', () => {
    it('returns initial state', () => {
      const state = cancelDrag<string>();
      expect(state.dragging).toBeNull();
      expect(state.dropTarget).toBeNull();
      expect(state.sourceZone).toBeNull();
      expect(state.isDragging).toBe(false);
    });
  });

  describe('reorderItems', () => {
    it('moves item from one index to another', () => {
      const items = ['a', 'b', 'c', 'd'];
      const result = reorderItems(items, 0, 2);
      expect(result).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves item backward', () => {
      const items = ['a', 'b', 'c', 'd'];
      const result = reorderItems(items, 3, 1);
      expect(result).toEqual(['a', 'd', 'b', 'c']);
    });

    it('no-op when same index', () => {
      const items = ['a', 'b', 'c'];
      const result = reorderItems(items, 1, 1);
      expect(result).toEqual(['a', 'b', 'c']);
      expect(result).toBe(items);
    });

    it('no-op when fromIndex out of bounds (negative)', () => {
      const items = ['a', 'b', 'c'];
      const result = reorderItems(items, -1, 1);
      expect(result).toEqual(['a', 'b', 'c']);
      expect(result).toBe(items);
    });

    it('no-op when fromIndex out of bounds (>= length)', () => {
      const items = ['a', 'b', 'c'];
      const result = reorderItems(items, 5, 1);
      expect(result).toEqual(['a', 'b', 'c']);
      expect(result).toBe(items);
    });

    it('no-op when toIndex out of bounds (negative)', () => {
      const items = ['a', 'b', 'c'];
      const result = reorderItems(items, 1, -1);
      expect(result).toEqual(['a', 'b', 'c']);
      expect(result).toBe(items);
    });

    it('no-op when toIndex out of bounds (>= length)', () => {
      const items = ['a', 'b', 'c'];
      const result = reorderItems(items, 1, 5);
      expect(result).toEqual(['a', 'b', 'c']);
      expect(result).toBe(items);
    });

    it('works with numeric arrays', () => {
      const items = [1, 2, 3, 4];
      const result = reorderItems(items, 0, 3);
      expect(result).toEqual([2, 3, 4, 1]);
    });
  });

  describe('moveBetweenGroups', () => {
    it('moves item between arrays correctly', () => {
      const source = ['a', 'b', 'c'];
      const target = ['x', 'y'];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, 1, 1);
      expect(newSource).toEqual(['a', 'c']);
      expect(newTarget).toEqual(['x', 'b', 'y']);
    });

    it('handles moving to end of target', () => {
      const source = ['a', 'b'];
      const target = ['x'];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, 0, 5);
      expect(newSource).toEqual(['b']);
      expect(newTarget).toEqual(['x', 'a']);
    });

    it('handles moving to start of target', () => {
      const source = ['a', 'b'];
      const target = ['x', 'y'];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, 1, 0);
      expect(newSource).toEqual(['a']);
      expect(newTarget).toEqual(['b', 'x', 'y']);
    });

    it('returns unchanged arrays when fromIndex out of bounds (negative)', () => {
      const source = ['a', 'b'];
      const target = ['x'];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, -1, 0);
      expect(newSource).toEqual(['a', 'b']);
      expect(newTarget).toEqual(['x']);
      expect(newSource).toBe(source);
      expect(newTarget).toBe(target);
    });

    it('returns unchanged arrays when fromIndex out of bounds (>= length)', () => {
      const source = ['a', 'b'];
      const target = ['x'];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, 5, 0);
      expect(newSource).toEqual(['a', 'b']);
      expect(newTarget).toEqual(['x']);
      expect(newSource).toBe(source);
      expect(newTarget).toBe(target);
    });

    it('handles empty target array', () => {
      const source = ['a', 'b'];
      const target: string[] = [];
      const { source: newSource, target: newTarget } = moveBetweenGroups(source, target, 0, 0);
      expect(newSource).toEqual(['b']);
      expect(newTarget).toEqual(['a']);
    });
  });

  describe('dragItemClass', () => {
    it('returns "sk-draggable" normally', () => {
      const state = createDragState<string>();
      const className = dragItemClass(state, 'item-1');
      expect(className).toBe('sk-draggable');
    });

    it('adds "--dragging" when active', () => {
      const state = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const className = dragItemClass(state, 'item-1');
      expect(className).toBe('sk-draggable sk-draggable--dragging');
    });

    it('does not add "--dragging" for different item', () => {
      const state = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const className = dragItemClass(state, 'item-2');
      expect(className).toBe('sk-draggable');
    });
  });

  describe('dropZoneClass', () => {
    it('returns "sk-drop-zone" when not dragging', () => {
      const state = createDragState<string>();
      const className = dropZoneClass(state, 'zone-a');
      expect(className).toBe('sk-drop-zone');
    });

    it('adds "--active" when dragging', () => {
      const state = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const className = dropZoneClass(state, 'zone-b');
      expect(className).toBe('sk-drop-zone sk-drop-zone--active');
    });

    it('adds "--over" when zone is drop target', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const withTarget = updateDropTarget(initial, 'zone-b');
      const className = dropZoneClass(withTarget, 'zone-b');
      expect(className).toBe('sk-drop-zone sk-drop-zone--active sk-drop-zone--over');
    });

    it('does not add "--over" for different zone', () => {
      const initial = startDrag(createDragState<string>(), 'item-1', 'zone-a');
      const withTarget = updateDropTarget(initial, 'zone-b');
      const className = dropZoneClass(withTarget, 'zone-c');
      expect(className).toBe('sk-drop-zone sk-drop-zone--active');
    });
  });

  describe('isDraggableShape', () => {
    it('board returns config.board value', () => {
      const config1: DraggableConfig = { board: true };
      expect(isDraggableShape('board', config1)).toBe(true);

      const config2: DraggableConfig = { board: false };
      expect(isDraggableShape('board', config2)).toBe(false);

      const config3: DraggableConfig = {};
      expect(isDraggableShape('board', config3)).toBe(false);
    });

    it('row returns config.row value', () => {
      const config1: DraggableConfig = { row: true };
      expect(isDraggableShape('row', config1)).toBe(true);

      const config2: DraggableConfig = { row: false };
      expect(isDraggableShape('row', config2)).toBe(false);

      const config3: DraggableConfig = {};
      expect(isDraggableShape('row', config3)).toBe(false);
    });

    it('other shapes return false', () => {
      const config: DraggableConfig = { board: true, row: true };
      expect(isDraggableShape('card', config)).toBe(false);
      expect(isDraggableShape('table', config)).toBe(false);
      expect(isDraggableShape('detail', config)).toBe(false);
    });
  });
});
