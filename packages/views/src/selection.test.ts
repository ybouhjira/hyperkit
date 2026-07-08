import { describe, it, expect } from 'vitest';
import {
  createSelectionState,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection,
  selectionCount,
  selectedItems,
  selectionClass,
} from './selection';

describe('createSelectionState', () => {
  it('creates with defaults', () => {
    const state = createSelectionState();
    expect(state.mode).toBe('multi');
    expect(state.selected.size).toBe(0);
  });

  it('creates with initial set', () => {
    const initial = new Set(['a', 'b']);
    const state = createSelectionState('multi', initial);
    expect(state.selected).toBe(initial);
    expect(state.selected.size).toBe(2);
  });

  it('creates single mode', () => {
    const state = createSelectionState('single');
    expect(state.mode).toBe('single');
    expect(state.selected.size).toBe(0);
  });
});

describe('isSelected', () => {
  it('returns true for selected', () => {
    const state = createSelectionState('multi', new Set(['a']));
    expect(isSelected(state, 'a')).toBe(true);
  });

  it('returns false for unselected', () => {
    const state = createSelectionState('multi', new Set(['a']));
    expect(isSelected(state, 'b')).toBe(false);
  });
});

describe('toggleSelection', () => {
  it('selects unselected', () => {
    const state = createSelectionState('multi');
    const next = toggleSelection(state, 'a');
    expect(next.selected.has('a')).toBe(true);
  });

  it('deselects selected', () => {
    const state = createSelectionState('multi', new Set(['a']));
    const next = toggleSelection(state, 'a');
    expect(next.selected.has('a')).toBe(false);
  });
});

describe('toggleSelection in single mode', () => {
  it('clears previous selection when adding new', () => {
    const state = createSelectionState('single', new Set(['a']));
    const next = toggleSelection(state, 'b');
    expect(next.selected.has('a')).toBe(false);
    expect(next.selected.has('b')).toBe(true);
    expect(next.selected.size).toBe(1);
  });
});

describe('selectAll', () => {
  it('selects all provided IDs', () => {
    const state = createSelectionState('multi');
    const next = selectAll(state, ['a', 'b', 'c']);
    expect(next.selected.size).toBe(3);
    expect(next.selected.has('a')).toBe(true);
    expect(next.selected.has('b')).toBe(true);
    expect(next.selected.has('c')).toBe(true);
  });
});

describe('clearSelection', () => {
  it('removes all selections', () => {
    const state = createSelectionState('multi', new Set(['a', 'b']));
    const next = clearSelection(state);
    expect(next.selected.size).toBe(0);
  });
});

describe('selectionCount', () => {
  it('returns correct count', () => {
    const state = createSelectionState('multi', new Set(['a', 'b', 'c']));
    expect(selectionCount(state)).toBe(3);
  });
});

describe('selectedItems', () => {
  it('returns array of selected IDs', () => {
    const state = createSelectionState('multi', new Set(['a', 'b', 'c']));
    const items = selectedItems(state);
    expect(items).toHaveLength(3);
    expect(items).toContain('a');
    expect(items).toContain('b');
    expect(items).toContain('c');
  });
});

describe('selectionClass', () => {
  it('returns sk-selectable for unselected', () => {
    const state = createSelectionState('multi');
    expect(selectionClass(state, 'a')).toBe('sk-selectable');
  });

  it('returns sk-selectable sk-selectable--selected for selected', () => {
    const state = createSelectionState('multi', new Set(['a']));
    expect(selectionClass(state, 'a')).toBe('sk-selectable sk-selectable--selected');
  });
});
