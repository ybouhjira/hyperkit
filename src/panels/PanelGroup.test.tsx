import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PanelGroup } from './PanelGroup';
import type { PanelConfig, PanelState } from './types';

// Helper function to create test panel config
const createTestConfig = (id: string, overrides?: Partial<PanelConfig>): PanelConfig => ({
  id,
  title: `Panel ${id}`,
  defaultPosition: 'left',
  render: () => <div>{`Content ${id}`}</div>,
  ...overrides,
});

// Helper function to create test panel state
const createTestState = (id: string, overrides?: Partial<PanelState>): PanelState => ({
  id,
  position: 'left',
  size: 280,
  collapsed: false,
  visible: true,
  order: 0,
  ...overrides,
});

describe('PanelGroup', () => {
  it('renders all visible panels', () => {
    const panels = [
      { config: createTestConfig('panel-1'), state: createTestState('panel-1') },
      { config: createTestConfig('panel-2'), state: createTestState('panel-2') },
      { config: createTestConfig('panel-3'), state: createTestState('panel-3') },
    ];

    render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByText('Panel panel-1')).toBeInTheDocument();
    expect(screen.getByText('Panel panel-2')).toBeInTheDocument();
    expect(screen.getByText('Panel panel-3')).toBeInTheDocument();
  });

  it('filters out hidden panels (visible: false)', () => {
    const panels = [
      { config: createTestConfig('panel-1'), state: createTestState('panel-1', { visible: true }) },
      {
        config: createTestConfig('panel-2'),
        state: createTestState('panel-2', { visible: false }),
      },
      { config: createTestConfig('panel-3'), state: createTestState('panel-3', { visible: true }) },
    ];

    render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByText('Panel panel-1')).toBeInTheDocument();
    expect(screen.queryByText('Panel panel-2')).not.toBeInTheDocument();
    expect(screen.getByText('Panel panel-3')).toBeInTheDocument();
  });

  it('renders resize handles between panels', () => {
    const panels = [
      { config: createTestConfig('panel-1'), state: createTestState('panel-1') },
      { config: createTestConfig('panel-2'), state: createTestState('panel-2') },
      { config: createTestConfig('panel-3'), state: createTestState('panel-3') },
    ];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    // Should have 2 resize handles for 3 panels
    const handles = container.querySelectorAll('.sk-resize-handle--horizontal');
    expect(handles.length).toBe(2);
  });

  it('no resize handle after last panel', () => {
    const panels = [{ config: createTestConfig('panel-1'), state: createTestState('panel-1') }];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    // Should have 0 resize handles for 1 panel
    const handles = container.querySelectorAll('.sk-resize-handle');
    expect(handles.length).toBe(0);
  });

  it('applies vertical flex direction for vertical direction', () => {
    const panels = [{ config: createTestConfig('panel-1'), state: createTestState('panel-1') }];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="vertical"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const groupContainer = container.firstChild as HTMLElement;
    expect(groupContainer.classList.contains('sk-panel-group--vertical')).toBe(true);
  });

  it('applies horizontal flex direction for horizontal direction', () => {
    const panels = [{ config: createTestConfig('panel-1'), state: createTestState('panel-1') }];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const groupContainer = container.firstChild as HTMLElement;
    expect(groupContainer.classList.contains('sk-panel-group--horizontal')).toBe(true);
  });

  it('reduces opacity for dragged panel (draggedPanelId matching)', () => {
    const panels = [
      { config: createTestConfig('panel-1'), state: createTestState('panel-1') },
      { config: createTestConfig('panel-2'), state: createTestState('panel-2') },
    ];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
        draggedPanelId="panel-1"
      />
    ));

    // Find panel wrappers by CSS class
    const panelWrappers = container.querySelectorAll('.sk-panel-wrapper');

    // First panel should have the dragged class
    const firstPanel = panelWrappers[0] as HTMLElement;
    expect(firstPanel.classList.contains('sk-panel-wrapper--dragged')).toBe(true);

    // Second panel should not have the dragged class
    const secondPanel = panelWrappers[1] as HTMLElement;
    expect(secondPanel.classList.contains('sk-panel-wrapper--dragged')).toBe(false);
  });

  it('passes callbacks correctly to Panel components', () => {
    const onResize = vi.fn();
    const onCollapse = vi.fn();
    const onExpand = vi.fn();
    const onClose = vi.fn();
    const onDragStart = vi.fn();

    const panels = [
      {
        config: createTestConfig('panel-1', { collapsible: true, closable: true }),
        state: createTestState('panel-1'),
      },
    ];

    render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={onResize}
        onCollapse={onCollapse}
        onExpand={onExpand}
        onClose={onClose}
        onDragStart={onDragStart}
      />
    ));

    // Verify panel rendered
    expect(screen.getByText('Panel panel-1')).toBeInTheDocument();

    // The callbacks should be wired up (we can't easily test them without triggering events,
    // but we can verify the component rendered successfully with all props)
    // This test mainly ensures no errors are thrown when passing callbacks
  });

  it('does not render collapsed panels', () => {
    const panels = [
      {
        config: createTestConfig('panel-1'),
        state: createTestState('panel-1', { collapsed: true }),
      },
      {
        config: createTestConfig('panel-2'),
        state: createTestState('panel-2', { collapsed: false }),
      },
    ];

    render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.queryByText('Panel panel-1')).not.toBeInTheDocument();
    expect(screen.getByText('Panel panel-2')).toBeInTheDocument();
  });

  it('hides panel headers when tabMode is true', () => {
    const panels = [
      { config: createTestConfig('panel-1'), state: createTestState('panel-1') },
      { config: createTestConfig('panel-2'), state: createTestState('panel-2') },
    ];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
        tabMode={true}
        activeTabId="panel-1"
      />
    ));

    // In tab mode, only the active panel should be visible
    expect(screen.queryByText('Panel panel-1')).not.toBeInTheDocument(); // header hidden
    expect(screen.getByText('Content panel-1')).toBeInTheDocument(); // content visible
    expect(screen.queryByText('Panel panel-2')).not.toBeInTheDocument(); // not active

    // No headers should be present in tab mode
    expect(container.querySelector('.sk-panel-header')).not.toBeInTheDocument();
  });

  it('shows panel headers when tabMode is false', () => {
    const panels = [{ config: createTestConfig('panel-1'), state: createTestState('panel-1') }];

    const { container } = render(() => (
      <PanelGroup
        panels={panels}
        direction="horizontal"
        onResize={vi.fn()}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onClose={vi.fn()}
        tabMode={false}
      />
    ));

    // Headers should be visible when not in tab mode
    expect(screen.getByText('Panel panel-1')).toBeInTheDocument();
    expect(container.querySelector('.sk-panel-header')).toBeInTheDocument();
  });
});
