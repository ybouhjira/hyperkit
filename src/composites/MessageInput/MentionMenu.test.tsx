import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { MentionMenu } from './MentionMenu';
import type { MentionItem } from './types';

const mentions: MentionItem[] = [
  { id: '1', name: 'Alice', avatar: 'A' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie', avatar: 'C' },
];

describe('MentionMenu', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(() => (
      <MentionMenu
        show={false}
        mentions={mentions}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('renders nothing when mentions array is empty', () => {
    const { container } = render(() => (
      <MentionMenu
        show={true}
        mentions={[]}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('renders mention list when show is true and mentions exist', () => {
    const { container } = render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));

    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();
    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    expect(items.length).toBe(3);
  });

  it('displays mention names with @ prefix', () => {
    render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));

    expect(screen.getByText('@Alice')).toBeInTheDocument();
    expect(screen.getByText('@Bob')).toBeInTheDocument();
    expect(screen.getByText('@Charlie')).toBeInTheDocument();
  });

  it('displays avatar when provided', () => {
    render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('highlights the selected index', () => {
    const { container } = render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={1}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));

    const highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('@Bob');
  });

  it('calls onSelect when item clicked', async () => {
    const onSelect = vi.fn();
    render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={0}
        onSelect={onSelect}
        onHover={vi.fn()}
      />
    ));

    await fireEvent.click(screen.getByText('@Bob'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bob' }));
  });

  it('calls onHover when item is hovered', async () => {
    const onHover = vi.fn();
    const { container } = render(() => (
      <MentionMenu
        show={true}
        mentions={mentions}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={onHover}
      />
    ));

    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    await fireEvent.mouseEnter(items[2]!);
    expect(onHover).toHaveBeenCalledWith(2);
  });
});
