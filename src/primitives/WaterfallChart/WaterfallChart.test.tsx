import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { WaterfallChart } from './WaterfallChart';

const sampleItems = [
  { id: 'a', label: 'Request A', start: 0, end: 100 },
  { id: 'b', label: 'Request B', start: 50, end: 200 },
  { id: 'c', label: 'Request C', start: 100, end: 300 },
];

describe('WaterfallChart', () => {
  it('renders the container', () => {
    render(() => <WaterfallChart items={sampleItems} />);
    expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
  });

  it('renders a row for each item', () => {
    render(() => <WaterfallChart items={sampleItems} />);
    expect(screen.getByTestId('waterfall-row-a')).toBeInTheDocument();
    expect(screen.getByTestId('waterfall-row-b')).toBeInTheDocument();
    expect(screen.getByTestId('waterfall-row-c')).toBeInTheDocument();
  });

  it('renders a bar for each item', () => {
    render(() => <WaterfallChart items={sampleItems} />);
    expect(screen.getByTestId('waterfall-bar-a')).toBeInTheDocument();
    expect(screen.getByTestId('waterfall-bar-b')).toBeInTheDocument();
    expect(screen.getByTestId('waterfall-bar-c')).toBeInTheDocument();
  });

  it('renders item labels', () => {
    render(() => <WaterfallChart items={sampleItems} />);
    expect(screen.getByText('Request A')).toBeInTheDocument();
    expect(screen.getByText('Request B')).toBeInTheDocument();
    expect(screen.getByText('Request C')).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    render(() => <WaterfallChart items={[]} />);
    expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
  });

  it('applies row height to each row', () => {
    render(() => <WaterfallChart items={[sampleItems[0]!]} height={32} />);
    const row = screen.getByTestId('waterfall-row-a');
    expect(row.style.height).toBe('32px');
  });

  it('positions bar at 0% left for the first item starting at min time', () => {
    render(() => <WaterfallChart items={[{ id: 'first', label: 'First', start: 0, end: 100 }]} />);
    const bar = screen.getByTestId('waterfall-bar-first');
    expect(bar.style.left).toBe('0%');
  });

  it('handles single item', () => {
    render(() => <WaterfallChart items={[{ id: 'only', label: 'Only', start: 10, end: 20 }]} />);
    const bar = screen.getByTestId('waterfall-bar-only');
    expect(bar).toBeInTheDocument();
  });

  it('applies custom label width', () => {
    render(() => <WaterfallChart items={[sampleItems[0]!]} labelWidth={200} />);
    const row = screen.getByTestId('waterfall-row-a');
    const label = row.querySelector('.sk-waterfall__label') as HTMLElement;
    expect(label.style.width).toBe('200px');
  });

  it('applies custom class', () => {
    render(() => <WaterfallChart items={sampleItems} class="my-waterfall" />);
    expect(screen.getByTestId('waterfall-chart')).toHaveClass('my-waterfall');
  });
});
