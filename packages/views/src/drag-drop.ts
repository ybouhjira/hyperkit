/**
 * Drag-and-drop state management and utilities for board and row shapes.
 * @module drag-drop
 */

/** Which shapes support drag-and-drop */
export interface DraggableConfig {
  /** Enable drag on board shape (cards between columns) */
  readonly board?: boolean;
  /** Enable drag on row shape (reorder list items) */
  readonly row?: boolean;
}

/** Drag state */
export interface DragState<T = string> {
  /** The item currently being dragged (null if not dragging) */
  readonly dragging: T | null;
  /** The current drop target zone (null if not over a valid target) */
  readonly dropTarget: T | null;
  /** The source zone/position the item was dragged from */
  readonly sourceZone: T | null;
  /** Whether a drag operation is active */
  readonly isDragging: boolean;
}

/** Drop result for reorder operations */
export interface DropResult<T = string> {
  /** The item that was dragged */
  readonly item: T;
  /** Source position/zone */
  readonly from: T;
  /** Target position/zone */
  readonly to: T;
  /** New index within the target zone */
  readonly index: number;
}

/** Drag-and-drop callbacks */
export interface DragDropCallbacks<T = string> {
  /** Called when drag starts */
  readonly onDragStart?: (item: T) => void;
  /** Called while dragging over a target */
  readonly onDragOver?: (item: T, target: T) => void;
  /** Called when item is dropped */
  readonly onDrop?: (result: DropResult<T>) => void;
  /** Called when drag is cancelled */
  readonly onDragCancel?: () => void;
  /** Called with the new item order after reorder */
  readonly onReorder?: (items: readonly T[]) => void;
}

/** Create initial drag state */
export const createDragState = <T = string>(): DragState<T> => ({
  dragging: null,
  dropTarget: null,
  sourceZone: null,
  isDragging: false,
});

/** Start dragging an item */
export const startDrag = <T>(
  state: DragState<T>,
  item: T,
  sourceZone: T,
): DragState<T> => ({
  dragging: item,
  dropTarget: null,
  sourceZone,
  isDragging: true,
});

/** Update drop target while dragging */
export const updateDropTarget = <T>(
  state: DragState<T>,
  target: T | null,
): DragState<T> => ({
  ...state,
  dropTarget: target,
});

/** Complete a drop operation */
export const completeDrop = <T>(
  state: DragState<T>,
): { state: DragState<T>; result: DropResult<T> | null } => {
  if (!state.isDragging || state.dragging === null || state.sourceZone === null) {
    return { state: createDragState<T>(), result: null };
  }

  const result: DropResult<T> | null = state.dropTarget !== null
    ? {
        item: state.dragging,
        from: state.sourceZone,
        to: state.dropTarget,
        index: 0, // caller typically resolves this from DOM position
      }
    : null;

  return { state: createDragState<T>(), result };
};

/** Cancel the current drag */
export const cancelDrag = <T>(): DragState<T> => createDragState<T>();

/** Reorder items by moving an item from one index to another */
export const reorderItems = <T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): readonly T[] => {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || fromIndex >= items.length) return items;
  if (toIndex < 0 || toIndex >= items.length) return items;

  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved!);
  return result;
};

/** Move an item between groups (e.g., board columns) */
export const moveBetweenGroups = <T>(
  sourceItems: readonly T[],
  targetItems: readonly T[],
  fromIndex: number,
  toIndex: number,
): { source: readonly T[]; target: readonly T[] } => {
  if (fromIndex < 0 || fromIndex >= sourceItems.length) {
    return { source: sourceItems, target: targetItems };
  }

  const source = [...sourceItems];
  const target = [...targetItems];
  const [moved] = source.splice(fromIndex, 1);
  target.splice(Math.min(toIndex, target.length), 0, moved!);
  return { source, target };
};

/** Get CSS class for a draggable item */
export const dragItemClass = <T>(state: DragState<T>, item: T): string => {
  const classes = ['sk-draggable'];
  if (state.isDragging && state.dragging === item) {
    classes.push('sk-draggable--dragging');
  }
  return classes.join(' ');
};

/** Get CSS class for a drop zone */
export const dropZoneClass = <T>(state: DragState<T>, zone: T): string => {
  const classes = ['sk-drop-zone'];
  if (state.isDragging) {
    classes.push('sk-drop-zone--active');
  }
  if (state.dropTarget === zone) {
    classes.push('sk-drop-zone--over');
  }
  return classes.join(' ');
};

/** Check if a shape supports dragging based on config */
export const isDraggableShape = (
  shape: string,
  config: DraggableConfig,
): boolean => {
  if (shape === 'board') return config.board === true;
  if (shape === 'row') return config.row === true;
  return false;
};
