import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { SegmentedBar } from './SegmentedBar';

describe('SegmentedBar', () => {
  it('renders the container', () => {
    render(() => <SegmentedBar segments={[{ value: 50, color: 'red' }]} />);
    expect(screen.getByTestId('segmented-bar')).toBeInTheDocument();
  });

  it('renders correct number of segments', () => {
    render(() => (
      <SegmentedBar
        segments={[
          { value: 30, color: 'red' },
          { value: 50, color: 'blue' },
          { value: 20, color: 'green' },
        ]}
      />
    ));
    expect(screen.getByTestId('segmented-bar-segment-0')).toBeInTheDocument();
    expect(screen.getByTestId('segmented-bar-segment-1')).toBeInTheDocument();
    expect(screen.getByTestId('segmented-bar-segment-2')).toBeInTheDocument();
  });

  it('handles empty segments array', () => {
    render(() => <SegmentedBar segments={[]} />);
    expect(screen.getByTestId('segmented-bar')).toBeInTheDocument();
  });

  it('handles single segment (takes 100% width)', () => {
    render(() => <SegmentedBar segments={[{ value: 100, color: 'blue' }]} />);
    const seg = screen.getByTestId('segmented-bar-segment-0');
    expect(seg.style.width).toBe('100%');
  });

  it('renders proportional widths', () => {
    render(() => (
      <SegmentedBar
        segments={[
          { value: 25, color: 'red' },
          { value: 75, color: 'blue' },
        ]}
      />
    ));
    const seg0 = screen.getByTestId('segmented-bar-segment-0');
    const seg1 = screen.getByTestId('segmented-bar-segment-1');
    expect(seg0.style.width).toBe('25%');
    expect(seg1.style.width).toBe('75%');
  });

  it('applies custom height', () => {
    render(() => <SegmentedBar segments={[{ value: 100, color: 'red' }]} height={16} />);
    const bar = screen.getByTestId('segmented-bar');
    expect(bar.style.height).toBe('16px');
  });

  it('applies animated class when animated is true', () => {
    render(() => <SegmentedBar segments={[{ value: 100, color: 'red' }]} animated />);
    expect(screen.getByTestId('segmented-bar')).toHaveClass('sk-segmented-bar--animated');
  });

  it('shows tooltip with label and value', () => {
    render(() => <SegmentedBar segments={[{ value: 42, color: 'red', label: 'CPU' }]} />);
    const seg = screen.getByTestId('segmented-bar-segment-0');
    expect(seg.getAttribute('title')).toBe('CPU: 42');
  });

  it('handles all-zero values without errors', () => {
    render(() => (
      <SegmentedBar
        segments={[
          { value: 0, color: 'red' },
          { value: 0, color: 'blue' },
        ]}
      />
    ));
    expect(screen.getByTestId('segmented-bar')).toBeInTheDocument();
  });
});
