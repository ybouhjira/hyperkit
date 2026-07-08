import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PanelTabBar } from './PanelTabBar';

const createTabs = () => [
  { id: 'tab-1', title: 'Editor', icon: '📝' },
  { id: 'tab-2', title: 'Terminal', icon: '💻' },
  { id: 'tab-3', title: 'Output' },
];

describe('PanelTabBar', () => {
  it('renders without crashing', () => {
    const { container } = render(() => (
      <PanelTabBar tabs={createTabs()} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-tab-bar')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(() => <PanelTabBar tabs={createTabs()} activeTabId="tab-1" onTabClick={vi.fn()} />);

    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('marks active tab with active class', () => {
    const { container } = render(() => (
      <PanelTabBar tabs={createTabs()} activeTabId="tab-2" onTabClick={vi.fn()} />
    ));

    const tabs = container.querySelectorAll('.sk-panel-tab-bar__tab');
    expect(tabs[0]!.classList.contains('sk-panel-tab-bar__tab--active')).toBe(false);
    expect(tabs[1]!.classList.contains('sk-panel-tab-bar__tab--active')).toBe(true);
    expect(tabs[2]!.classList.contains('sk-panel-tab-bar__tab--active')).toBe(false);
  });

  it('calls onTabClick with tab id when clicked', () => {
    const onTabClick = vi.fn();
    render(() => <PanelTabBar tabs={createTabs()} activeTabId="tab-1" onTabClick={onTabClick} />);

    fireEvent.click(screen.getByText('Terminal'));

    expect(onTabClick).toHaveBeenCalledWith('tab-2');
  });

  it('renders icon when tab has string icon', () => {
    const { container } = render(() => (
      <PanelTabBar tabs={createTabs()} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    const icons = container.querySelectorAll('.sk-panel-tab-bar__icon');
    // Editor and Terminal have icons, Output does not
    expect(icons.length).toBe(2);
    expect(icons[0]!.textContent).toBe('📝');
    expect(icons[1]!.textContent).toBe('💻');
  });

  it('renders icon when tab has function icon', () => {
    const tabs = [
      { id: 'tab-1', title: 'Custom', icon: () => <span data-testid="custom-icon">X</span> },
    ];

    render(() => <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render icon when tab has no icon', () => {
    const tabs = [{ id: 'tab-1', title: 'No Icon' }];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-tab-bar__icon')).not.toBeInTheDocument();
  });

  it('renders pinned indicator for pinned tabs', () => {
    const tabs = [
      { id: 'tab-1', title: 'Pinned Tab', pinned: true },
      { id: 'tab-2', title: 'Normal Tab', pinned: false },
    ];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    const pinnedIndicators = container.querySelectorAll('.sk-panel-tab-bar__pin-indicator');
    expect(pinnedIndicators.length).toBe(1);

    const pinnedTab = container.querySelectorAll('.sk-panel-tab-bar__tab--pinned');
    expect(pinnedTab.length).toBe(1);
  });

  it('calls onPin when pin action is clicked on unpinned tab', () => {
    const onPin = vi.fn();
    const tabs = [{ id: 'tab-1', title: 'Unpinned', pinned: false }];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} onPin={onPin} />
    ));

    const pinAction = container.querySelector('.sk-panel-tab-bar__pin-action') as HTMLElement;
    fireEvent.click(pinAction);

    expect(onPin).toHaveBeenCalledWith('tab-1');
  });

  it('calls onUnpin when unpin action is clicked on pinned tab', () => {
    const onUnpin = vi.fn();
    const tabs = [{ id: 'tab-1', title: 'Pinned', pinned: true }];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} onUnpin={onUnpin} />
    ));

    const pinAction = container.querySelector('.sk-panel-tab-bar__pin-action') as HTMLElement;
    fireEvent.click(pinAction);

    expect(onUnpin).toHaveBeenCalledWith('tab-1');
  });

  it('pin action click does not trigger onTabClick', () => {
    const onTabClick = vi.fn();
    const tabs = [{ id: 'tab-1', title: 'Tab', pinned: false }];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={onTabClick} onPin={vi.fn()} />
    ));

    const pinAction = container.querySelector('.sk-panel-tab-bar__pin-action') as HTMLElement;
    fireEvent.click(pinAction);

    // onTabClick should NOT be called since the pin action calls stopPropagation
    expect(onTabClick).not.toHaveBeenCalled();
  });

  it('renders with empty tabs array', () => {
    const { container } = render(() => (
      <PanelTabBar tabs={[]} activeTabId="" onTabClick={vi.fn()} />
    ));

    expect(container.querySelector('.sk-panel-tab-bar')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-panel-tab-bar__tab').length).toBe(0);
  });

  it('shows unpin icon on pinned tab and pin icon on unpinned tab', () => {
    const tabs = [
      { id: 'tab-1', title: 'Pinned', pinned: true },
      { id: 'tab-2', title: 'Unpinned', pinned: false },
    ];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    const pinActions = container.querySelectorAll('.sk-panel-tab-bar__pin-action');
    // Pinned tab should show unpin (✕), unpinned should show pin (📌)
    expect(pinActions[0]!.textContent).toBe('✕');
    expect(pinActions[1]!.textContent).toBe('📌');
  });

  it('renders pin action with correct title attribute', () => {
    const tabs = [
      { id: 'tab-1', title: 'Pinned', pinned: true },
      { id: 'tab-2', title: 'Unpinned', pinned: false },
    ];

    const { container } = render(() => (
      <PanelTabBar tabs={tabs} activeTabId="tab-1" onTabClick={vi.fn()} />
    ));

    const pinActions = container.querySelectorAll('.sk-panel-tab-bar__pin-action');
    expect(pinActions[0]!.getAttribute('title')).toBe('Unpin tab');
    expect(pinActions[1]!.getAttribute('title')).toBe('Pin tab');
  });
});
