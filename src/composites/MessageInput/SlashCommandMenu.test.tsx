import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { SlashCommandMenu } from './SlashCommandMenu';
import { SlashCommand } from './types';

const mockCommands: SlashCommand[] = [
  { id: '1', name: 'help', description: 'Show help' },
  { id: '2', name: 'clear', description: 'Clear chat' },
  { id: '3', name: 'model', description: 'Switch model', icon: '🤖' },
];

describe('composites/MessageInput/SlashCommandMenu', () => {
  it('should not render when show is false', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={false}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown')).toBeNull();
  });

  it('should not render when commands is empty', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={[]}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown')).toBeNull();
  });

  it('should render dropdown when show is true and commands exist', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeNull();
  });

  it('should render all command items', () => {
    render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(screen.getByText('/help')).toBeInTheDocument();
    expect(screen.getByText('/clear')).toBeInTheDocument();
    expect(screen.getByText('/model')).toBeInTheDocument();
  });

  it('should render command descriptions', () => {
    render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(screen.getByText('Show help')).toBeInTheDocument();
    expect(screen.getByText('Clear chat')).toBeInTheDocument();
    expect(screen.getByText('Switch model')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    // The icon '🤖' for the model command
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('should highlight the selected item', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={1}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    expect(items[0]?.className).not.toContain('sk-message-input__dropdown-item--highlighted');
    expect(items[1]?.className).toContain('sk-message-input__dropdown-item--highlighted');
    expect(items[2]?.className).not.toContain('sk-message-input__dropdown-item--highlighted');
  });

  it('should call onSelect when a command is clicked', () => {
    const onSelect = vi.fn();
    render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={onSelect}
        onHover={vi.fn()}
      />
    ));

    fireEvent.click(screen.getByText('/clear'));
    expect(onSelect).toHaveBeenCalledWith(mockCommands[1]);
  });

  it('should call onHover with index on mouseEnter', () => {
    const onHover = vi.fn();
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={onHover}
      />
    ));

    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    fireEvent.mouseEnter(items[2]!);
    expect(onHover).toHaveBeenCalledWith(2);
  });

  it('should render correct number of items', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={mockCommands}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    expect(items.length).toBe(3);
  });

  it('should not render icon span when icon is not provided', () => {
    const { container } = render(() => (
      <SlashCommandMenu
        show={true}
        commands={[{ id: '1', name: 'test', description: 'Test cmd' }]}
        selectedIndex={0}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    ));
    expect(container.querySelector('.sk-message-input__dropdown-item-icon')).toBeNull();
  });
});
