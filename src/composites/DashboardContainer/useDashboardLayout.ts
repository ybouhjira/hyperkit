import { createStore, produce } from 'solid-js/store';
import { createEffect, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';
import type { DashboardCardConfig, CardLayout } from './types';

// ── Storage helpers ────────────────────────────────────────────────────────

function loadFromStorage(storageKey: string): CardLayout[] | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as CardLayout[];
    }
  } catch {
    // Failed to load dashboard layout from storage
  }
  return null;
}

function saveToStorage(storageKey: string, layout: CardLayout[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // Failed to save dashboard layout to storage
  }
}

// ── Auto-placement ─────────────────────────────────────────────────────────

/**
 * Simple bin-packing: place cards left-to-right, top-to-bottom,
 * skipping cells already occupied by previously placed cards.
 */
export function autoPlace(configs: DashboardCardConfig[], columns: number): CardLayout[] {
  // occupancy[row][col] = true if cell is taken
  const occupied: Map<string, boolean> = new Map();

  const key = (row: number, col: number) => `${row}:${col}`;

  const markOccupied = (col: number, row: number, cols: number, rows: number) => {
    for (let r = row; r < row + rows; r++) {
      for (let c = col; c < col + cols; c++) {
        occupied.set(key(r, c), true);
      }
    }
  };

  const fits = (col: number, row: number, cols: number, rows: number): boolean => {
    if (col + cols > columns) return false;
    for (let r = row; r < row + rows; r++) {
      for (let c = col; c < col + cols; c++) {
        if (occupied.get(key(r, c))) return false;
      }
    }
    return true;
  };

  const layouts: CardLayout[] = [];

  for (const config of configs) {
    const cols = config.defaultSize?.cols ?? Math.min(4, columns);
    const rows = config.defaultSize?.rows ?? 2;

    // Scan rows then cols to find first fitting position
    let placed = false;
    for (let row = 0; row < 1000 && !placed; row++) {
      for (let col = 0; col <= columns - cols && !placed; col++) {
        if (fits(col, row, cols, rows)) {
          layouts.push({ id: config.id, col, row, cols, rows });
          markOccupied(col, row, cols, rows);
          placed = true;
        }
      }
    }

    if (!placed) {
      // Fallback: stack at row 0 (shouldn't happen in practice)
      layouts.push({ id: config.id, col: 0, row: 0, cols, rows });
    }
  }

  return layouts;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export interface DashboardLayoutActions {
  moveCard: (id: string, col: number, row: number) => void;
  resizeCard: (id: string, cols: number, rows: number) => void;
  addCard: (config: DashboardCardConfig, columns: number) => void;
  removeCard: (id: string) => void;
  resetLayout: (configs: DashboardCardConfig[], columns: number) => void;
}

export function useDashboardLayout(
  initialConfigs: DashboardCardConfig[],
  columns: Accessor<number>,
  storageKey?: string,
  onLayoutChange?: (layout: CardLayout[]) => void
): {
  layout: CardLayout[];
  actions: DashboardLayoutActions;
} {
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const stored = storageKey ? loadFromStorage(storageKey) : null;
  const initial = stored ?? autoPlace(initialConfigs, columns());

  const [layout, setLayout] = createStore<CardLayout[]>(initial);

  // Debounced persistence
  createEffect(() => {
    if (!storageKey) return;

    // Access each item to track reactivity
    const snapshot = layout.map((l) => ({ ...l }));

    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveToStorage(storageKey, snapshot);
      saveTimeout = null;
    }, 300);
  });

  onCleanup(() => {
    if (saveTimeout !== null) clearTimeout(saveTimeout);
  });

  // Notify on layout change
  createEffect(() => {
    if (!onLayoutChange) return;
    const snapshot = layout.map((l) => ({ ...l }));
    onLayoutChange(snapshot);
  });

  const actions: DashboardLayoutActions = {
    moveCard(id, col, row) {
      setLayout(
        (item) => item.id === id,
        produce((item) => {
          item.col = col;
          item.row = row;
        })
      );
    },

    resizeCard(id, cols, rows) {
      const config = initialConfigs.find((c) => c.id === id);
      const minCols = config?.minSize?.cols ?? 1;
      const minRows = config?.minSize?.rows ?? 1;
      const maxCols = config?.maxSize?.cols ?? columns();
      const maxRows = config?.maxSize?.rows ?? 100;

      const clampedCols = Math.max(minCols, Math.min(maxCols, cols));
      const clampedRows = Math.max(minRows, Math.min(maxRows, rows));

      setLayout(
        (item) => item.id === id,
        produce((item) => {
          item.cols = clampedCols;
          item.rows = clampedRows;
        })
      );
    },

    addCard(config, cols) {
      // Don't add if already exists
      if (layout.some((l) => l.id === config.id)) return;

      const newLayouts = autoPlace([config], cols);
      const newLayout = newLayouts[0];
      if (!newLayout) return;

      // Find a non-conflicting position: append below the lowest row
      const maxRow = layout.reduce((max, l) => Math.max(max, l.row + l.rows), 0);
      setLayout([
        ...layout,
        {
          id: config.id,
          col: 0,
          row: maxRow,
          cols: newLayout.cols,
          rows: newLayout.rows,
        },
      ]);
    },

    removeCard(id) {
      setLayout((prev) => prev.filter((l) => l.id !== id));
    },

    resetLayout(configs, cols) {
      setLayout(autoPlace(configs, cols));
    },
  };

  return { layout, actions };
}
