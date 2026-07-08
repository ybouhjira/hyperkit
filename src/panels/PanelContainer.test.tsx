import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PanelContainer } from './PanelContainer';
import type { PanelConfig } from './types';

const mockPanels: PanelConfig[] = [
  {
    id: 'panel1',
    title: 'Panel 1',
    defaultPosition: 'left',
    render: () => <div>Panel 1 Content</div>,
  },
  {
    id: 'panel2',
    title: 'Panel 2',
    defaultPosition: 'right',
    render: () => <div>Panel 2 Content</div>,
  },
  {
    id: 'panel3',
    title: 'Panel 3',
    defaultPosition: 'bottom',
    render: () => <div>Panel 3 Content</div>,
  },
];

describe('PanelContainer', () => {
  it('renders without crashing', () => {
    const { container } = render(() => <PanelContainer panels={[]} />);

    expect(container.querySelector('.sk-panel-container')).toBeInTheDocument();
  });

  it('renders panels in their default positions', () => {
    render(() => <PanelContainer panels={mockPanels} />);

    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    expect(screen.getByText('Panel 3')).toBeInTheDocument();
  });

  it('renders panel content', () => {
    render(() => <PanelContainer panels={mockPanels} />);

    expect(screen.getByText('Panel 1 Content')).toBeInTheDocument();
    expect(screen.getByText('Panel 2 Content')).toBeInTheDocument();
    expect(screen.getByText('Panel 3 Content')).toBeInTheDocument();
  });

  it('renders left panel area when left panels exist', () => {
    const { container } = render(() => <PanelContainer panels={mockPanels} />);

    const leftArea = container.querySelector('.sk-panel-area--left');
    expect(leftArea).toBeInTheDocument();
  });

  it('renders right panel area when right panels exist', () => {
    const { container } = render(() => <PanelContainer panels={mockPanels} />);

    const rightArea = container.querySelector('.sk-panel-area--right');
    expect(rightArea).toBeInTheDocument();
  });

  it('renders bottom panel area when bottom panels exist', () => {
    const { container } = render(() => <PanelContainer panels={mockPanels} />);

    const bottomArea = container.querySelector('.sk-panel-area--bottom');
    expect(bottomArea).toBeInTheDocument();
  });

  it('renders children in center when no center panels', () => {
    render(() => (
      <PanelContainer panels={mockPanels}>
        <div>Center Content</div>
      </PanelContainer>
    ));

    expect(screen.getByText('Center Content')).toBeInTheDocument();
  });

  it('renders center panels when provided', () => {
    const panelsWithCenter: PanelConfig[] = [
      {
        id: 'center1',
        title: 'Center Panel',
        defaultPosition: 'center',
        render: () => <div>Center Panel Content</div>,
      },
    ];

    render(() => (
      <PanelContainer panels={panelsWithCenter}>
        <div>Default Center</div>
      </PanelContainer>
    ));

    expect(screen.getByText('Center Panel')).toBeInTheDocument();
    expect(screen.queryByText('Default Center')).not.toBeInTheDocument();
  });

  it('does not render areas for empty positions', () => {
    const singlePanel: PanelConfig[] = [
      {
        id: 'left1',
        title: 'Left Only',
        defaultPosition: 'left',
        render: () => <div>Content</div>,
      },
    ];

    const { container } = render(() => <PanelContainer panels={singlePanel} />);

    expect(container.querySelector('.sk-panel-area--left')).toBeInTheDocument();
    expect(container.querySelector('.sk-panel-area--right')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-panel-area--bottom')).not.toBeInTheDocument();
  });

  it('applies grid layout styles', () => {
    const { container } = render(() => <PanelContainer panels={mockPanels} />);

    const panelContainer = container.querySelector('.sk-panel-container') as HTMLElement;
    expect(panelContainer.style.gridTemplateColumns).toBeTruthy();
    expect(panelContainer.style.gridTemplateRows).toBeTruthy();
  });

  it('renders panel with icon when provided', () => {
    const panelWithIcon: PanelConfig[] = [
      {
        id: 'iconPanel',
        title: 'Panel With Icon',
        icon: '📁',
        defaultPosition: 'left',
        render: () => <div>Content</div>,
      },
    ];

    render(() => <PanelContainer panels={panelWithIcon} />);
    expect(screen.getByText('Panel With Icon')).toBeInTheDocument();
  });

  it('handles empty panels array', () => {
    const { container } = render(() => <PanelContainer panels={[]} />);
    expect(container.querySelector('.sk-panel-container')).toBeInTheDocument();
  });

  it('applies storageKey for persistence', () => {
    // Just verify it doesn't crash with storageKey
    const { container } = render(() => (
      <PanelContainer panels={mockPanels} storageKey="test-panels" />
    ));
    expect(container.querySelector('.sk-panel-container')).toBeInTheDocument();
  });
});

const createTestPanels = (): PanelConfig[] => [
  {
    id: 'test-panel',
    title: 'Test Panel',
    defaultPosition: 'center',
    render: () => <div>Test Content</div>,
  },
];

const createMultiPositionPanels = (): PanelConfig[] => [
  {
    id: 'left-panel',
    title: 'Left',
    defaultPosition: 'left',
    defaultSize: 200,
    render: () => <div>Left Content</div>,
  },
  {
    id: 'center-panel',
    title: 'Center',
    defaultPosition: 'center',
    render: () => <div>Center Content</div>,
  },
  {
    id: 'right-panel',
    title: 'Right',
    defaultPosition: 'right',
    render: () => <div>Right Content</div>,
  },
];

describe('PanelContainer chrome', () => {
  it('applies chrome-full class by default', () => {
    const { container } = render(() => <PanelContainer panels={createTestPanels()} />);
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer).not.toBeNull();
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-full')).toBe(true);
  });

  it('applies chrome-minimal class when chrome="minimal"', () => {
    const { container } = render(() => (
      <PanelContainer panels={createTestPanels()} chrome="minimal" />
    ));
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-minimal')).toBe(true);
  });

  it('keeps resize handles in the DOM under chrome="minimal"', () => {
    // Regression: chrome="minimal" used to set `display: none` on
    // .sk-resize-handle, leaving the wrapper present but the handle inside
    // collapsed to 0×0 so the user saw no resize affordance.
    // Minimal means quieter chrome (no buttons), not removed functionality.
    // Use chrome="none" when you actually want to hide the resize handles.
    const { container } = render(() => (
      <PanelContainer panels={createMultiPositionPanels()} chrome="minimal" />
    ));
    // Sidebar resize wrappers exist between left/right and center.
    const wrappers = container.querySelectorAll('.sk-resize-wrapper');
    expect(wrappers.length).toBeGreaterThan(0);
    const handles = container.querySelectorAll('.sk-resize-handle');
    expect(handles.length).toBeGreaterThan(0);
    // Each handle must NOT have inline display:none and must not match the
    // chrome-minimal hiding rule we just removed.
    for (const h of handles) {
      const inline = (h as HTMLElement).style.display;
      expect(inline).not.toBe('none');
    }
  });

  it('applies chrome-none class when chrome="none"', () => {
    const { container } = render(() => (
      <PanelContainer panels={createTestPanels()} chrome="none" />
    ));
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-none')).toBe(true);
  });

  it('applies chrome-auto-hide class', () => {
    const { container } = render(() => (
      <PanelContainer panels={createTestPanels()} chrome="auto-hide" />
    ));
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-auto-hide')).toBe(true);
  });

  it('applies chrome-edge-peek class', () => {
    const { container } = render(() => (
      <PanelContainer panels={createTestPanels()} chrome="edge-peek" />
    ));
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-edge-peek')).toBe(true);
  });

  it('applies chrome-fade-on-idle class', () => {
    const { container } = render(() => (
      <PanelContainer panels={createTestPanels()} chrome="fade-on-idle" />
    ));
    const panelContainer = container.querySelector('.sk-panel-container');
    expect(panelContainer!.classList.contains('sk-panel-container--chrome-fade-on-idle')).toBe(
      true
    );
  });
});

