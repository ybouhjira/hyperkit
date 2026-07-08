import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PipPanel } from './PipPanel';
import type { PanelConfig, PanelState } from './types';

const createConfig = (overrides?: Partial<PanelConfig>): PanelConfig => ({
  id: 'pip-1',
  title: 'PiP Panel',
  defaultPosition: 'center',
  render: () => <div data-testid="pip-content">PiP Content</div>,
  ...overrides,
});

const createState = (overrides?: Partial<PanelState>): PanelState => ({
  id: 'pip-1',
  position: 'center',
  size: 300,
  collapsed: false,
  visible: true,
  order: 0,
  pinned: false,
  mode: 'docked',
  pip: true,
  ...overrides,
});

const defaultBounds = { width: 1000, height: 800 };

describe('PipPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(container.querySelector('.sk-pip-panel')).toBeInTheDocument();
  });

  it('renders panel title', () => {
    render(() => (
      <PipPanel
        config={createConfig({ title: 'Mini Player' })}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(screen.getByText('Mini Player')).toBeInTheDocument();
  });

  it('renders panel content', () => {
    render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(screen.getByTestId('pip-content')).toBeInTheDocument();
  });

  it('renders icon when config has icon', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig({ icon: '🎬' })}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const icon = container.querySelector('.sk-pip-panel__icon');
    expect(icon).toBeInTheDocument();
    expect(icon!.textContent).toBe('🎬');
  });

  it('does not render icon when config has no icon', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig({ icon: undefined })}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(container.querySelector('.sk-pip-panel__icon')).not.toBeInTheDocument();
  });

  it('calls onRestore when panel is clicked', () => {
    const onRestore = vi.fn();
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={onRestore}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    fireEvent.click(panel);

    expect(onRestore).toHaveBeenCalledWith('pip-1');
  });

  it('sets title attribute with restore hint', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig({ title: 'Preview' })}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    expect(panel.getAttribute('title')).toBe('Click to restore Preview');
  });

  it('positions in bottom-right corner by default', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    // bottom-right: left = 1000 - 200 - 16 = 784, top = 800 - 150 - 16 = 634
    expect(panel.style.left).toBe('784px');
    expect(panel.style.top).toBe('634px');
  });

  it('positions in top-left corner when specified', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        corner="top-left"
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    // top-left: left = 16, top = 16
    expect(panel.style.left).toBe('16px');
    expect(panel.style.top).toBe('16px');
  });

  it('positions in top-right corner when specified', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        corner="top-right"
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    // top-right: left = 1000 - 200 - 16 = 784, top = 16
    expect(panel.style.left).toBe('784px');
    expect(panel.style.top).toBe('16px');
  });

  it('positions in bottom-left corner when specified', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        corner="bottom-left"
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    // bottom-left: left = 16, top = 800 - 150 - 16 = 634
    expect(panel.style.left).toBe('16px');
    expect(panel.style.top).toBe('634px');
  });

  it('applies fixed width and height', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    expect(panel.style.width).toBe('200px');
    expect(panel.style.height).toBe('150px');
  });

  it('renders corner cycle button', () => {
    render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(screen.getByTitle('Move to next corner')).toBeInTheDocument();
  });

  it('cycles corner on corner button click', async () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    const cornerBtn = screen.getByTitle('Move to next corner');

    // Default is bottom-right, next should be bottom-left
    fireEvent.click(cornerBtn);

    await vi.waitFor(() => {
      const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
      // bottom-left: left = 16, top = 634
      expect(panel.style.left).toBe('16px');
      expect(panel.style.top).toBe('634px');
    });
  });

  it('corner button click does not trigger onRestore', () => {
    const onRestore = vi.fn();
    render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={onRestore}
        containerBounds={defaultBounds}
      />
    ));

    const cornerBtn = screen.getByTitle('Move to next corner');
    fireEvent.click(cornerBtn);

    // onRestore should NOT fire since cycleCorner calls e.stopPropagation()
    expect(onRestore).not.toHaveBeenCalled();
  });

  it('renders header with title element', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(container.querySelector('.sk-pip-panel__header')).toBeInTheDocument();
    expect(container.querySelector('.sk-pip-panel__title')).toBeInTheDocument();
  });

  it('renders content wrapper', () => {
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={defaultBounds}
      />
    ));

    expect(container.querySelector('.sk-pip-panel__content-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.sk-pip-panel__content')).toBeInTheDocument();
  });

  it('adapts position to different container bounds', () => {
    const smallBounds = { width: 500, height: 400 };
    const { container } = render(() => (
      <PipPanel
        config={createConfig()}
        state={createState()}
        onRestore={vi.fn()}
        containerBounds={smallBounds}
      />
    ));

    const panel = container.querySelector('.sk-pip-panel') as HTMLElement;
    // bottom-right: left = 500 - 200 - 16 = 284, top = 400 - 150 - 16 = 234
    expect(panel.style.left).toBe('284px');
    expect(panel.style.top).toBe('234px');
  });
});
