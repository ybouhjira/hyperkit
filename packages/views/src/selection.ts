/** Selection mode */
export type SelectionMode = 'single' | 'multi';

/** Selection state */
export interface SelectionState<T = string> {
  /** Currently selected item IDs */
  readonly selected: ReadonlySet<T>;
  /** Selection mode */
  readonly mode: SelectionMode;
}

/** Selection callbacks */
export interface SelectionCallbacks<T = string> {
  /** Called when selection changes */
  readonly onSelect?: (id: T, selected: boolean) => void;
  /** Called when all items are selected/deselected */
  readonly onSelectAll?: (ids: readonly T[], selected: boolean) => void;
}

/** Create initial selection state */
export const createSelectionState = <T = string>(
  mode: SelectionMode = 'multi',
  initial?: ReadonlySet<T>,
): SelectionState<T> => ({
  selected: initial ?? new Set(),
  mode,
});

/** Check if an item is selected */
export const isSelected = <T>(state: SelectionState<T>, id: T): boolean => {
  return state.selected.has(id);
};

/** Toggle selection of an item. Returns new state. */
export const toggleSelection = <T>(
  state: SelectionState<T>,
  id: T,
): SelectionState<T> => {
  const next = new Set(state.selected);
  if (next.has(id)) {
    next.delete(id);
  } else {
    if (state.mode === 'single') {
      next.clear();
    }
    next.add(id);
  }
  return { ...state, selected: next };
};

/** Select all items */
export const selectAll = <T>(
  state: SelectionState<T>,
  ids: readonly T[],
): SelectionState<T> => ({
  ...state,
  selected: new Set(ids),
});

/** Deselect all items */
export const clearSelection = <T>(
  state: SelectionState<T>,
): SelectionState<T> => ({
  ...state,
  selected: new Set(),
});

/** Get count of selected items */
export const selectionCount = <T>(state: SelectionState<T>): number => {
  return state.selected.size;
};

/** Get selected items as an array */
export const selectedItems = <T>(state: SelectionState<T>): readonly T[] => {
  return [...state.selected];
};

/** CSS class for a selectable item */
export const selectionClass = <T>(state: SelectionState<T>, id: T): string => {
  const classes = ['sk-selectable'];
  if (isSelected(state, id)) {
    classes.push('sk-selectable--selected');
  }
  return classes.join(' ');
};
