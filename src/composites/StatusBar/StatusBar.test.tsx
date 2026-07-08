import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { StatusBar } from './StatusBar';
import type { StatusBarItem } from './StatusBar';

describe('StatusBar', () => {
  const mockLeftItems: StatusBarItem[] = [
    { id: 'left-1', text: 'Left 1', align: 'left', priority: 1 },
    { id: 'left-2', text: 'Left 2', align: 'left', priority: 2 },
  ];

  const mockRightItems: StatusBarItem[] = [
    { id: 'right-1', text: 'Right 1', align: 'right', priority: 1 },
    { id: 'right-2', text: 'Right 2', align: 'right', priority: 2 },
  ];

  it('renders correctly', () => {
    render(() => <StatusBar items={[...mockLeftItems, ...mockRightItems]} />);

    expect(screen.getByText('Left 1')).toBeInTheDocument();
    expect(screen.getByText('Left 2')).toBeInTheDocument();
    expect(screen.getByText('Right 1')).toBeInTheDocument();
    expect(screen.getByText('Right 2')).toBeInTheDocument();
  });

  it('applies correct BEM CSS classes', () => {
    const { container } = render(() => <StatusBar items={mockLeftItems} />);

    expect(container.querySelector('.sk-status-bar')).toBeInTheDocument();
    expect(container.querySelector('.sk-status-bar__section--left')).toBeInTheDocument();
    expect(container.querySelector('.sk-status-bar__section--right')).toBeInTheDocument();
  });

  it('renders items in left section', () => {
    const { container } = render(() => <StatusBar items={mockLeftItems} />);

    const leftSection = container.querySelector('.sk-status-bar__section--left');
    expect(leftSection).toBeInTheDocument();
    expect(leftSection?.textContent).toContain('Left 1');
    expect(leftSection?.textContent).toContain('Left 2');
  });

  it('renders items in right section', () => {
    const { container } = render(() => <StatusBar items={mockRightItems} />);

    const rightSection = container.querySelector('.sk-status-bar__section--right');
    expect(rightSection).toBeInTheDocument();
    expect(rightSection?.textContent).toContain('Right 1');
    expect(rightSection?.textContent).toContain('Right 2');
  });

  it('sorts left items by priority', () => {
    const items: StatusBarItem[] = [
      { id: '1', text: 'Third', align: 'left', priority: 3 },
      { id: '2', text: 'First', align: 'left', priority: 1 },
      { id: '3', text: 'Second', align: 'left', priority: 2 },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    const leftSection = container.querySelector('.sk-status-bar__section--left');
    const textContent = leftSection?.textContent || '';

    const firstIndex = textContent.indexOf('First');
    const secondIndex = textContent.indexOf('Second');
    const thirdIndex = textContent.indexOf('Third');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  it('sorts right items by priority', () => {
    const items: StatusBarItem[] = [
      { id: '1', text: 'Third', align: 'right', priority: 3 },
      { id: '2', text: 'First', align: 'right', priority: 1 },
      { id: '3', text: 'Second', align: 'right', priority: 2 },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    const rightSection = container.querySelector('.sk-status-bar__section--right');
    const textContent = rightSection?.textContent || '';

    const firstIndex = textContent.indexOf('First');
    const secondIndex = textContent.indexOf('Second');
    const thirdIndex = textContent.indexOf('Third');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  it('renders text when provided', () => {
    const items: StatusBarItem[] = [{ id: '1', text: 'Test Text', align: 'left', priority: 1 }];

    render(() => <StatusBar items={items} />);

    const textElement = screen.getByText('Test Text');
    expect(textElement).toHaveClass('sk-status-bar__text');
  });

  it('renders string icon when provided', () => {
    const items: StatusBarItem[] = [{ id: '1', icon: '✓', align: 'left', priority: 1 }];

    const { container } = render(() => <StatusBar items={items} />);

    const iconElement = container.querySelector('.sk-status-bar__icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement?.textContent).toBe('✓');
  });

  it('renders JSX element icon when provided', () => {
    const items: StatusBarItem[] = [
      { id: '1', icon: <span class="custom-icon">Icon</span>, align: 'left', priority: 1 },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.custom-icon')).toBeInTheDocument();
  });

  it('renders clickable item as button', () => {
    const onClick = vi.fn();
    const items: StatusBarItem[] = [
      { id: '1', text: 'Clickable', onClick, align: 'left', priority: 1 },
    ];

    render(() => <StatusBar items={items} />);

    const button = screen.getByText('Clickable').closest('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('sk-status-bar__item--clickable');
  });

  it('renders non-clickable item as span', () => {
    const items: StatusBarItem[] = [{ id: '1', text: 'Non-clickable', align: 'left', priority: 1 }];

    const { container } = render(() => <StatusBar items={items} />);

    // Non-clickable items are wrapped in span.sk-status-bar__item
    const item = container.querySelector(
      '.sk-status-bar__item:not(.sk-status-bar__item--clickable)'
    );
    expect(item).toBeInTheDocument();
    expect(item?.tagName).toBe('SPAN');
    expect(screen.getByText('Non-clickable')).toBeInTheDocument();
  });

  it('calls onClick when clickable item clicked', () => {
    const onClick = vi.fn();
    const items: StatusBarItem[] = [
      { id: '1', text: 'Clickable', onClick, align: 'left', priority: 1 },
    ];

    render(() => <StatusBar items={items} />);

    const button = screen.getByText('Clickable').closest('button');
    fireEvent.click(button!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders tooltip when provided', () => {
    const items: StatusBarItem[] = [
      { id: '1', text: 'Item', tooltip: 'Tooltip text', align: 'left', priority: 1 },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.sk-status-bar__tooltip-trigger')).toBeInTheDocument();
  });

  it('does not render tooltip when not provided', () => {
    const items: StatusBarItem[] = [{ id: '1', text: 'Item', align: 'left', priority: 1 }];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.sk-status-bar__tooltip-trigger')).not.toBeInTheDocument();
  });

  it('uses custom render function when provided', () => {
    const items: StatusBarItem[] = [
      {
        id: '1',
        align: 'left',
        priority: 1,
        render: () => <div class="custom-render">Custom Content</div>,
      },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.custom-render')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('custom render overrides text and icon', () => {
    const items: StatusBarItem[] = [
      {
        id: '1',
        text: 'Should not appear',
        icon: 'X',
        align: 'left',
        priority: 1,
        render: () => <div>Custom</div>,
      },
    ];

    render(() => <StatusBar items={items} />);

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <StatusBar items={mockLeftItems} class="custom-class" />);

    expect(container.querySelector('.sk-status-bar.custom-class')).toBeInTheDocument();
  });

  it('renders both text and icon together', () => {
    const items: StatusBarItem[] = [
      { id: '1', text: 'Text', icon: '✓', align: 'left', priority: 1 },
    ];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.sk-status-bar__icon')).toBeInTheDocument();
    expect(container.querySelector('.sk-status-bar__text')).toBeInTheDocument();
  });

  it('renders empty when no items provided', () => {
    const { container } = render(() => <StatusBar items={[]} />);

    expect(container.querySelector('.sk-status-bar')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-status-bar__item')).toHaveLength(0);
  });

  it('sets button type to button for clickable items', () => {
    const items: StatusBarItem[] = [
      { id: '1', text: 'Clickable', onClick: vi.fn(), align: 'left', priority: 1 },
    ];

    render(() => <StatusBar items={items} />);

    const button = screen.getByText('Clickable').closest('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders items with only icon', () => {
    const items: StatusBarItem[] = [{ id: '1', icon: '✓', align: 'left', priority: 1 }];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.sk-status-bar__icon')).toBeInTheDocument();
    expect(container.querySelector('.sk-status-bar__text')).not.toBeInTheDocument();
  });

  it('renders items with only text', () => {
    const items: StatusBarItem[] = [{ id: '1', text: 'Only text', align: 'left', priority: 1 }];

    const { container } = render(() => <StatusBar items={items} />);

    expect(container.querySelector('.sk-status-bar__text')).toBeInTheDocument();
    expect(container.querySelector('.sk-status-bar__icon')).not.toBeInTheDocument();
  });
});
