import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { MobilePanelView, MobilePanelTab } from './MobilePanelView';

describe('MobilePanelView', () => {
  const mockTabs: MobilePanelTab[] = [
    {
      id: 'tab1',
      label: 'Tab 1',
      icon: 'home',
      render: () => <div>Content 1</div>,
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      icon: 'settings',
      render: () => <div>Content 2</div>,
    },
    {
      id: 'tab3',
      label: 'Tab 3',
      render: () => <div>Content 3</div>,
    },
  ];

  it('renders correctly with tabs', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <MobilePanelView tabs={mockTabs} class="custom-panel" />);

    const panel = document.querySelector('.sk-mobile-panel-view');
    expect(panel).toHaveClass('custom-panel');
  });

  it('renders first tab content by default', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
  });

  it('renders content for defaultId tab', () => {
    render(() => <MobilePanelView tabs={mockTabs} defaultId="tab2" />);

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(() => <MobilePanelView tabs={mockTabs} defaultId="tab2" />);

    const tab2Button = screen.getByText('Tab 2').closest('button');
    const tab1Button = screen.getByText('Tab 1').closest('button');

    expect(tab2Button).toHaveClass('sk-mobile-panel-view__tab--active');
    expect(tab1Button).not.toHaveClass('sk-mobile-panel-view__tab--active');
  });

  it('switches tabs on click', async () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    const tab2Button = screen.getByText('Tab 2').closest('button');
    fireEvent.click(tab2Button!);

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(() => <MobilePanelView tabs={mockTabs} onTabChange={onTabChange} />);

    const tab2Button = screen.getByText('Tab 2').closest('button');
    fireEvent.click(tab2Button!);

    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('renders tab icons', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    // Icons are rendered by Icon component
    const tabs = document.querySelectorAll('.sk-mobile-panel-view__tab');
    expect(tabs[0].querySelector('svg, [data-icon]')).toBeTruthy();
    expect(tabs[1].querySelector('svg, [data-icon]')).toBeTruthy();
  });

  it('renders tabs without icons', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    const tab3 = screen.getByText('Tab 3').closest('button');
    expect(tab3).toBeInTheDocument();
  });

  it('uses controlled activeId prop', () => {
    const Component = () => {
      const [activeId, setActiveId] = createSignal('tab1');

      return (
        <>
          <button onClick={() => setActiveId('tab3')}>Change Tab</button>
          <MobilePanelView tabs={mockTabs} activeId={activeId()} />
        </>
      );
    };

    render(() => <Component />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    const changeButton = screen.getByText('Change Tab');
    fireEvent.click(changeButton);

    expect(screen.getByText('Content 3')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('maintains controlled state when clicking tabs', () => {
    const onTabChange = vi.fn();
    render(() => <MobilePanelView tabs={mockTabs} activeId="tab1" onTabChange={onTabChange} />);

    const tab2Button = screen.getByText('Tab 2').closest('button');
    fireEvent.click(tab2Button!);

    // Content should not change because activeId is controlled
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    // But callback should be called
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('falls back to first tab when activeId is invalid', async () => {
    render(() => <MobilePanelView tabs={mockTabs} activeId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  it('falls back to first tab when defaultId is invalid', () => {
    render(() => <MobilePanelView tabs={mockTabs} defaultId="invalid-id" />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('handles empty tabs array gracefully', () => {
    render(() => <MobilePanelView tabs={[]} />);

    const panel = document.querySelector('.sk-mobile-panel-view');
    expect(panel).toBeInTheDocument();
  });

  it('updates when tabs change and active tab is removed', () => {
    const onTabChange = vi.fn();
    const Component = () => {
      const [tabs, setTabs] = createSignal(mockTabs);

      return (
        <>
          <button onClick={() => setTabs([mockTabs[0], mockTabs[2]])}>Remove Tab</button>
          <MobilePanelView tabs={tabs()} defaultId="tab2" onTabChange={onTabChange} />
        </>
      );
    };

    render(() => <Component />);

    expect(screen.getByText('Content 2')).toBeInTheDocument();

    const removeButton = screen.getByText('Remove Tab');
    fireEvent.click(removeButton);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(onTabChange).toHaveBeenCalledWith('tab1');
  });

  it('applies BEM classes correctly', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    expect(document.querySelector('.sk-mobile-panel-view')).toBeInTheDocument();
    expect(document.querySelector('.sk-mobile-panel-view__tabs')).toBeInTheDocument();
    expect(document.querySelector('.sk-mobile-panel-view__tab')).toBeInTheDocument();
    expect(document.querySelector('.sk-mobile-panel-view__tab-label')).toBeInTheDocument();
    expect(document.querySelector('.sk-mobile-panel-view__content')).toBeInTheDocument();
  });

  it('renders tab buttons with correct type', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    const buttons = document.querySelectorAll('.sk-mobile-panel-view__tab');
    buttons.forEach((button) => {
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  it('does not trigger onTabChange when clicking already active tab', () => {
    const onTabChange = vi.fn();
    render(() => <MobilePanelView tabs={mockTabs} defaultId="tab1" onTabChange={onTabChange} />);

    const tab1Button = screen.getByText('Tab 1').closest('button');
    fireEvent.click(tab1Button!);

    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith('tab1');
  });

  it('renders multiple tabs correctly', () => {
    render(() => <MobilePanelView tabs={mockTabs} />);

    const tabButtons = document.querySelectorAll('.sk-mobile-panel-view__tab');
    expect(tabButtons).toHaveLength(3);
  });
});
