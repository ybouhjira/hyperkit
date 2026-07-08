import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { MessageList } from './MessageList';

const sampleMessages = [
  { id: '1', role: 'user' as const, content: 'Hello' },
  { id: '2', role: 'assistant' as const, content: 'Hi there!' },
  { id: '3', role: 'user' as const, content: 'How are you?' },
];

describe('MessageList', () => {
  it('renders messages', () => {
    render(() => <MessageList messages={sampleMessages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(() => <MessageList messages={[]} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });

  it('marks streaming message', () => {
    render(() => <MessageList messages={sampleMessages} streamingMessageId="2" />);
    expect(screen.getByText('Streaming...')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <MessageList messages={[]} class="h-96" />);
    expect(screen.getByTestId('message-list').className).toContain('h-96');
  });
});
