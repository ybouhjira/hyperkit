import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default value (0%)', () => {
    const { container } = render(() => <ProgressBar />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe('0%');
  });

  it('renders with custom value', () => {
    const { container } = render(() => <ProgressBar value={50} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('clamps value to maximum 100%', () => {
    const { container } = render(() => <ProgressBar value={150} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('clamps value to minimum 0%', () => {
    const { container } = render(() => <ProgressBar value={-50} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('applies default size (md)', () => {
    const { container } = render(() => <ProgressBar />);
    const progress = container.querySelector('.sk-progress--md');
    expect(progress).toBeInTheDocument();
  });

  it('applies sm size', () => {
    const { container } = render(() => <ProgressBar size="sm" />);
    const progress = container.querySelector('.sk-progress--sm');
    expect(progress).toBeInTheDocument();
  });

  it('applies md size explicitly', () => {
    const { container } = render(() => <ProgressBar size="md" />);
    const progress = container.querySelector('.sk-progress--md');
    expect(progress).toBeInTheDocument();
  });

  it('applies lg size', () => {
    const { container } = render(() => <ProgressBar size="lg" />);
    const progress = container.querySelector('.sk-progress--lg');
    expect(progress).toBeInTheDocument();
  });

  it('applies default color (var(--sk-accent))', () => {
    const { container } = render(() => <ProgressBar value={50} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.background).toBe('var(--sk-accent)');
  });

  it('applies custom color', () => {
    const { container } = render(() => <ProgressBar value={50} color="#ff0000" />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.background).toBe('rgb(255, 0, 0)'); // Browser normalizes hex to rgb
  });

  it('renders indeterminate state', () => {
    const { container } = render(() => <ProgressBar indeterminate />);
    const progress = container.querySelector('.sk-progress--indeterminate');
    expect(progress).toBeInTheDocument();
  });

  it('renders indeterminate fill', () => {
    const { container } = render(() => <ProgressBar indeterminate />);
    const fill = container.querySelector('.sk-progress__fill--indeterminate');
    expect(fill).toBeInTheDocument();
  });

  it('does not render determinate fill when indeterminate', () => {
    const { container } = render(() => <ProgressBar indeterminate value={50} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.classList.contains('sk-progress__fill--indeterminate')).toBe(true);
    expect(fill.style.width).toBe(''); // No width set for indeterminate
  });

  it('applies base class', () => {
    const { container } = render(() => <ProgressBar />);
    const progress = container.querySelector('.sk-progress');
    expect(progress).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <ProgressBar class="custom-class" />);
    const progress = container.querySelector('.sk-progress');
    expect(progress?.classList.contains('custom-class')).toBe(true);
  });

  it('applies custom color to indeterminate state', () => {
    const { container } = render(() => <ProgressBar indeterminate color="blue" />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.background).toBe('blue');
  });

  it('handles zero value', () => {
    const { container } = render(() => <ProgressBar value={0} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('handles 100% value', () => {
    const { container } = render(() => <ProgressBar value={100} />);
    const fill = container.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('combines all classes correctly', () => {
    const { container } = render(() => <ProgressBar size="lg" indeterminate class="custom" />);
    const progress = container.querySelector('.sk-progress');
    expect(progress?.classList.contains('sk-progress')).toBe(true);
    expect(progress?.classList.contains('sk-progress--lg')).toBe(true);
    expect(progress?.classList.contains('sk-progress--indeterminate')).toBe(true);
    expect(progress?.classList.contains('custom')).toBe(true);
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <ProgressBar unstyled class="custom" value={50} />);
    const progress = container.firstElementChild;
    expect(progress?.className).not.toContain('sk-');
    expect(progress?.className).toContain('custom');
  });
});
