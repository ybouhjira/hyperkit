import { render } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePanelLayout } from './usePanelLayout';
import type { PanelConfig, PanelState } from './types';

// Helper function to create test panel config
const createTestConfig = (id: string, overrides?: Partial<PanelConfig>): PanelConfig => ({
  id,
  title: `Panel ${id}`,
  defaultPosition: 'left',
  render: () => {
    const content = `Content ${id}`;
    return <div>{content}</div>;
  },
  minSize: 100,
  maxSize: 1000,
  defaultSize: 280,
  ...overrides,
});

// Helper to render the hook in a component
const renderHook = <T,>(hook: () => T): T => {
  let result!: T;
  render(() => {
    result = hook();
    const element = <div />;
    return element;
  });
  return result;
};

describe('usePanelLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes layout from configs', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'left', defaultSize: 250 }),
      createTestConfig('panel-2', { defaultPosition: 'right', defaultSize: 300 }),
    ];

    const { layout } = renderHook(() => usePanelLayout(configs));

    expect(layout().panels['panel-1']).toEqual({
      id: 'panel-1',
      position: 'left',
      size: 250,
      collapsed: false,
      visible: true,
      order: 0,
      pinned: false,
      mode: 'docked',
      pip: false,
      drawerOpen: false,
    });

    expect(layout().panels['panel-2']).toEqual({
      id: 'panel-2',
      position: 'right',
      size: 300,
      collapsed: false,
      visible: true,
      order: 1,
      pinned: false,
      mode: 'docked',
      pip: false,
      drawerOpen: false,
    });
  });

  it('collapse sets panel collapsed to true', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.collapse('panel-1');

    expect(layout().panels['panel-1'].collapsed).toBe(true);
  });

  it('expand sets panel collapsed to false', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.collapse('panel-1');
    expect(layout().panels['panel-1'].collapsed).toBe(true);

    actions.expand('panel-1');
    expect(layout().panels['panel-1'].collapsed).toBe(false);
  });

  it('toggleCollapse toggles collapsed state', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    expect(layout().panels['panel-1'].collapsed).toBe(false);

    actions.toggleCollapse('panel-1');
    expect(layout().panels['panel-1'].collapsed).toBe(true);

    actions.toggleCollapse('panel-1');
    expect(layout().panels['panel-1'].collapsed).toBe(false);
  });

  it('resize clamps to min/max bounds', () => {
    const configs = [createTestConfig('panel-1', { minSize: 150, maxSize: 500 })];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    // Try to resize below min
    actions.resize('panel-1', 100);
    expect(layout().panels['panel-1'].size).toBe(150);

    // Try to resize above max
    actions.resize('panel-1', 600);
    expect(layout().panels['panel-1'].size).toBe(500);

    // Resize within bounds
    actions.resize('panel-1', 300);
    expect(layout().panels['panel-1'].size).toBe(300);
  });

  it('resizeArea clamps to 100-1000 range', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    // Try to resize below 100
    actions.resizeArea('left', 50);
    expect(layout().areaSizes.left).toBe(100);

    // Try to resize above 10000
    actions.resizeArea('left', 15000);
    expect(layout().areaSizes.left).toBe(10000);

    // Resize within bounds
    actions.resizeArea('left', 400);
    expect(layout().areaSizes.left).toBe(400);
  });

  it('move changes panel position and assigns correct order', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'left' }),
      createTestConfig('panel-2', { defaultPosition: 'right' }),
      createTestConfig('panel-3', { defaultPosition: 'right' }),
    ];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    // panel-2 and panel-3 are at 'right' with orders 1, 2
    expect(layout().panels['panel-2'].position).toBe('right');
    expect(layout().panels['panel-3'].position).toBe('right');

    // Move panel-1 from left to right
    actions.move('panel-1', 'right');

    expect(layout().panels['panel-1'].position).toBe('right');
    // Should be placed after panel-2 and panel-3 (order should be > 2)
    expect(layout().panels['panel-1'].order).toBe(3);
  });

  it('show sets visible to true', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.hide('panel-1');
    expect(layout().panels['panel-1'].visible).toBe(false);

    actions.show('panel-1');
    expect(layout().panels['panel-1'].visible).toBe(true);
  });

  it('hide sets visible to false', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.hide('panel-1');
    expect(layout().panels['panel-1'].visible).toBe(false);
  });

  it('reset restores initial state', () => {
    const configs = [createTestConfig('panel-1', { defaultPosition: 'left', defaultSize: 280 })];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    // Make some changes
    actions.collapse('panel-1');
    actions.resize('panel-1', 500);
    actions.move('panel-1', 'right');

    expect(layout().panels['panel-1'].collapsed).toBe(true);
    expect(layout().panels['panel-1'].size).toBe(500);
    expect(layout().panels['panel-1'].position).toBe('right');

    // Reset
    actions.reset();

    expect(layout().panels['panel-1'].collapsed).toBe(false);
    expect(layout().panels['panel-1'].size).toBe(280);
    expect(layout().panels['panel-1'].position).toBe('left');
  });

  it('getPanelsForPosition returns panels for given position sorted by order', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'left' }),
      createTestConfig('panel-2', { defaultPosition: 'right' }),
      createTestConfig('panel-3', { defaultPosition: 'left' }),
      createTestConfig('panel-4', { defaultPosition: 'right' }),
    ];
    const { getPanelsForPosition } = renderHook(() => usePanelLayout(configs));

    const leftPanels = getPanelsForPosition('left');
    expect(leftPanels.length).toBe(2);
    expect(leftPanels[0].config.id).toBe('panel-1');
    expect(leftPanels[1].config.id).toBe('panel-3');

    const rightPanels = getPanelsForPosition('right');
    expect(rightPanels.length).toBe(2);
    expect(rightPanels[0].config.id).toBe('panel-2');
    expect(rightPanels[1].config.id).toBe('panel-4');
  });

  it('getPanelsForPosition excludes panels at other positions', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'left' }),
      createTestConfig('panel-2', { defaultPosition: 'right' }),
      createTestConfig('panel-3', { defaultPosition: 'bottom' }),
    ];
    const { getPanelsForPosition } = renderHook(() => usePanelLayout(configs));

    const leftPanels = getPanelsForPosition('left');
    expect(leftPanels.length).toBe(1);
    expect(leftPanels[0].config.id).toBe('panel-1');

    const centerPanels = getPanelsForPosition('center');
    expect(centerPanels.length).toBe(0);
  });

  it('loads from localStorage when storageKey is provided', () => {
    const configs = [createTestConfig('panel-1', { defaultPosition: 'left', defaultSize: 280 })];

    // Pre-populate localStorage
    const savedState = {
      panels: {
        'panel-1': {
          id: 'panel-1',
          position: 'right' as const,
          size: 400,
          collapsed: true,
          visible: false,
          order: 5,
        },
      },
      areaSizes: {
        left: 280,
        right: 500,
        bottom: 200,
        center: 0,
      },
    };
    localStorage.setItem('test-storage-key', JSON.stringify(savedState));

    const { layout } = renderHook(() => usePanelLayout(configs, 'test-storage-key'));

    expect(layout().panels['panel-1'].position).toBe('right');
    expect(layout().panels['panel-1'].size).toBe(400);
    expect(layout().panels['panel-1'].collapsed).toBe(true);
    expect(layout().panels['panel-1'].visible).toBe(false);
    expect(layout().areaSizes.right).toBe(500);
  });

  it('saves to localStorage when storageKey is provided', async () => {
    const configs = [createTestConfig('panel-1')];
    const { actions } = renderHook(() => usePanelLayout(configs, 'test-storage-key'));

    actions.collapse('panel-1');

    // Wait for debounced save (300ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const saved = localStorage.getItem('test-storage-key');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.panels['panel-1'].collapsed).toBe(true);
  });

  it('merges new panels from configs not present in stored state', () => {
    const configs = [
      createTestConfig('panel-a', { defaultPosition: 'left', defaultSize: 280 }),
      createTestConfig('panel-b', { defaultPosition: 'right', defaultSize: 300 }),
      createTestConfig('panel-c', { defaultPosition: 'bottom', defaultSize: 200 }),
    ];

    // Stored state only has panel-a and panel-b (panel-c is new)
    const savedState = {
      panels: {
        'panel-a': {
          id: 'panel-a',
          position: 'left' as const,
          size: 350,
          collapsed: true,
          visible: true,
          order: 0,
          pinned: false,
          mode: 'docked' as const,
          pip: false,
          drawerOpen: false,
        },
        'panel-b': {
          id: 'panel-b',
          position: 'right' as const,
          size: 300,
          collapsed: false,
          visible: true,
          order: 1,
          pinned: false,
          mode: 'docked' as const,
          pip: false,
          drawerOpen: false,
        },
      },
      areaSizes: { left: 350, right: 300, bottom: 200, center: 0 },
      activeTabId: undefined,
      maximizedPanelId: null,
    };
    localStorage.setItem('test-merge-key', JSON.stringify(savedState));

    const { layout } = renderHook(() => usePanelLayout(configs, 'test-merge-key'));

    // Stored panels are preserved as-is
    expect(layout().panels['panel-a'].size).toBe(350);
    expect(layout().panels['panel-a'].collapsed).toBe(true);
    expect(layout().panels['panel-b'].size).toBe(300);

    // New panel-c is initialized from its config defaults
    expect(layout().panels['panel-c']).toBeDefined();
    expect(layout().panels['panel-c'].position).toBe('bottom');
    expect(layout().panels['panel-c'].size).toBe(200);
    expect(layout().panels['panel-c'].collapsed).toBe(false);
    expect(layout().panels['panel-c'].visible).toBe(true);
    expect(layout().panels['panel-c'].mode).toBe('docked');
    expect(layout().panels['panel-c'].pip).toBe(false);
    expect(layout().panels['panel-c'].drawerOpen).toBe(false);
  });

  it('applies initialOverrides to panel states', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'left', defaultSize: 280 }),
      createTestConfig('panel-2', { defaultPosition: 'right', defaultSize: 300 }),
    ];

    const initialOverrides = {
      panels: {
        'panel-1': { collapsed: true } as Partial<PanelState>,
      },
    };

    const { layout } = renderHook(() => usePanelLayout(configs, undefined, initialOverrides));

    expect(layout().panels['panel-1'].collapsed).toBe(true);
    expect(layout().panels['panel-2'].collapsed).toBe(false);
  });

  it('setActiveTab changes activeTabId', () => {
    const configs = [
      createTestConfig('tab-a', { defaultPosition: 'center' }),
      createTestConfig('tab-b', { defaultPosition: 'center' }),
    ];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    expect(layout().activeTabId).toBe('tab-a');
    actions.setActiveTab('tab-b');
    expect(layout().activeTabId).toBe('tab-b');
  });

  it('maximize and restore', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    expect(layout().maximizedPanelId).toBeNull();

    actions.maximize('panel-1');
    expect(layout().maximizedPanelId).toBe('panel-1');

    actions.restore();
    expect(layout().maximizedPanelId).toBeNull();
  });

  it('addPanel shows a hidden panel and moves it', () => {
    const configs = [createTestConfig('panel-1', { defaultPosition: 'left' })];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.hide('panel-1');
    expect(layout().panels['panel-1'].visible).toBe(false);

    actions.addPanel('panel-1', 'right');
    expect(layout().panels['panel-1'].visible).toBe(true);
    expect(layout().panels['panel-1'].position).toBe('right');
  });

  it('removePanel hides a panel', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    expect(layout().panels['panel-1'].visible).toBe(true);
    actions.removePanel('panel-1');
    expect(layout().panels['panel-1'].visible).toBe(false);
  });

  it('pin moves panel to front of its position group', () => {
    const configs = [
      createTestConfig('p1', { defaultPosition: 'left' }),
      createTestConfig('p2', { defaultPosition: 'left' }),
      createTestConfig('p3', { defaultPosition: 'left' }),
    ];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    // p3 is order=2, pinning it should move it before unpinned ones
    actions.pin('p3');
    expect(layout().panels['p3'].pinned).toBe(true);
    // Pinned panels should have lower order than unpinned
    expect(layout().panels['p3'].order).toBeLessThan(layout().panels['p1'].order);
    expect(layout().panels['p3'].order).toBeLessThan(layout().panels['p2'].order);
  });

  it('unpin sets pinned to false', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.pin('panel-1');
    expect(layout().panels['panel-1'].pinned).toBe(true);

    actions.unpin('panel-1');
    expect(layout().panels['panel-1'].pinned).toBe(false);
  });

  it('setMode to floating sets default position and size', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.setMode('panel-1', 'floating');
    expect(layout().panels['panel-1'].mode).toBe('floating');
    expect(layout().panels['panel-1'].floatingPosition).toEqual({ x: 100, y: 100 });
    expect(layout().panels['panel-1'].floatingSize).toEqual({ width: 400, height: 300 });
  });

  it('setMode to docked does not set floating properties', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.setMode('panel-1', 'docked');
    expect(layout().panels['panel-1'].mode).toBe('docked');
    expect(layout().panels['panel-1'].floatingPosition).toBeUndefined();
  });

  it('setMode to drawer', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.setMode('panel-1', 'drawer');
    expect(layout().panels['panel-1'].mode).toBe('drawer');
  });

  it('moveFloating updates floating position', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.setMode('panel-1', 'floating');
    actions.moveFloating('panel-1', { x: 200, y: 300 });
    expect(layout().panels['panel-1'].floatingPosition).toEqual({ x: 200, y: 300 });
  });

  it('resizeFloating updates floating size', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.setMode('panel-1', 'floating');
    actions.resizeFloating('panel-1', { width: 600, height: 400 });
    expect(layout().panels['panel-1'].floatingSize).toEqual({ width: 600, height: 400 });
  });

  it('openDrawer and closeDrawer', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.openDrawer('panel-1');
    expect(layout().panels['panel-1'].drawerOpen).toBe(true);

    actions.closeDrawer('panel-1');
    expect(layout().panels['panel-1'].drawerOpen).toBe(false);
  });

  it('togglePip toggles pip state', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    expect(layout().panels['panel-1'].pip).toBe(false);

    actions.togglePip('panel-1');
    expect(layout().panels['panel-1'].pip).toBe(true);

    actions.togglePip('panel-1');
    expect(layout().panels['panel-1'].pip).toBe(false);
  });

  it('getHiddenPanels returns hidden panels', () => {
    const configs = [createTestConfig('panel-1'), createTestConfig('panel-2')];
    const { actions, getHiddenPanels } = renderHook(() => usePanelLayout(configs));

    expect(getHiddenPanels().length).toBe(0);

    actions.hide('panel-1');
    expect(getHiddenPanels().length).toBe(1);
    expect(getHiddenPanels()[0].id).toBe('panel-1');
  });

  it('getFloatingPanels returns floating visible panels', () => {
    const configs = [createTestConfig('panel-1'), createTestConfig('panel-2')];
    const { actions, getFloatingPanels } = renderHook(() => usePanelLayout(configs));

    expect(getFloatingPanels().length).toBe(0);

    actions.setMode('panel-1', 'floating');
    expect(getFloatingPanels().length).toBe(1);
    expect(getFloatingPanels()[0].config.id).toBe('panel-1');
  });

  it('getDrawerPanels returns drawer visible panels', () => {
    const configs = [createTestConfig('panel-1')];
    const { actions, getDrawerPanels } = renderHook(() => usePanelLayout(configs));

    expect(getDrawerPanels().length).toBe(0);

    actions.setMode('panel-1', 'drawer');
    expect(getDrawerPanels().length).toBe(1);
    expect(getDrawerPanels()[0].config.id).toBe('panel-1');
  });

  it('getPipPanels returns pip visible panels', () => {
    const configs = [createTestConfig('panel-1')];
    const { actions, getPipPanels } = renderHook(() => usePanelLayout(configs));

    expect(getPipPanels().length).toBe(0);

    actions.togglePip('panel-1');
    expect(getPipPanels().length).toBe(1);
    expect(getPipPanels()[0].config.id).toBe('panel-1');
  });

  it('getPanelsForPosition excludes floating, drawer, and pip panels', () => {
    const configs = [
      createTestConfig('p1', { defaultPosition: 'left' }),
      createTestConfig('p2', { defaultPosition: 'left' }),
      createTestConfig('p3', { defaultPosition: 'left' }),
    ];
    const { actions, getPanelsForPosition } = renderHook(() => usePanelLayout(configs));

    expect(getPanelsForPosition('left').length).toBe(3);

    actions.setMode('p1', 'floating');
    expect(getPanelsForPosition('left').length).toBe(2);

    actions.setMode('p2', 'drawer');
    expect(getPanelsForPosition('left').length).toBe(1);

    actions.togglePip('p3');
    expect(getPanelsForPosition('left').length).toBe(0);
  });

  it('move does nothing for non-existent panel', () => {
    const configs = [createTestConfig('panel-1')];
    const { layout, actions } = renderHook(() => usePanelLayout(configs));

    actions.move('non-existent', 'right');
    // Should not crash, layout unchanged
    expect(layout().panels['panel-1'].position).toBe('left');
  });

  it('initialOverrides for areaSizes and activeTabId', () => {
    const configs = [
      createTestConfig('panel-1', { defaultPosition: 'center' }),
      createTestConfig('panel-2', { defaultPosition: 'center' }),
    ];

    const overrides = {
      areaSizes: { left: 400 } as Partial<Record<string, number>>,
      activeTabId: 'panel-2',
    };

    const { layout } = renderHook(() => usePanelLayout(configs, undefined, overrides));

    expect(layout().areaSizes.left).toBe(400);
    expect(layout().activeTabId).toBe('panel-2');
  });

  it('initialOverrides for maximizedPanelId', () => {
    const configs = [createTestConfig('panel-1')];

    const overrides = {
      maximizedPanelId: 'panel-1',
    };

    const { layout } = renderHook(() => usePanelLayout(configs, undefined, overrides));
    expect(layout().maximizedPanelId).toBe('panel-1');
  });

  it('validates stored activeTabId against current configs', () => {
    const configs = [createTestConfig('panel-1', { defaultPosition: 'center' })];

    const savedState = {
      panels: {
        'panel-1': {
          id: 'panel-1',
          position: 'center' as const,
          size: 280,
          collapsed: false,
          visible: true,
          order: 0,
          pinned: false,
          mode: 'docked' as const,
          pip: false,
          drawerOpen: false,
        },
      },
      areaSizes: { left: 280, right: 320, bottom: 200, center: 0 },
      activeTabId: 'deleted-panel', // doesn't exist in configs
      maximizedPanelId: 'deleted-panel', // also doesn't exist
    };
    localStorage.setItem('validate-key', JSON.stringify(savedState));

    const { layout } = renderHook(() => usePanelLayout(configs, 'validate-key'));

    // Should fall back to first center panel
    expect(layout().activeTabId).toBe('panel-1');
    // Invalid maximized panel should be null
    expect(layout().maximizedPanelId).toBeNull();
  });

  it('migrates old stored state missing mode/pip/floating fields', () => {
    const configs = [createTestConfig('panel-1')];

    const savedState = {
      panels: {
        'panel-1': {
          id: 'panel-1',
          position: 'left' as const,
          size: 280,
          collapsed: false,
          visible: true,
          order: 0,
          pinned: false,
          // No mode, pip, floatingPosition, floatingSize, drawerOpen
        },
      },
      areaSizes: { left: 280, right: 320, bottom: 200, center: 0 },
    };
    localStorage.setItem('migrate-key', JSON.stringify(savedState));

    const { layout } = renderHook(() => usePanelLayout(configs, 'migrate-key'));

    expect(layout().panels['panel-1'].mode).toBe('docked');
    expect(layout().panels['panel-1'].pip).toBe(false);
    expect(layout().panels['panel-1'].drawerOpen).toBe(false);
  });

  it('resize throws for non-existent panel (store path is invalid)', () => {
    const configs = [createTestConfig('panel-1')];
    const { actions } = renderHook(() => usePanelLayout(configs));

    // Solid store throws when setting on an undefined nested path
    expect(() => actions.resize('non-existent', 300)).toThrow();
  });

  it('pin does nothing for non-existent panel', () => {
    const configs = [createTestConfig('panel-1')];
    const { actions } = renderHook(() => usePanelLayout(configs));

    expect(() => actions.pin('non-existent')).not.toThrow();
  });

  it('togglePip does nothing for non-existent panel', () => {
    const configs = [createTestConfig('panel-1')];
    const { actions } = renderHook(() => usePanelLayout(configs));

    expect(() => actions.togglePip('non-existent')).not.toThrow();
  });

  it('uses default area sizes when no panels at a position', () => {
    const configs = [createTestConfig('panel-1', { defaultPosition: 'left' })];
    const { layout } = renderHook(() => usePanelLayout(configs));

    // right, bottom, center should have defaults
    expect(layout().areaSizes.right).toBe(320);
    expect(layout().areaSizes.bottom).toBe(200);
  });

  it('area size uses the largest defaultSize among panels at a position', () => {
    const configs = [
      createTestConfig('p1', { defaultPosition: 'left', defaultSize: 200 }),
      createTestConfig('p2', { defaultPosition: 'left', defaultSize: 400 }),
    ];
    const { layout } = renderHook(() => usePanelLayout(configs));

    expect(layout().areaSizes.left).toBe(400);
  });
});
