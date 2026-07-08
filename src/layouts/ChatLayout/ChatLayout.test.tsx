import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ChatLayout } from './ChatLayout';

describe('ChatLayout', () => {
  it('renders children', () => {
    render(() => (
      <ChatLayout>
        <div>Chat content</div>
      </ChatLayout>
    ));
    expect(screen.getByText('Chat content')).toBeInTheDocument();
  });

  it('renders sidebar when open', () => {
    render(() => (
      <ChatLayout sidebarOpen>
        <div>Content</div>
      </ChatLayout>
    ));
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    const tabs = [{ id: '1', name: 'Tab 1', status: 'idle' as const }];
    render(() => (
      <ChatLayout tabs={tabs} activeTabId="1">
        <div>Content</div>
      </ChatLayout>
    ));
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('has chat-layout testid', () => {
    render(() => (
      <ChatLayout>
        <div>Content</div>
      </ChatLayout>
    ));
    expect(screen.getByTestId('chat-layout')).toBeInTheDocument();
  });
});