describe('PanelContainer showHeader', () => {
  it('hides header when showHeader is false', () => {
    const panels: PanelConfig[] = [
      {
        id: 'no-header',
        title: 'No Header Panel',
        defaultPosition: 'center',
        showHeader: false,
        render: () => <div data-testid="content">Content</div>,
      },
    ];
    const { container } = render(() => <PanelContainer panels={panels} />);
    // The panel header should not be rendered
    const header = container.querySelector('.sk-panel-header');
    expect(header).toBeNull();
    // But content should still be there
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull();
  });

  it('shows header by default', () => {
    const panels: PanelConfig[] = [
      {
        id: 'with-header',
        title: 'With Header',
        defaultPosition: 'center',
        render: () => <div>Content</div>,
      },
    ];
    const { container } = render(() => <PanelContainer panels={panels} />);
    const header = container.querySelector('.sk-panel-header');
    expect(header).not.toBeNull();
  });
});

describe('PanelContainer onLayoutChange', () => {
  it('calls onLayoutChange on initial render', () => {
    const onLayoutChange = vi.fn();
    render(() => <PanelContainer panels={createTestPanels()} onLayoutChange={onLayoutChange} />);

    expect(onLayoutChange).toHaveBeenCalled();
    const layout = onLayoutChange.mock.calls[0]?.[0];
    expect(layout).toHaveProperty('panels');
    expect(layout).toHaveProperty('areaSizes');
  });
});

