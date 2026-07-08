import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { FloatingPanel } from './FloatingPanel';
import type { PanelConfig, PanelState } from './types';

const mockConfig: PanelConfig = {
  id: 'test-panel',
  title: 'Test Panel',
  icon: '📝',
  defaultPosition: 'center',
  render: () => <div>Test Content</div>,
};

const mockState: PanelState = {
  id: 'test-panel',
  position: 'center',
  size: 300,
  collapsed: false,
  visible: true,
  order: 0,
  pinned: false,
  mode: 'floating',
  pip: false,
  floatingPosition: { x: 100, y: 100 },
  floatingSize: { width: 400, height: 300 },
};

const defaultProps = {
  config: mockConfig,
  state: mockState,
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  onMove: vi.fn(),
  onResize: vi.fn(),
};

describe('FloatingPanel', () => {
  it('renders the panel with title and icon', () => {
    render(() => <FloatingPanel {...defaultProps} />);

    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn();
    render(() => <FloatingPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByTitle('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders dock button when onDock is provided', () => {
    const onDock = vi.fn();
    render(() => <FloatingPanel {...defaultProps} onDock={onDock} />);

    const dockButton = screen.getByTitle('Dock panel');
    expect(dockButton).toBeInTheDocument();
  });

  it('applies correct position and size styles', () => {
    const { container } = render(() => (
      <FloatingPanel
        {...defaultProps}
        position={{ x: 150, y: 200 }}
        size={{ width: 500, height: 400 }}
      />
    ));

    const floatingPanel = container.querySelector('.sk-floating-panel');
    expect(floatingPanel).toHaveStyle({
      left: '150px',
      top: '200px',
      width: '500px',
      height: '400px',
    });
  });

  it('renders resize grip', () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const resizeGrip = container.querySelector('.sk-floating-panel__resize-grip');
    expect(resizeGrip).toBeInTheDocument();
  });
});

describe('FloatingPanel close action', () => {
  it('calls onClose with panel id when close clicked', async () => {
    const onClose = vi.fn();
    render(() => <FloatingPanel {...defaultProps} onClose={onClose} />);

    await fireEvent.click(screen.getByTitle('Close'));
    expect(onClose).toHaveBeenCalledWith('test-panel');
  });

  it('does not render close button when onClose is not provided', () => {
    render(() => <FloatingPanel {...defaultProps} />);
    expect(screen.queryByTitle('Close')).not.toBeInTheDocument();
  });
});

describe('FloatingPanel dock action', () => {
  it('calls onDock with panel id when dock clicked', async () => {
    const onDock = vi.fn();
    render(() => <FloatingPanel {...defaultProps} onDock={onDock} />);

    await fireEvent.click(screen.getByTitle('Dock panel'));
    expect(onDock).toHaveBeenCalledWith('test-panel');
  });

  it('does not render dock button when onDock is not provided', () => {
    render(() => <FloatingPanel {...defaultProps} />);
    expect(screen.queryByTitle('Dock panel')).not.toBeInTheDocument();
  });
});

describe('FloatingPanel drag', () => {
  it('renders header for drag handle', () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const header = container.querySelector('.sk-floating-panel__header');
    expect(header).toBeInTheDocument();
  });

  it('initiates drag on pointerdown on header', async () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const header = container.querySelector('.sk-floating-panel__header') as HTMLElement;
    await fireEvent.pointerDown(header, { clientX: 110, clientY: 110 });

    // After pointerdown, the panel should get dragging class during move
    // Verify the panel still renders (no crash)
    expect(container.querySelector('.sk-floating-panel')).toBeInTheDocument();
  });

  it('does not start drag when clicking a button in header', async () => {
    const onClose = vi.fn();
    const { container } = render(() => <FloatingPanel {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByTitle('Close');
    // pointerdown on button should not initiate drag
    await fireEvent.pointerDown(closeBtn, { clientX: 110, clientY: 110 });

    // Panel should not have dragging class
    const panel = container.querySelector('.sk-floating-panel');
    expect(panel?.classList.contains('sk-floating-panel--dragging')).toBe(false);
  });
});

describe('FloatingPanel resize', () => {
  it('renders resize grip element', () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const grip = container.querySelector('.sk-floating-panel__resize-grip');
    expect(grip).toBeInTheDocument();
  });

  it('handles pointerdown on resize grip without crash', async () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const grip = container.querySelector('.sk-floating-panel__resize-grip') as HTMLElement;
    await fireEvent.pointerDown(grip, { clientX: 500, clientY: 400 });

    expect(container.querySelector('.sk-floating-panel')).toBeInTheDocument();
  });
});

describe('FloatingPanel without icon', () => {
  it('renders without icon when config has no icon', () => {
    const noIconConfig: PanelConfig = {
      id: 'no-icon',
      title: 'No Icon Panel',
      defaultPosition: 'center',
      render: () => <div>Content</div>,
    };

    const noIconState: PanelState = {
      ...mockState,
      id: 'no-icon',
    };

    render(() => <FloatingPanel {...defaultProps} config={noIconConfig} state={noIconState} />);

    expect(screen.getByText('No Icon Panel')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('FloatingPanel content', () => {
  it('renders panel content from config.render', () => {
    const { container } = render(() => <FloatingPanel {...defaultProps} />);

    const content = container.querySelector('.sk-floating-panel__content');
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toContain('Test Content');
  });
});
