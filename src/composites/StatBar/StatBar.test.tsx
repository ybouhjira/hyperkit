import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { StatBar } from './StatBar';
import type { StatBarItem } from './StatBar';

describe('StatBar', () => {
  const mockItems: StatBarItem[] = [
    { label: 'Revenue', value: '$125,430', variant: 'success' },
    { label: 'Users', value: '2,543', variant: 'info' },
    { label: 'Orders', value: 842, variant: 'default' },
  ];

  it('renders all items', () => {
    render(() => <StatBar items={mockItems} />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$125,430')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('2,543')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('842')).toBeInTheDocument();
  });

  it('applies default class', () => {
    const { container } = render(() => <StatBar items={mockItems} />);

    expect(container.querySelector('.sk-stat-bar')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <StatBar items={mockItems} class="custom-stat-bar" />);

    expect(container.querySelector('.sk-stat-bar.custom-stat-bar')).toBeInTheDocument();
  });

  it('applies unstyled prop', () => {
    const { container } = render(() => <StatBar items={mockItems} unstyled />);

    expect(container.querySelector('.sk-stat-bar')).not.toBeInTheDocument();
  });

  it('renders horizontal layout by default', () => {
    const { container } = render(() => <StatBar items={mockItems} />);

    expect(container.querySelector('.sk-stat-bar--vertical')).not.toBeInTheDocument();
  });

  it('renders vertical layout when specified', () => {
    const { container } = render(() => <StatBar items={mockItems} direction="vertical" />);

    expect(container.querySelector('.sk-stat-bar--vertical')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(() => <StatBar items={mockItems} />);

    const items = container.querySelectorAll('.sk-stat-bar__item');
    expect(items[0]).toHaveClass('sk-stat-bar__item--success');
    expect(items[1]).toHaveClass('sk-stat-bar__item--info');
    expect(items[2]).toHaveClass('sk-stat-bar__item--default');
  });

  it('renders icons when provided', () => {
    const itemsWithIcons: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', icon: <span data-testid="icon-revenue">💰</span> },
      { label: 'Users', value: '2,543' },
    ];

    render(() => <StatBar items={itemsWithIcons} />);

    expect(screen.getByTestId('icon-revenue')).toBeInTheDocument();
  });

  it('renders trends when provided', () => {
    const itemsWithTrends: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', trend: '+12.5%', trendDirection: 'up' },
      { label: 'Users', value: '2,543', trend: '-3.2%', trendDirection: 'down' },
      { label: 'Orders', value: 842, trend: '0%', trendDirection: 'neutral' },
    ];

    render(() => <StatBar items={itemsWithTrends} />);

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('-3.2%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies trend direction classes', () => {
    const itemsWithTrends: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', trend: '+12.5%', trendDirection: 'up' },
      { label: 'Users', value: '2,543', trend: '-3.2%', trendDirection: 'down' },
      { label: 'Orders', value: 842, trend: '0%', trendDirection: 'neutral' },
    ];

    const { container } = render(() => <StatBar items={itemsWithTrends} />);

    const trends = container.querySelectorAll('.sk-stat-bar__trend');
    expect(trends[0]).toHaveClass('sk-stat-bar__trend--up');
    expect(trends[1]).toHaveClass('sk-stat-bar__trend--down');
    expect(trends[2]).toHaveClass('sk-stat-bar__trend--neutral');
  });

  it('renders trend arrows', () => {
    const itemsWithTrends: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', trend: '+12.5%', trendDirection: 'up' },
      { label: 'Users', value: '2,543', trend: '-3.2%', trendDirection: 'down' },
    ];

    const { container } = render(() => <StatBar items={itemsWithTrends} />);

    const arrows = container.querySelectorAll('.sk-stat-bar__trend-arrow');
    expect(arrows[0].textContent).toBe('↑');
    expect(arrows[1].textContent).toBe('↓');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const clickableItems: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', onClick },
      { label: 'Users', value: '2,543' },
    ];

    render(() => <StatBar items={clickableItems} />);

    const revenueItem = screen.getByText('Revenue').closest('.sk-stat-bar__item');
    fireEvent.click(revenueItem!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies clickable class when onClick is provided', () => {
    const clickableItems: StatBarItem[] = [
      { label: 'Revenue', value: '$125,430', onClick: () => {} },
      { label: 'Users', value: '2,543' },
    ];

    const { container } = render(() => <StatBar items={clickableItems} />);

    const items = container.querySelectorAll('.sk-stat-bar__item');
    expect(items[0]).toHaveClass('sk-stat-bar__item--clickable');
    expect(items[1]).not.toHaveClass('sk-stat-bar__item--clickable');
  });

  it('applies size variants', () => {
    const { container, unmount } = render(() => <StatBar items={mockItems} size="sm" />);

    let statBar = container.querySelector('.sk-stat-bar') as HTMLElement;
    expect(statBar.style.getPropertyValue('--sk-stat-bar-gap')).toBe('var(--sk-space-xs)');

    unmount();

    const { container: container2 } = render(() => <StatBar items={mockItems} size="lg" />);

    statBar = container2.querySelector('.sk-stat-bar') as HTMLElement;
    expect(statBar.style.getPropertyValue('--sk-stat-bar-gap')).toBe('var(--sk-space-md)');
  });

  it('forwards additional HTML attributes', () => {
    const { container } = render(() => (
      <StatBar items={mockItems} data-testid="my-stat-bar" aria-label="Statistics" />
    ));

    const statBar = container.querySelector('[data-testid="my-stat-bar"]');
    expect(statBar).toBeInTheDocument();
    expect(statBar).toHaveAttribute('aria-label', 'Statistics');
  });

  it('handles empty items array', () => {
    const { container } = render(() => <StatBar items={[]} />);

    expect(container.querySelector('.sk-stat-bar')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-stat-bar__item')).toHaveLength(0);
  });

  it('renders numeric values correctly', () => {
    const numericItems: StatBarItem[] = [
      { label: 'Count', value: 1234 },
      { label: 'Percentage', value: 56.78 },
    ];

    render(() => <StatBar items={numericItems} />);

    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('56.78')).toBeInTheDocument();
  });

  it('merges custom style prop', () => {
    const { container } = render(() => (
      <StatBar items={mockItems} style={{ 'background-color': 'blue' }} />
    ));

    const statBar = container.querySelector('.sk-stat-bar') as HTMLElement;
    expect(statBar.style.backgroundColor).toBe('blue');
    expect(statBar.style.getPropertyValue('--sk-stat-bar-gap')).toBe('var(--sk-space-sm)');
  });
});
