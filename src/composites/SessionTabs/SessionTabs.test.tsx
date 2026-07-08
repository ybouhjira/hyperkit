import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { SessionTabs } from './SessionTabs';

const tabs = [
  { id: '1', name: 'Session 1', status: 'idle' as const },
  { id: '2', name: 'Session 2', status: 'streaming' as const },
  { id: '3', name: 'Error Session', status: 'error' as const, unreadCount: 2 },
];

describe('SessionTabs', () => {
  it('renders all tabs', () => {
    render(() => <SessionTabs tabs={tabs} />);
    expect(screen.getByText('Session 1')).toBeInTheDocument();
    expect(screen.getByText('Session 2')).toBeInTheDocument();
    expect(screen.getByText('Error Session')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(() => <SessionTabs tabs={tabs} activeTabId="2" />);
    const activeTabs = screen.getAllByTestId('session-tab');
    const activeTab = activeTabs.find((t) => t.getAttribute('data-active') === 'true');
    expect(activeTab?.textContent).toContain('Session 2');
  });

  it('calls onTabSelect', async () => {
    const onTabSelect = vi.fn();
    render(() => <SessionTabs tabs={tabs} onTabSelect={onTabSelect} />);
    await fireEvent.click(screen.getByText('Session 1'));
    expect(onTabSelect).toHaveBeenCalledWith('1');
  });

  it('shows unread badge', () => {
    render(() => <SessionTabs tabs={tabs} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows close buttons when onTabClose provided', () => {
    const onTabClose = vi.fn();
    render(() => <SessionTabs tabs={tabs} onTabClose={onTabClose} />);
    const closeButtons = screen.getAllByTestId('tab-close');
    expect(closeButtons.length).toBe(3);
  });

  it('calls onTabClose on close click', async () => {
    const onTabClose = vi.fn();
    render(() => <SessionTabs tabs={tabs} onTabClose={onTabClose} />);
    const closeButtons = screen.getAllByTestId('tab-close');
    await fireEvent.click(closeButtons[0]);
    expect(onTabClose).toHaveBeenCalledWith('1');
  });

  it('shows new tab button when onNewTab provided', () => {
    render(() => <SessionTabs tabs={tabs} onNewTab={() => {}} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <SessionTabs tabs={[]} class="border-red" />);
    expect(screen.getByTestId('session-tabs').className).toContain('border-red');
  });
});
