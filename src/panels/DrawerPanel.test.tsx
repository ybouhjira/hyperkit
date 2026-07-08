import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { DrawerPanel } from './DrawerPanel';
import type { PanelConfig, PanelState } from './types';

const createConfig = (overrides?: Partial<PanelConfig>): PanelConfig => ({
  id: 'drawer-1',
  title: 'Test Drawer',
  defaultPosition: 'left',
  render: () => <div data-testid="drawer-content">Drawer Content</div>,
  ...overrides,
});

const createState = (overrides?: Partial<PanelState>): PanelState => ({
  id: 'drawer-1',
  position: 'left',
  size: 300,
  collapsed: false,
  visible: true,
  order: 0,
  pinned: false,
  mode: 'drawer',
  pip: false,
  ...overrides,
});

describe('DrawerPanel', () => {
  it('renders trigger strip when closed', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const trigger = container.querySelector('.sk-drawer-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger!.classList.contains('sk-drawer-trigger--left')).toBe(true);
  });

  it('does not render panel overlay when closed', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-drawer-panel')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-drawer-backdrop')).not.toBeInTheDocument();
  });

  it('renders panel overlay and backdrop when open', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-drawer-panel')).toBeInTheDocument();
    expect(container.querySelector('.sk-drawer-backdrop')).toBeInTheDocument();
  });

  it('renders panel content when open', () => {
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('renders title in header when open', () => {
    render(() => (
      <DrawerPanel
        config={createConfig({ title: 'My Drawer' })}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.getByText('My Drawer')).toBeInTheDocument();
  });

  it('calls onOpen when trigger strip is clicked', () => {
    const onOpen = vi.fn();
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={onOpen}
        onClose={vi.fn()}
      />
    ));

    const trigger = container.querySelector('.sk-drawer-trigger') as HTMLElement;
    fireEvent.click(trigger);

    expect(onOpen).toHaveBeenCalledWith('drawer-1');
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={onClose}
      />
    ));

    const backdrop = container.querySelector('.sk-drawer-backdrop') as HTMLElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledWith('drawer-1');
  });

  it('calls onClose when Escape key is pressed while open', () => {
    const onClose = vi.fn();
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={onClose}
      />
    ));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledWith('drawer-1');
  });

  it('does not call onClose on Escape when drawer is closed', () => {
    const onClose = vi.fn();
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={onClose}
      />
    ));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={onClose}
      />
    ));

    const closeBtn = screen.getByTitle('Close drawer');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledWith('drawer-1');
  });

  it('applies left edge class', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const panel = container.querySelector('.sk-drawer-panel');
    expect(panel!.classList.contains('sk-drawer-panel--left')).toBe(true);
  });

  it('applies right edge class', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="right"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const panel = container.querySelector('.sk-drawer-panel');
    expect(panel!.classList.contains('sk-drawer-panel--right')).toBe(true);
    const trigger = container.querySelector('.sk-drawer-trigger');
    expect(trigger!.classList.contains('sk-drawer-trigger--right')).toBe(true);
  });

  it('applies bottom edge class', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="bottom"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const panel = container.querySelector('.sk-drawer-panel');
    expect(panel!.classList.contains('sk-drawer-panel--bottom')).toBe(true);
    const trigger = container.querySelector('.sk-drawer-trigger');
    expect(trigger!.classList.contains('sk-drawer-trigger--bottom')).toBe(true);
  });

  it('applies open class when isOpen is true', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const panel = container.querySelector('.sk-drawer-panel');
    expect(panel!.classList.contains('sk-drawer-panel--open')).toBe(true);
  });

  it('renders icon when config has icon string', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig({ icon: '📁' })}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const icon = container.querySelector('.sk-drawer-panel__icon');
    expect(icon).toBeInTheDocument();
    expect(icon!.textContent).toBe('📁');
  });

  it('does not render icon when config has no icon', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig({ icon: undefined })}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-drawer-panel__icon')).not.toBeInTheDocument();
  });

  it('renders dock button when onDock is provided', () => {
    const onDock = vi.fn();
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onDock={onDock}
      />
    ));

    const dockBtn = screen.getByTitle('Dock panel');
    expect(dockBtn).toBeInTheDocument();
  });

  it('calls onDock when dock button is clicked', () => {
    const onDock = vi.fn();
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onDock={onDock}
      />
    ));

    const dockBtn = screen.getByTitle('Dock panel');
    fireEvent.click(dockBtn);

    expect(onDock).toHaveBeenCalledWith('drawer-1');
  });

  it('does not render dock button when onDock is not provided', () => {
    render(() => (
      <DrawerPanel
        config={createConfig()}
        state={createState()}
        isOpen={true}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    expect(screen.queryByTitle('Dock panel')).not.toBeInTheDocument();
  });

  it('applies custom accent color to trigger strip', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig({ accentColor: '#ff0000' })}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const trigger = container.querySelector('.sk-drawer-trigger') as HTMLElement;
    expect(trigger.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('uses default accent color when none specified', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig({ accentColor: undefined })}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const trigger = container.querySelector('.sk-drawer-trigger') as HTMLElement;
    expect(trigger.style.backgroundColor).toBe('var(--sk-accent, #3b82f6)');
  });

  it('sets trigger title with panel title', () => {
    const { container } = render(() => (
      <DrawerPanel
        config={createConfig({ title: 'Settings' })}
        state={createState()}
        isOpen={false}
        edge="left"
        onOpen={vi.fn()}
        onClose={vi.fn()}
      />
    ));

    const trigger = container.querySelector('.sk-drawer-trigger') as HTMLElement;
    expect(trigger.getAttribute('title')).toBe('Open Settings');
  });
});
