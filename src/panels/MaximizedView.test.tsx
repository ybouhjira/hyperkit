import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { MaximizedView } from './MaximizedView';
import type { PanelConfig, PanelState, PanelLayoutState, PanelPosition } from './types';

const createPanelConfig = (overrides?: Partial<PanelConfig>): PanelConfig => ({
  id: 'panel-1',
  title: 'Panel 1',
  defaultPosition: 'center',
  render: () => <div data-testid="panel-1-content">Panel 1 Content</div>,
  ...overrides,
});

const createPanelState = (overrides?: Partial<PanelState>): PanelState => ({
  id: 'panel-1',
  position: 'center',
  size: 300,
  collapsed: false,
  visible: true,
  order: 0,
  pinned: false,
  mode: 'docked',
  pip: false,
  ...overrides,
});

const createLayout = (panels: Record<string, PanelState>): PanelLayoutState => ({
  panels,
  areaSizes: { left: 250, right: 250, bottom: 200, center: 0 },
  maximizedPanelId: 'panel-1',
});

const defaultAllPanels: PanelConfig[] = [
  createPanelConfig({ id: 'panel-1', title: 'Main Panel' }),
  createPanelConfig({ id: 'panel-2', title: 'Side Panel', defaultPosition: 'left' }),
  createPanelConfig({ id: 'panel-3', title: 'Bottom Panel', defaultPosition: 'bottom' }),
];

const defaultLayout = createLayout({
  'panel-1': createPanelState({ id: 'panel-1', visible: true, order: 0 }),
  'panel-2': createPanelState({ id: 'panel-2', position: 'left', visible: true, order: 1 }),
  'panel-3': createPanelState({ id: 'panel-3', position: 'bottom', visible: true, order: 2 }),
});

const defaultGetPanelsForPosition = (_position: PanelPosition) =>
  [] as { config: PanelConfig; state: PanelState }[];

describe('MaximizedView', () => {
  it('renders without crashing', () => {
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-maximized-view')).toBeInTheDocument();
  });

  it('renders tab bar', () => {
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-maximized-view__tab-bar')).toBeInTheDocument();
  });

  it('renders maximized panel title as active tab', () => {
    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const activeTab = document.querySelector('.sk-maximized-view__tab--active');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab!.textContent).toContain('Main Panel');
  });

  it('renders other visible panels as tabs', () => {
    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByText('Side Panel')).toBeInTheDocument();
    expect(screen.getByText('Bottom Panel')).toBeInTheDocument();
  });

  it('does not show hidden panels as tabs', () => {
    const layoutWithHidden = createLayout({
      'panel-1': createPanelState({ id: 'panel-1', visible: true, order: 0 }),
      'panel-2': createPanelState({ id: 'panel-2', visible: false, order: 1 }),
      'panel-3': createPanelState({ id: 'panel-3', visible: true, order: 2 }),
    });

    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={layoutWithHidden}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.queryByText('Side Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Bottom Panel')).toBeInTheDocument();
  });

  it('calls onTabClick when clicking another panel tab', () => {
    const onTabClick = vi.fn();
    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={onTabClick}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    fireEvent.click(screen.getByText('Side Panel'));

    expect(onTabClick).toHaveBeenCalledWith('panel-2');
  });

  it('calls onTabClose when clicking close button on tab', () => {
    const onTabClose = vi.fn();
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={onTabClose}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    // Find the close buttons (x) on the non-active tabs
    const closeButtons = container.querySelectorAll('.sk-maximized-view__tab-close');
    expect(closeButtons.length).toBeGreaterThan(0);

    fireEvent.click(closeButtons[0]!);

    expect(onTabClose).toHaveBeenCalled();
  });

  it('calls onRestore when restore button is clicked', () => {
    const onRestore = vi.fn();
    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={onRestore}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const restoreBtn = screen.getByTitle('Restore grid layout');
    fireEvent.click(restoreBtn);

    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('renders maximized panel content', () => {
    render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByTestId('panel-1-content')).toBeInTheDocument();
  });

  it('renders content area', () => {
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-maximized-view__content')).toBeInTheDocument();
  });

  it('renders icon in active tab when panel has icon', () => {
    const panelsWithIcon = [
      createPanelConfig({ id: 'panel-1', title: 'Main Panel', icon: '🔧' }),
      ...defaultAllPanels.slice(1),
    ];

    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={panelsWithIcon}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const activeTab = container.querySelector('.sk-maximized-view__tab--active');
    const icon = activeTab!.querySelector('.sk-maximized-view__tab-icon');
    expect(icon).toBeInTheDocument();
    expect(icon!.textContent).toBe('🔧');
  });

  it('renders separator between active tab and other tabs', () => {
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-maximized-view__separator')).toBeInTheDocument();
  });

  it('handles non-existent maximized panel ID gracefully', () => {
    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="non-existent"
        allPanels={defaultAllPanels}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    // Should still render the view structure
    expect(container.querySelector('.sk-maximized-view')).toBeInTheDocument();
    // But no panel content
    expect(screen.queryByTestId('panel-1-content')).not.toBeInTheDocument();
  });

  it('renders icons on other panel tabs when they have icons', () => {
    const panelsWithIcons = [
      createPanelConfig({ id: 'panel-1', title: 'Main Panel' }),
      createPanelConfig({ id: 'panel-2', title: 'Side Panel', icon: '📁' }),
      createPanelConfig({ id: 'panel-3', title: 'Bottom Panel', icon: '📊' }),
    ];

    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={panelsWithIcons}
        layout={defaultLayout}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const tabIcons = container.querySelectorAll(
      '.sk-maximized-view__tab:not(.sk-maximized-view__tab--active) .sk-maximized-view__tab-icon'
    );
    expect(tabIcons.length).toBe(2);
  });

  it('sorts other panels by order', () => {
    const layoutReversed = createLayout({
      'panel-1': createPanelState({ id: 'panel-1', visible: true, order: 0 }),
      'panel-2': createPanelState({ id: 'panel-2', visible: true, order: 5 }),
      'panel-3': createPanelState({ id: 'panel-3', visible: true, order: 1 }),
    });

    const { container } = render(() => (
      <MaximizedView
        maximizedPanelId="panel-1"
        allPanels={defaultAllPanels}
        layout={layoutReversed}
        getPanelsForPosition={defaultGetPanelsForPosition}
        onTabClick={vi.fn()}
        onTabClose={vi.fn()}
        onRestore={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const tabs = container.querySelectorAll(
      '.sk-maximized-view__tab:not(.sk-maximized-view__tab--active)'
    );
    // panel-3 (order 1) should come before panel-2 (order 5)
    expect(tabs[0]!.textContent).toContain('Bottom Panel');
    expect(tabs[1]!.textContent).toContain('Side Panel');
  });
});
