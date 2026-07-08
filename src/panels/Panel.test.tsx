import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Panel } from './Panel';
import type { PanelConfig, PanelState } from './types';

// Helper function to create test panel config
const createTestConfig = (overrides?: Partial<PanelConfig>): PanelConfig => ({
  id: 'test-panel',
  title: 'Test Panel',
  defaultPosition: 'left',
  render: () => <div>Test Content</div>,
  ...overrides,
});

// Helper function to create test panel state
const createTestState = (overrides?: Partial<PanelState>): PanelState => ({
  id: 'test-panel',
  position: 'left',
  size: 280,
  collapsed: false,
  visible: true,
  order: 0,
  ...overrides,
});

describe('Panel', () => {
  it('renders panel title', () => {
    const config = createTestConfig({ title: 'My Panel' });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    expect(screen.getByText('My Panel')).toBeInTheDocument();
  });

  it('renders panel with string icon', () => {
    const config = createTestConfig({ icon: '🔧' });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('renders panel with function icon', () => {
    const config = createTestConfig({
      icon: () => <svg data-testid="custom-icon" />,
    });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders content from config.render()', () => {
    const config = createTestConfig({
      render: () => <div>Custom Panel Content</div>,
    });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    expect(screen.getByText('Custom Panel Content')).toBeInTheDocument();
  });

  it('shows collapse button when collapsible', () => {
    const config = createTestConfig({ collapsible: true });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    const buttons = screen.getAllByRole('button');
    // Should have collapse button (the one with the chevron SVG)
    expect(buttons.length).toBeGreaterThan(0);
    // Find collapse button by checking for the SVG path
    const collapseButton = buttons.find((btn) => btn.querySelector('path[d="M3 5L6 8L9 5"]'));
    expect(collapseButton).toBeTruthy();
  });

  it('does not show collapse button when not collapsible', () => {
    const config = createTestConfig({ collapsible: false });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    const buttons = screen.queryAllByRole('button');
    // Check for collapse button SVG
    const collapseButton = buttons.find((btn) => btn.querySelector('path[d="M3 5L6 8L9 5"]'));
    expect(collapseButton).toBeFalsy();
  });

  it('shows close button when closable', () => {
    const config = createTestConfig({ closable: true });
    const state = createTestState();
    render(() => <Panel config={config} state={state} />);
    const buttons = screen.getAllByRole('button');
    // Find close button by checking for the X SVG path
    const closeButton = buttons.find((btn) => btn.querySelector('path[d="M3 3L9 9M9 3L3 9"]'));
    expect(closeButton).toBeTruthy();
  });

  it('calls onCollapse when collapse button clicked (when not collapsed)', () => {
    const onCollapse = vi.fn();
    const config = createTestConfig({ collapsible: true });
    const state = createTestState({ collapsed: false });
    render(() => <Panel config={config} state={state} onCollapse={onCollapse} />);
    const buttons = screen.getAllByRole('button');
    const collapseButton = buttons.find((btn) => btn.querySelector('path[d="M3 5L6 8L9 5"]'));
    expect(collapseButton).toBeTruthy();
    fireEvent.click(collapseButton!);
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when state.collapsed is true', () => {
    const config = createTestConfig({ title: 'Collapsed Panel' });
    const state = createTestState({ collapsed: true });
    const { container } = render(() => <Panel config={config} state={state} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls onDragStart with panelId and event on header pointerdown when draggable', () => {
    const onDragStart = vi.fn();
    const config = createTestConfig({ draggable: true });
    const state = createTestState();
    render(() => <Panel config={config} state={state} onDragStart={onDragStart} />);
    const header = screen.getByText('Test Panel').parentElement;
    expect(header).toBeTruthy();
    fireEvent.pointerDown(header!);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith('test-panel', expect.any(Object));
  });

  it('does NOT call onDragStart when not draggable', () => {
    const onDragStart = vi.fn();
    const config = createTestConfig({ draggable: false });
    const state = createTestState();
    render(() => <Panel config={config} state={state} onDragStart={onDragStart} />);
    const header = screen.getByText('Test Panel').parentElement;
    expect(header).toBeTruthy();
    fireEvent.pointerDown(header!);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('does NOT start drag when clicking a button in header', () => {
    const onDragStart = vi.fn();
    const config = createTestConfig({ draggable: true, closable: true });
    const state = createTestState();
    render(() => <Panel config={config} state={state} onDragStart={onDragStart} />);
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((btn) => btn.querySelector('path[d="M3 3L9 9M9 3L3 9"]'));
    expect(closeButton).toBeTruthy();
    fireEvent.pointerDown(closeButton!);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('shows close button and calls onClose when clicked', () => {
    const onClose = vi.fn();
    const config = createTestConfig({ closable: true });
    const state = createTestState();
    render(() => <Panel config={config} state={state} onClose={onClose} />);
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((btn) => btn.querySelector('path[d="M3 3L9 9M9 3L3 9"]'));
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom actions in header', () => {
    const config = createTestConfig();
    const state = createTestState();
    const actions = <button data-testid="custom-action">Custom</button>;
    render(() => <Panel config={config} state={state} actions={actions} />);
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    const config = createTestConfig({ title: 'Test Panel' });
    const state = createTestState();
    const { container } = render(() => <Panel config={config} state={state} hideHeader={true} />);

    // Header should not be visible
    expect(screen.queryByText('Test Panel')).not.toBeInTheDocument();

    // Content should still be visible
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // No header element should be present
    expect(container.querySelector('.sk-panel-header')).not.toBeInTheDocument();
  });

  it('shows header when hideHeader is false or undefined', () => {
    const config = createTestConfig({ title: 'Test Panel' });
    const state = createTestState();
    render(() => <Panel config={config} state={state} hideHeader={false} />);

    // Header should be visible
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });
});
