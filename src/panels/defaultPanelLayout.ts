import type { PanelConfig, PanelState, PanelLayoutState, PanelPosition } from './types';

export const DEFAULT_AREA_SIZES: Record<PanelPosition, number> = {
  left: 280,
  right: 320,
  bottom: 200,
  center: 0, // flex
};

export function initializeState(configs: PanelConfig[]): PanelLayoutState {
  const panels: Record<string, PanelState> = {};
  const areaSizes: Record<PanelPosition, number> = { left: 0, right: 0, bottom: 0, center: 0 };

  configs.forEach((config, index) => {
    panels[config.id] = {
      id: config.id,
      position: config.defaultPosition,
      size: config.defaultSize ?? 280,
      collapsed: false,
      visible: true,
      order: index,
      pinned: false,
      mode: 'docked' as const,
      pip: false,
      drawerOpen: false,
    };
    // Use the largest defaultSize among panels at this position for the area size
    const defaultSize = config.defaultSize ?? DEFAULT_AREA_SIZES[config.defaultPosition];
    if (defaultSize > areaSizes[config.defaultPosition]) {
      areaSizes[config.defaultPosition] = defaultSize;
    }
  });

  // Fill in defaults for any position that has no panels
  for (const pos of ['left', 'right', 'bottom', 'center'] as PanelPosition[]) {
    if (areaSizes[pos] === 0) {
      areaSizes[pos] = DEFAULT_AREA_SIZES[pos];
    }
  }

  // Default activeTabId to the first center panel
  const firstCenterConfig = configs.find((c) => c.defaultPosition === 'center');
  const activeTabId = firstCenterConfig?.id;

  return { panels, areaSizes, activeTabId, maximizedPanelId: null };
}

/**
 * Merge stored state with current configs: migrate old fields & add new panels.
 */
export function mergeStoredState(
  rawStoredState: PanelLayoutState,
  configs: PanelConfig[]
): PanelLayoutState {
  const configIds = new Set(configs.map((c) => c.id));

  // Validate that stored activeTabId still exists in configs
  const validatedActiveTabId =
    rawStoredState.activeTabId && configIds.has(rawStoredState.activeTabId)
      ? rawStoredState.activeTabId
      : configs.find((c) => c.defaultPosition === 'center')?.id;

  // Validate that stored maximizedPanelId still exists in configs
  const validatedMaximizedPanelId =
    rawStoredState.maximizedPanelId && configIds.has(rawStoredState.maximizedPanelId)
      ? rawStoredState.maximizedPanelId
      : null;

  // Migrate old stored state missing mode/pip/floating fields
  const migratedPanels: Record<string, PanelState> = {};
  for (const [id, panelState] of Object.entries(rawStoredState.panels)) {
    migratedPanels[id] = {
      ...panelState,
      mode: panelState.mode ?? 'docked',
      pip: panelState.pip ?? false,
      floatingPosition: panelState.floatingPosition ?? undefined,
      floatingSize: panelState.floatingSize ?? undefined,
      drawerOpen: panelState.drawerOpen ?? false,
    };
  }

  // Merge new panels from configs that don't exist in stored state.
  // This ensures newly added panels are visible after a layout update
  // rather than being silently dropped because they aren't in localStorage.
  for (const config of configs) {
    if (!migratedPanels[config.id]) {
      migratedPanels[config.id] = {
        id: config.id,
        position: config.defaultPosition,
        size: config.defaultSize ?? 280,
        collapsed: false,
        visible: true,
        order: Object.keys(migratedPanels).length,
        pinned: false,
        mode: 'docked' as const,
        pip: false,
        drawerOpen: false,
      };
    }
  }

  return {
    ...rawStoredState,
    panels: migratedPanels,
    activeTabId: validatedActiveTabId,
    maximizedPanelId: validatedMaximizedPanelId,
  };
}
