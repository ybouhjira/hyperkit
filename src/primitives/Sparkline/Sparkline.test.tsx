import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('renders an SVG element', () => {
    render(() => <Sparkline data={[1, 2, 3, 4, 5]} />);
    expect(screen.getByTestId('sparkline-svg')).toBeInTheDocument();
  });

  it('renders nothing visible for empty data', () => {
    render(() => <Sparkline data={[]} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg).toBeInTheDocument();
    expect(screen.queryByTestId('sparkline-path')).not.toBeInTheDocument();
  });

  it('renders a path for single data point', () => {
    render(() => <Sparkline data={[42]} />);
    expect(screen.getByTestId('sparkline-path')).toBeInTheDocument();
  });

  it('respects width and height props', () => {
    render(() => <Sparkline data={[1, 2, 3]} width={100} height={40} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg.getAttribute('width')).toBe('100');
    expect(svg.getAttribute('height')).toBe('40');
  });

  it('uses default dimensions when not specified', () => {
    render(() => <Sparkline data={[1, 2, 3]} />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg.getAttribute('width')).toBe('80');
    expect(svg.getAttribute('height')).toBe('24');
  });

  it('renders fill path when filled is true', () => {
    render(() => <Sparkline data={[1, 2, 3]} filled />);
    expect(screen.getByTestId('sparkline-fill')).toBeInTheDocument();
  });

  it('does not render fill path when filled is false', () => {
    render(() => <Sparkline data={[1, 2, 3]} filled={false} />);
    expect(screen.queryByTestId('sparkline-fill')).not.toBeInTheDocument();
  });

  it('applies animate class when animate is true', () => {
    render(() => <Sparkline data={[1, 2, 3]} animate />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg.getAttribute('class')).toContain('sk-sparkline--animate');
  });

  it('applies custom class', () => {
    render(() => <Sparkline data={[1, 2, 3]} class="my-sparkline" />);
    const svg = screen.getByTestId('sparkline-svg');
    expect(svg.getAttribute('class')).toContain('my-sparkline');
  });

  it('handles all-same-value data without errors', () => {
    render(() => <Sparkline data={[5, 5, 5, 5]} />);
    expect(screen.getByTestId('sparkline-path')).toBeInTheDocument();
  });
});
