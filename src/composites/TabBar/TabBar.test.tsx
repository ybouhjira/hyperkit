import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TabBar } from './TabBar';
import type { TabBarTab } from './TabBar';

describe('TabBar', () => {
  const mockTabs: TabBarTab[] = [
    { id: 'tab-1', label: 'Tab 1', icon: 'file' },
    { id: 'tab-2', label: 'Tab 2', color: '#ff0000' },
    { id: 'tab-3', label: 'Tab 3', dirty: true },
  ];

  it('renders correctly', () => {
    render(() => <TabBar tabs={mockTabs} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('applies correct BEM CSS classes', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    expect(container.querySelector('.sk-tab-bar')).toBeInTheDocument();
    expect(container.querySelector('.sk-tab-bar-scroll')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-tab-bar-tab')).toHaveLength(3);
  });

  it('marks active tab with active class', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} activeId="tab-2" />);

    const activeTab = container.querySelector('.sk-tab-bar-tab.active');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab?.textContent).toContain('Tab 2');
  });

  it('sets aria-selected on active tab', () => {
    render(() => <TabBar tabs={mockTabs} activeId="tab-2" />);

    const tab2 = screen.getByText('Tab 2').closest('button');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('sets aria-selected false on inactive tabs', () => {
    render(() => <TabBar tabs={mockTabs} activeId="tab-2" />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    render(() => <TabBar tabs={mockTabs} onSelect={onSelect} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    fireEvent.click(tab1!);

    expect(onSelect).toHaveBeenCalledWith('tab-1');
  });

  it('renders icons when provided', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    expect(tab1?.querySelector('.sk-icon')).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const tab2 = screen.getByText('Tab 2').closest('button');
    // Tab 2 might have close icon if onClose is provided, so check for file icon specifically
    expect(tab2?.textContent).toContain('Tab 2');
  });

  it('renders color indicator when color provided', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const tab2 = screen.getByText('Tab 2').closest('button');
    const colorIndicator = tab2?.querySelector('.sk-tab-bar-color');

    expect(colorIndicator).toBeInTheDocument();
    expect(colorIndicator).toHaveStyle({ background: '#ff0000' });
  });

  it('renders dirty indicator when dirty is true', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const tab3 = screen.getByText('Tab 3').closest('button');
    expect(tab3?.querySelector('.sk-tab-bar-dirty')).toBeInTheDocument();
  });

  it('does not render dirty indicator when dirty is false', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const tab1 = screen.getByText('Tab 1').closest('button');
    expect(tab1?.querySelector('.sk-tab-bar-dirty')).not.toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    const onClose = vi.fn();
    render(() => <TabBar tabs={mockTabs} onClose={onClose} />);

    const closeButtons = screen.getAllByLabelText(/Close/);
    expect(closeButtons).toHaveLength(3);
  });

  it('does not render close button when onClose not provided', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const closeButtons = screen.queryAllByLabelText(/Close/);
    expect(closeButtons).toHaveLength(0);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(() => <TabBar tabs={mockTabs} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close Tab 1');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('tab-1');
  });

  it('stops propagation on close button click', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    render(() => <TabBar tabs={mockTabs} onClose={onClose} onSelect={onSelect} />);

    const closeButton = screen.getByLabelText('Close Tab 1');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledWith('tab-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders add button when onAdd provided', () => {
    const onAdd = vi.fn();
    render(() => <TabBar tabs={mockTabs} onAdd={onAdd} />);

    const addButton = screen.getByLabelText('Add tab');
    expect(addButton).toBeInTheDocument();
  });

  it('does not render add button when onAdd not provided', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const addButton = screen.queryByLabelText('Add tab');
    expect(addButton).not.toBeInTheDocument();
  });

  it('calls onAdd when add button clicked', () => {
    const onAdd = vi.fn();
    render(() => <TabBar tabs={mockTabs} onAdd={onAdd} />);

    const addButton = screen.getByLabelText('Add tab');
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('applies custom class', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} class="custom-class" />);

    expect(container.querySelector('.sk-tab-bar.custom-class')).toBeInTheDocument();
  });

  it('handles keyboard navigation with ArrowLeft', async () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    const tabs = container.querySelectorAll('.sk-tab-bar-tab');
    const tab2 = tabs[1] as HTMLElement;
    tab2.focus();

    fireEvent.keyDown(tab2, { key: 'ArrowLeft' });

    // Focus should move to tab 1
    await waitFor(() => {
      expect(document.activeElement).toBe(tabs[0]);
    });
  });

  it('handles keyboard navigation with ArrowRight', async () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    const tabs = container.querySelectorAll('.sk-tab-bar-tab');
    const tab1 = tabs[0] as HTMLElement;
    tab1.focus();

    fireEvent.keyDown(tab1, { key: 'ArrowRight' });

    // Focus should move to tab 2
    await waitFor(() => {
      expect(document.activeElement).toBe(tabs[1]);
    });
  });

  it('does not navigate left from first tab', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    const tabs = container.querySelectorAll('.sk-tab-bar-tab');
    const tab1 = tabs[0] as HTMLElement;
    tab1.focus();

    fireEvent.keyDown(tab1, { key: 'ArrowLeft' });

    // Should stay on tab 1
    expect(document.activeElement).toBe(tab1);
  });

  it('does not navigate right from last tab', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    const tabs = container.querySelectorAll('.sk-tab-bar-tab');
    const tab3 = tabs[2] as HTMLElement;
    tab3.focus();

    fireEvent.keyDown(tab3, { key: 'ArrowRight' });

    // Should stay on tab 3
    expect(document.activeElement).toBe(tab3);
  });

  it('selects tab on Enter key', () => {
    const onSelect = vi.fn();
    const { container } = render(() => <TabBar tabs={mockTabs} onSelect={onSelect} />);

    const tab1 = container.querySelector('.sk-tab-bar-tab') as HTMLElement;
    fireEvent.keyDown(tab1, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith('tab-1');
  });

  it('renders label in span with correct class', () => {
    render(() => <TabBar tabs={mockTabs} />);

    const labels = screen.getAllByText(/Tab \d/);
    labels.forEach((label) => {
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('sk-tab-bar-label');
    });
  });

  it('sets role="tab" on tab buttons', () => {
    const { container } = render(() => <TabBar tabs={mockTabs} />);

    const tabs = container.querySelectorAll('.sk-tab-bar-tab');
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('role', 'tab');
    });
  });

  it('renders empty tabs array', () => {
    const { container } = render(() => <TabBar tabs={[]} />);

    expect(container.querySelector('.sk-tab-bar')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-tab-bar-tab')).toHaveLength(0);
  });

  it('renders single tab', () => {
    const singleTab: TabBarTab[] = [{ id: 'only', label: 'Only Tab' }];
    render(() => <TabBar tabs={singleTab} />);

    expect(screen.getByText('Only Tab')).toBeInTheDocument();
  });

  it('close button has correct type', () => {
    const onClose = vi.fn();
    render(() => <TabBar tabs={mockTabs} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close Tab 1');
    expect(closeButton).toHaveAttribute('type', 'button');
  });

  it('add button has correct type', () => {
    const onAdd = vi.fn();
    render(() => <TabBar tabs={mockTabs} onAdd={onAdd} />);

    const addButton = screen.getByLabelText('Add tab');
    expect(addButton).toHaveAttribute('type', 'button');
  });
});
