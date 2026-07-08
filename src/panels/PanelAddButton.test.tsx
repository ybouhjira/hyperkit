import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PanelAddButton } from './PanelAddButton';
import type { PanelConfig } from './types';

const createHiddenPanels = (): PanelConfig[] => [
  {
    id: 'hidden-1',
    title: 'Hidden Panel A',
    icon: '📁',
    defaultPosition: 'left',
    render: () => <div>Content A</div>,
  },
  {
    id: 'hidden-2',
    title: 'Hidden Panel B',
    defaultPosition: 'right',
    render: () => <div>Content B</div>,
  },
];

describe('PanelAddButton', () => {
  it('renders add button when there are hidden panels', () => {
    render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    expect(screen.getByTitle('Add panel')).toBeInTheDocument();
  });

  it('does not render when hiddenPanels is empty', () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={[]} onAddPanel={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-add-button')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-panel-add-button-wrapper')).not.toBeInTheDocument();
  });

  it('does not show dropdown initially', () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-add-dropdown')).not.toBeInTheDocument();
  });

  it('shows dropdown when button is clicked', async () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    const addBtn = screen.getByTitle('Add panel');
    fireEvent.click(addBtn);

    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).toBeInTheDocument();
    });
  });

  it('shows dropdown header', async () => {
    render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(screen.getByText('Add Panel')).toBeInTheDocument();
    });
  });

  it('lists hidden panels in dropdown', async () => {
    render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(screen.getByText('Hidden Panel A')).toBeInTheDocument();
      expect(screen.getByText('Hidden Panel B')).toBeInTheDocument();
    });
  });

  it('calls onAddPanel with panel id and position when panel is selected', async () => {
    const onAddPanel = vi.fn();
    render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={onAddPanel} />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(screen.getByText('Hidden Panel A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Hidden Panel A'));

    expect(onAddPanel).toHaveBeenCalledWith('hidden-1', 'left');
  });

  it('closes dropdown after selecting a panel', async () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Hidden Panel A'));

    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).not.toBeInTheDocument();
    });
  });

  it('toggles dropdown on repeated clicks', async () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    const addBtn = screen.getByTitle('Add panel');

    // Open
    fireEvent.click(addBtn);
    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).toBeInTheDocument();
    });

    // Close
    fireEvent.click(addBtn);
    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).not.toBeInTheDocument();
    });
  });

  it('passes correct position for right panels', async () => {
    const onAddPanel = vi.fn();
    render(() => (
      <PanelAddButton
        position="right"
        hiddenPanels={createHiddenPanels()}
        onAddPanel={onAddPanel}
      />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(screen.getByText('Hidden Panel B')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Hidden Panel B'));

    expect(onAddPanel).toHaveBeenCalledWith('hidden-2', 'right');
  });

  it('renders icon for panels that have one', async () => {
    render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      const icons = document.querySelectorAll('.sk-panel-add-dropdown__icon');
      // Only hidden-1 has an icon
      expect(icons.length).toBe(1);
      expect(icons[0]!.textContent).toBe('📁');
    });
  });

  it('closes dropdown on click outside', async () => {
    const { container } = render(() => (
      <div>
        <div data-testid="outside">Outside Area</div>
        <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
      </div>
    ));

    fireEvent.click(screen.getByTitle('Add panel'));

    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).toBeInTheDocument();
    });

    // Click outside the wrapper
    fireEvent.mouseDown(screen.getByTestId('outside'));

    await vi.waitFor(() => {
      expect(container.querySelector('.sk-panel-add-dropdown')).not.toBeInTheDocument();
    });
  });

  it('renders wrapper element', () => {
    const { container } = render(() => (
      <PanelAddButton position="left" hiddenPanels={createHiddenPanels()} onAddPanel={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-add-button-wrapper')).toBeInTheDocument();
  });
});
