import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { PromptQueue, type QueuedPrompt } from './PromptQueue';

describe('PromptQueue', () => {
  const mockItems: QueuedPrompt[] = [
    { id: '1', text: 'First message', addedAt: Date.now() - 300000 },
    { id: '2', text: 'Second message', addedAt: Date.now() - 180000 },
    { id: '3', text: 'Third message', addedAt: Date.now() - 60000 },
  ];

  it('renders empty state when no items', () => {
    render(() => <PromptQueue items={[]} onRemove={vi.fn()} />);

    expect(screen.getByText('No queued messages')).toBeInTheDocument();
    expect(screen.getByText('Messages will appear here when queued')).toBeInTheDocument();
  });

  it('renders all items in the queue', () => {
    render(() => <PromptQueue items={mockItems} onRemove={vi.fn()} />);

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('displays position indicators', () => {
    render(() => <PromptQueue items={mockItems} onRemove={vi.fn()} />);

    const positions = screen.getAllByTestId('prompt-queue-position');
    expect(positions).toHaveLength(3);
    expect(positions[0]).toHaveTextContent('1');
    expect(positions[1]).toHaveTextContent('2');
    expect(positions[2]).toHaveTextContent('3');
  });

  it('truncates long text at ~50 characters', () => {
    const longTextItem: QueuedPrompt = {
      id: '1',
      text: 'This is a very long message that should be truncated at around 50 characters to prevent UI overflow',
    };
    render(() => <PromptQueue items={[longTextItem]} onRemove={vi.fn()} />);

    const text = screen.getByText(/This is a very long message that should be truncat\.\.\./);
    expect(text).toBeInTheDocument();
    expect(text.textContent?.length).toBeLessThanOrEqual(53); // 50 + '...'
  });

  it('shows full text in title attribute for truncated text', () => {
    const longTextItem: QueuedPrompt = {
      id: '1',
      text: 'This is a very long message that should be truncated',
    };
    render(() => <PromptQueue items={[longTextItem]} onRemove={vi.fn()} />);

    const textElement = screen.getByTitle(longTextItem.text);
    expect(textElement).toBeInTheDocument();
  });

  it('displays timestamps when provided', () => {
    render(() => <PromptQueue items={mockItems} onRemove={vi.fn()} />);

    const timestamps = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it('does not display timestamps when not provided', () => {
    const itemsWithoutTimestamps: QueuedPrompt[] = [
      { id: '1', text: 'First message' },
      { id: '2', text: 'Second message' },
    ];
    render(() => <PromptQueue items={itemsWithoutTimestamps} onRemove={vi.fn()} />);

    const timestamps = screen.queryAllByText(/\d{1,2}:\d{2}:\d{2}/);
    expect(timestamps).toHaveLength(0);
  });

  it('calls onRemove with correct id when remove button clicked', () => {
    const onRemove = vi.fn();
    render(() => <PromptQueue items={mockItems} onRemove={onRemove} />);

    const removeButton = screen.getByTestId('prompt-queue-remove-2');
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('2');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show remove buttons when onRemove is not provided', () => {
    render(() => <PromptQueue items={mockItems} />);

    const removeButtons = screen.queryAllByLabelText(/Remove message/);
    expect(removeButtons).toHaveLength(0);
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <PromptQueue items={mockItems} onRemove={vi.fn()} class="custom-class" />
    ));

    const queue = container.querySelector('.sk-prompt-queue');
    expect(queue).toHaveClass('custom-class');
  });

  it('each item has unique data-testid', () => {
    render(() => <PromptQueue items={mockItems} onRemove={vi.fn()} />);

    expect(screen.getByTestId('prompt-queue-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-queue-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-queue-item-3')).toBeInTheDocument();
  });

  it('handles single item correctly', () => {
    const singleItem: QueuedPrompt[] = [{ id: '1', text: 'Only message' }];
    render(() => <PromptQueue items={singleItem} onRemove={vi.fn()} />);

    expect(screen.getByText('Only message')).toBeInTheDocument();
    const positions = screen.getAllByTestId('prompt-queue-position');
    expect(positions).toHaveLength(1);
    expect(positions[0]).toHaveTextContent('1');
  });

  it('does not truncate short text', () => {
    const shortItem: QueuedPrompt = {
      id: '1',
      text: 'Short',
    };
    render(() => <PromptQueue items={[shortItem]} onRemove={vi.fn()} />);

    const text = screen.getByText('Short');
    expect(text).toBeInTheDocument();
    expect(text.textContent).toBe('Short');
  });
});
