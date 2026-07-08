import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ColorDot } from './ColorDot';

describe('ColorDot', () => {
  it('renders correctly with color', () => {
    const { container } = render(() => <ColorDot color="#ff0000" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.style.backgroundColor).toBe('rgb(255, 0, 0)'); // Browser normalizes hex to rgb
  });

  it('applies default size (md)', () => {
    const { container } = render(() => <ColorDot color="#00ff00" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('sk-color-dot--md')).toBe(true);
  });

  it('applies sm size', () => {
    const { container } = render(() => <ColorDot color="#0000ff" size="sm" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('sk-color-dot--sm')).toBe(true);
  });

  it('applies md size explicitly', () => {
    const { container } = render(() => <ColorDot color="#ffff00" size="md" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('sk-color-dot--md')).toBe(true);
  });

  it('applies lg size', () => {
    const { container } = render(() => <ColorDot color="#ff00ff" size="lg" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('sk-color-dot--lg')).toBe(true);
  });

  it('applies custom class', () => {
    const { container } = render(() => <ColorDot color="#00ffff" class="custom-class" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('custom-class')).toBe(true);
  });

  it('applies base classes', () => {
    const { container } = render(() => <ColorDot color="#ffffff" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.classList.contains('sk-color-dot')).toBe(true);
  });

  it('accepts CSS color names', () => {
    const { container } = render(() => <ColorDot color="red" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('red');
  });

  it('accepts rgb colors', () => {
    const { container } = render(() => <ColorDot color="rgb(255, 0, 0)" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('accepts rgba colors', () => {
    const { container } = render(() => <ColorDot color="rgba(255, 0, 0, 0.5)" />);
    const dot = container.querySelector('.sk-color-dot') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('rgba(255, 0, 0, 0.5)');
  });
});
