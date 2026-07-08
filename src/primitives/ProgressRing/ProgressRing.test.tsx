import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders with default value (0)', () => {
    const { container } = render(() => <ProgressRing />);
    const ring = container.querySelector('.sk-progress-ring');
    expect(ring).toBeInTheDocument();
  });

  it('renders with custom value (75)', () => {
    const { container } = render(() => <ProgressRing value={75} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    expect(fill).toBeInTheDocument();

    // For value=75, offset should be 25% of circumference
    // With default md size (64px) and strokeWidth (4px):
    // radius = (64 - 4) / 2 = 30
    // circumference = 2 * PI * 30 = ~188.5
    // offset at 75% = circumference * 0.25 = ~47.1
    const dashOffset = parseFloat(fill.getAttribute('stroke-dashoffset') || '0');
    const dashArray = parseFloat(fill.getAttribute('stroke-dasharray') || '0');
    const expectedOffset = dashArray * 0.25; // 100 - 75 = 25% remaining

    expect(dashOffset).toBeCloseTo(expectedOffset, 1);
  });

  it('clamps value to 100', () => {
    const { container } = render(() => <ProgressRing value={150} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    const dashOffset = parseFloat(fill.getAttribute('stroke-dashoffset') || '0');

    // At 100%, offset should be 0
    expect(dashOffset).toBe(0);
  });

  it('clamps value to 0', () => {
    const { container } = render(() => <ProgressRing value={-50} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    const dashOffset = parseFloat(fill.getAttribute('stroke-dashoffset') || '0');
    const dashArray = parseFloat(fill.getAttribute('stroke-dasharray') || '0');

    // At 0%, offset should equal dashArray (full circle hidden)
    expect(dashOffset).toBe(dashArray);
  });

  it('applies sm size', () => {
    const { container } = render(() => <ProgressRing size="sm" />);
    const ring = container.querySelector('.sk-progress-ring') as HTMLElement;
    expect(ring.style.width).toBe('48px');
    expect(ring.style.height).toBe('48px');
  });

  it('applies md size (default)', () => {
    const { container } = render(() => <ProgressRing />);
    const ring = container.querySelector('.sk-progress-ring') as HTMLElement;
    expect(ring.style.width).toBe('64px');
    expect(ring.style.height).toBe('64px');
  });

  it('applies lg size', () => {
    const { container } = render(() => <ProgressRing size="lg" />);
    const ring = container.querySelector('.sk-progress-ring') as HTMLElement;
    expect(ring.style.width).toBe('96px');
    expect(ring.style.height).toBe('96px');
  });

  it('applies custom numeric size', () => {
    const { container } = render(() => <ProgressRing size={120} />);
    const ring = container.querySelector('.sk-progress-ring') as HTMLElement;
    expect(ring.style.width).toBe('120px');
    expect(ring.style.height).toBe('120px');
  });

  it('applies custom color', () => {
    const { container } = render(() => <ProgressRing color="#ff0000" />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    expect(fill.style.stroke).toMatch(/^(#ff0000|rgb\(255,\s*0,\s*0\))$/);
  });

  it('applies custom strokeWidth', () => {
    const { container } = render(() => <ProgressRing strokeWidth={8} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    expect(fill.getAttribute('stroke-width')).toBe('8');
  });

  it('renders children in center', () => {
    const { container } = render(() => <ProgressRing>75%</ProgressRing>);
    const content = container.querySelector('.sk-progress-ring__content');
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toBe('75%');
  });

  it('applies custom class', () => {
    const { container } = render(() => <ProgressRing class="custom-class" />);
    const ring = container.querySelector('.sk-progress-ring');
    expect(ring?.classList.contains('custom-class')).toBe(true);
  });

  it('applies default track color (var(--sk-bg-tertiary))', () => {
    const { container } = render(() => <ProgressRing />);
    const track = container.querySelector('.sk-progress-ring__track') as SVGCircleElement;
    expect(track.getAttribute('stroke')).toBe('var(--sk-bg-tertiary)');
  });

  it('applies custom track color', () => {
    const { container } = render(() => <ProgressRing trackColor="#cccccc" />);
    const track = container.querySelector('.sk-progress-ring__track') as SVGCircleElement;
    expect(track.getAttribute('stroke')).toBe('#cccccc');
  });

  it('applies default fill color (var(--sk-accent))', () => {
    const { container } = render(() => <ProgressRing />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    expect(fill.style.stroke).toBe('var(--sk-accent)');
  });

  it('calculates correct radius based on size and strokeWidth', () => {
    const { container } = render(() => <ProgressRing size={100} strokeWidth={10} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    const radius = parseFloat(fill.getAttribute('r') || '0');

    // radius = (100 - 10) / 2 = 45
    expect(radius).toBe(45);
  });

  it('handles zero value', () => {
    const { container } = render(() => <ProgressRing value={0} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    const dashOffset = parseFloat(fill.getAttribute('stroke-dashoffset') || '0');
    const dashArray = parseFloat(fill.getAttribute('stroke-dasharray') || '0');

    expect(dashOffset).toBe(dashArray);
  });

  it('handles 100% value', () => {
    const { container } = render(() => <ProgressRing value={100} />);
    const fill = container.querySelector('.sk-progress-ring__fill') as SVGCircleElement;
    const dashOffset = parseFloat(fill.getAttribute('stroke-dashoffset') || '0');

    expect(dashOffset).toBe(0);
  });

  it('applies custom style prop', () => {
    const { container } = render(() => <ProgressRing style={{ opacity: '0.5' }} />);
    const ring = container.querySelector('.sk-progress-ring') as HTMLElement;
    expect(ring.style.opacity).toBe('0.5');
  });

  it('does not render content div when no children', () => {
    const { container } = render(() => <ProgressRing />);
    const content = container.querySelector('.sk-progress-ring__content');
    expect(content).not.toBeInTheDocument();
  });
});
