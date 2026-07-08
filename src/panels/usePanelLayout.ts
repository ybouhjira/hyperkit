import { createStore } from 'solid-js/store';
import { createEffect, Accessor } from 'solid-js';
import type {
  PanelConfig,
  PanelState,
  PanelLayoutState,
  PanelLayoutActions,
  PanelPosition,
  PanelMode,
} from './types';
import { loadFromStorage, saveToStorage } from './usePanelPersistence';
import { initializeState, mergeStoredState } from './defaultPanelLayout';

let saveTimeout: number | null = null;

export function usePanelLayout(
  configs: PanelConfig[],
  storageKey?: string,
  initialOverrides?: Partial<PanelLayoutState>
): {
  layout: Accessor<PanelLayoutState>;
  actions: PanelLayoutActions;
  getPanelsForPosition: (position: PanelPosition) => { config: PanelConfig; state: PanelState }[];
  getHiddenPanels: () => PanelConfig[];
  getFloatingPanels: () => { config: PanelConfig; state: PanelState }[];
  getDrawerPanels: () => { config: PanelConfig; state: PanelState }[];
  getPipPanels: () => { config: PanelConfig; state: PanelState }[];
} {
  const rawStoredState = storageKey ? loadFromStorage(storageKey) : null;

  let initialState: PanelLayoutState;
  if (rawStoredState) {
    initialState = mergeStoredState(rawStoredState, configs);
  } else {
    initialState = initializeState(configs);
  }

  // Merge any initial overrides (used by Storybook stories to preset collapsed states etc.)
  if (initialOverrides) {
    if (initialOverrides.panels) {
      for (const [id, overrideState] of Object.entries(initialOverrides.panels)) {
        if (initialState.panels[id]) {
          initialState.panels[id] = { ...initialState.panels[id], ...overrideState };
        }
      }
    }
    if (initialOverrides.areaSizes) {
      initialState.areaSizes = { ...initialState.areaSizes, ...initialOverrides.areaSizes };
    }
    if (initialOverrides.activeTabId !== undefined) {
      initialState.activeTabId = initialOverrides.activeTabId;
    }
    if (initialOverrides.maximizedPanelId !== undefined) {
      initialState.maximizedPanelId = initialOverrides.maximizedPanelId;
    }
  }

  // Pre-compute min sizes per position — avoids O(N) filter/reduce per resize frame
  const minSizeByPosition: Record<PanelPosition, number> = {
    left: 100,
    right: 100,
    bottom: 100,
    center: 100,
  };
  for (const config of configs) {
    const pos = config.defaultPosition;
    const min = config.minSize ?? 100;
    if (min > minSizeByPosition[pos]) {
      minSizeByPosition[pos] = min;
    }
  }

  const [layout, setLayout] = createStore<PanelLayoutState>(initialState);

  // Debounced save to localStorage
  createEffect(() => {
    if (!storageKey) return;

    const currentLayout = {
      panels: { ...layout.panels },
      areaSizes: { ...layout.areaSizes },
      activeTabId: layout.activeTabId,
      maximizedPanelId: layout.maximizedPanelId,
    };

    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = window.setTimeout(() => {
      saveToStorage(storageKey, currentLayout);
      saveTimeout = null;
    }, 300);
  });

  const getConfig = (panelId: string): PanelConfig | undefined => {
    return configs.find((c) => c.id === panelId);
  };

  const clampSize = (panelId: string, size: number): number => {
    const config = getConfig(panelId);
    if (!config) return size;

    const min = config.minSize ?? 100;
    const max = config.maxSize ?? 1000;
    return Math.max(min, Math.min(max, size));
  };

  const actions: PanelLayoutActions = {
    collapse: (panelId: string) => {
      setLayout('panels', panelId, 'collapsed', true);
    },

    expand: (panelId: string) => {
      setLayout('panels', panelId, 'collapsed', false);
    },

    toggleCollapse: (panelId: string) => {
      setLayout('panels', panelId, 'collapsed', (prev) => !prev);
    },

    resize: (panelId: string, size: number) => {
      const clampedSize = clampSize(panelId, size);
      setLayout('panels', panelId, 'size', clampedSize);
    },

    resizeArea: (position: PanelPosition, size: number) => {
      const clampedSize = Math.max(minSizeByPosition[position], Math.min(10000, size));
      setLayout('areaSizes', position, clampedSize);
    },

    move: (panelId: string, toPosition: PanelPosition) => {
      const panel = layout.panels[panelId];
      if (!panel) return;

      // Get panels at destination position
      const destinationPanels = Object.values(layout.panels).filter(
        (p) => p.position === toPosition && p.id !== panelId
      );

      // Set new order to be after all existing panels
      const maxOrder = destinationPanels.reduce((max, p) => Math.max(max, p.order), -1);

      setLayout('panels', panelId, {
        position: toPosition,
        order: maxOrder + 1,
      });
    },

    show: (panelId: string) => {
      setLayout('panels', panelId, 'visible', true);
    },

    hide: (panelId: string) => {
      setLayout('panels', panelId, 'visible', false);
    },

    reset: () => {
      const newState = initializeState(configs);
      setLayout({ ...newState, maximizedPanelId: null });
    },

    setActiveTab: (panelId: string) => {
      setLayout('activeTabId', panelId);
    },

    maximize: (panelId: string) => {
      setLayout('maximizedPanelId', panelId);
    },

    restore: () => {
      setLayout('maximizedPanelId', null);
    },

    addPanel: (panelId: string, position: PanelPosition) => {
      if (layout.panels[panelId]) {
        // Panel exists but hidden — show it and move to requested position
        setLayout('panels', panelId, { visible: true, position });
      }
    },

    removePanel: (panelId: string) => {
      setLayout('panels', panelId, 'visible', false);
    },

    pin: (panelId: string) => {
      const panel = layout.panels[panelId];
      if (!panel) return;

      setLayout('panels', panelId, 'pinned', true);

      // Reorder: move pinned tabs to the front of their position group
      const panelsAtPosition = Object.values(layout.panels)
        .filter((p) => p.position === panel.position)
        .sort((a, b) => a.order - b.order);

      // Separate pinned and unpinned, maintaining their relative order
      const pinnedPanels = panelsAtPosition.filter((p) => p.id === panelId || p.pinned);
      const unpinnedPanels = panelsAtPosition.filter((p) => p.id !== panelId && !p.pinned);

      // Reassign order
      [...pinnedPanels, ...unpinnedPanels].forEach((p, idx) => {
        setLayout('panels', p.id, 'order', idx);
      });
    },

    unpin: (panelId: string) => {
      setLayout('panels', panelId, 'pinned', false);
    },

    setMode: (panelId: string, mode: PanelMode) => {
      setLayout('panels', panelId, 'mode', mode);
      // When switching to floating, set default position/size if not set
      if (mode === 'floating') {
        const panel = layout.panels[panelId];
        if (!panel?.floatingPosition) {
          setLayout('panels', panelId, 'floatingPosition', { x: 100, y: 100 });
        }
        if (!panel?.floatingSize) {
          setLayout('panels', panelId, 'floatingSize', { width: 400, height: 300 });
        }
      }
    },

    moveFloating: (panelId: string, position: { x: number; y: number }) => {
      setLayout('panels', panelId, 'floatingPosition', position);
    },

    resizeFloating: (panelId: string, size: { width: number; height: number }) => {
      setLayout('panels', panelId, 'floatingSize', size);
    },

    openDrawer: (panelId: string) => {
      setLayout('panels', panelId, 'drawerOpen', true);
    },

    closeDrawer: (panelId: string) => {
      setLayout('panels', panelId, 'drawerOpen', false);
    },

    togglePip: (panelId: string) => {
      const panel = layout.panels[panelId];
      if (!panel) return;
      setLayout('panels', panelId, 'pip', !panel.pip);
    },
  };

  const getPanelsForPosition = (
    position: PanelPosition
  ): { config: PanelConfig; state: PanelState }[] => {
    const panelStates = Object.values(layout.panels)
      .filter(
        (p) => p.position === position && p.mode !== 'floating' && p.mode !== 'drawer' && !p.pip
      )
      .sort((a, b) => a.order - b.order);

    return panelStates
      .map((state) => {
        const config = getConfig(state.id);
        if (!config) return null;
        return { config, state };
      })
      .filter((p): p is { config: PanelConfig; state: PanelState } => p !== null);
  };

  const getHiddenPanels = (): PanelConfig[] => {
    return configs.filter((c) => {
      const state = layout.panels[c.id];
      return state && !state.visible;
    });
  };

  const getFloatingPanels = (): { config: PanelConfig; state: PanelState }[] => {
    return Object.values(layout.panels)
      .filter((p) => p.mode === 'floating' && p.visible)
      .map((state) => {
        const config = getConfig(state.id);
        if (!config) return null;
        return { config, state };
      })
      .filter((p): p is { config: PanelConfig; state: PanelState } => p !== null);
  };

  const getDrawerPanels = (): { config: PanelConfig; state: PanelState }[] => {
    return Object.values(layout.panels)
      .filter((p) => p.mode === 'drawer' && p.visible)
      .map((state) => {
        const config = getConfig(state.id);
        if (!config) return null;
        return { config, state };
      })
      .filter((p): p is { config: PanelConfig; state: PanelState } => p !== null);
  };

  const getPipPanels = (): { config: PanelConfig; state: PanelState }[] => {
    return Object.values(layout.panels)
      .filter((p) => p.pip && p.visible)
      .map((state) => {
        const config = getConfig(state.id);
        if (!config) return null;
        return { config, state };
      })
      .filter((p): p is { config: PanelConfig; state: PanelState } => p !== null);
  };

  return {
    layout: () => layout,
    actions,
    getPanelsForPosition,
    getHiddenPanels,
    getFloatingPanels,
    getDrawerPanels,
    getPipPanels,
  };
}
