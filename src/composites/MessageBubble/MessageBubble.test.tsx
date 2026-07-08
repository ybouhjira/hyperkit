import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(() => <MessageBubble role="user" content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders markdown as HTML', () => {
    const { container } = render(() => <MessageBubble role="assistant" content="**bold text**" />);
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('bold text');
  });

  it('shows role label', () => {
    render(() => <MessageBubble role="assistant" content="Hi" />);
    expect(screen.getByText('assistant')).toBeInTheDocument();
  });

  it('shows user role styling', () => {
    render(() => <MessageBubble role="user" content="Test" />);
    expect(screen.getByTestId('message-bubble').getAttribute('data-role')).toBe('user');
  });

  it('shows streaming indicator', () => {
    render(() => <MessageBubble role="assistant" content="Thinking..." isStreaming />);
    expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    expect(screen.getByText('Streaming...')).toBeInTheDocument();
  });

  it('hides copy button while streaming', () => {
    render(() => <MessageBubble role="assistant" content="..." isStreaming />);
    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
  });

  it('shows copy button when not streaming', () => {
    render(() => <MessageBubble role="assistant" content="Done" />);
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('calls onCopy when copy clicked', async () => {
    const onCopy = vi.fn();
    render(() => <MessageBubble role="assistant" content="text" onCopy={onCopy} />);
    await fireEvent.click(screen.getByTestId('copy-button'));
    expect(onCopy).toHaveBeenCalled();
  });

  it('shows timestamp when provided', () => {
    const date = new Date(2026, 0, 1, 14, 30);
    render(() => <MessageBubble role="user" content="Hi" timestamp={date} />);
    // Check for time display (format varies by locale, just check it renders)
    expect(screen.getByTestId('message-bubble').textContent).toContain('30');
  });

  it('applies custom class', () => {
    render(() => <MessageBubble role="user" content="Hi" class="extra" />);
    expect(screen.getByTestId('message-bubble').className).toContain('extra');
  });

  // Borderless variant tests
  it('renders borderless variant with avatar and name', () => {
    render(() => (
      <MessageBubble
        role="user"
        content="Hello"
        variant="borderless"
        avatarText="Y"
        displayName="You"
      />
    ));
    const bubble = screen.getByTestId('message-bubble');
    expect(bubble.className).toContain('sk-message--borderless');
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('hides footer in borderless variant', () => {
    const { container } = render(() => (
      <MessageBubble role="assistant" content="Hi" variant="borderless" />
    ));
    expect(container.querySelector('.sk-message__footer')).toBeNull();
  });

  it('uses default avatar text when not provided', () => {
    render(() => <MessageBubble role="assistant" content="Hi" variant="borderless" />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders default variant when variant prop is omitted', () => {
    const { container } = render(() => <MessageBubble role="user" content="Test" />);
    expect(container.querySelector('.sk-message--borderless')).toBeNull();
    expect(container.querySelector('.sk-message__footer')).not.toBeNull();
  });
});