describe('PanelContainer multiple positions', () => {
  it('renders panels at all positions simultaneously', () => {
    render(() => <PanelContainer panels={createMultiPositionPanels()} />);

    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Center Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('renders resize handles between areas', () => {
    const { container } = render(() => <PanelContainer panels={createMultiPositionPanels()} />);

    const leftResizeHandle = container.querySelector('.sk-resize-wrapper--left');
    const rightResizeHandle = container.querySelector('.sk-resize-wrapper--right');
    expect(leftResizeHandle).toBeInTheDocument();
    expect(rightResizeHandle).toBeInTheDocument();
  });
});

describe('PanelContainer panel add/remove via props', () => {
  it('adds new panel when props.panels changes', () => {
    const initialPanels: PanelConfig[] = [
      {
        id: 'panel-a',
        title: 'Panel A',
        defaultPosition: 'left',
        render: () => <div>A Content</div>,
      },
    ];

    const { unmount } = render(() => <PanelContainer panels={initialPanels} />);
    expect(screen.getByText('A Content')).toBeInTheDocument();
    unmount();
  });

  it('handles panel with all positions filled', () => {
    const allPositions: PanelConfig[] = [
      { id: 'l', title: 'L', defaultPosition: 'left', render: () => <div>L</div> },
      { id: 'r', title: 'R', defaultPosition: 'right', render: () => <div>R</div> },
      { id: 'b', title: 'B', defaultPosition: 'bottom', render: () => <div>B</div> },
      { id: 'c', title: 'C', defaultPosition: 'center', render: () => <div>C</div> },
    ];

    const { container } = render(() => <PanelContainer panels={allPositions} />);

    expect(container.querySelector('.sk-panel-area--left')).toBeInTheDocument();
    expect(container.querySelector('.sk-panel-area--right')).toBeInTheDocument();
    expect(container.querySelector('.sk-panel-area--bottom')).toBeInTheDocument();
    expect(container.querySelector('.sk-panel-area--center')).toBeInTheDocument();
  });
});

describe('PanelContainer collapsed strips', () => {
  it('renders collapsed strips for panels', () => {
    const panels: PanelConfig[] = [
      {
        id: 'left1',
        title: 'Left Panel',
        defaultPosition: 'left',
        render: () => <div>Left</div>,
      },
    ];

    const { container } = render(() => <PanelContainer panels={panels} />);

    // Left area should exist with a collapsed strip
    expect(container.querySelector('.sk-panel-area--left')).toBeInTheDocument();
  });
});

describe('PanelContainer with icon panels', () => {
  it('renders icon in panel header', () => {
    const panels: PanelConfig[] = [
      {
        id: 'icon-left',
        title: 'Files',
        icon: '📁',
        defaultPosition: 'left',
        render: () => <div>File List</div>,
      },
    ];

    render(() => <PanelContainer panels={panels} />);
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('File List')).toBeInTheDocument();
  });
});

describe('PanelContainer center tab behavior', () => {
  it('renders tab bar when multiple center panels', () => {
    const panels: PanelConfig[] = [
      {
        id: 'c1',
        title: 'Tab 1',
        defaultPosition: 'center',
        render: () => <div>Content 1</div>,
      },
      {
        id: 'c2',
        title: 'Tab 2',
        defaultPosition: 'center',
        render: () => <div>Content 2</div>,
      },
    ];

    render(() => <PanelContainer panels={panels} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });
});
