import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default variant (rect)', () => {
    const { container } = render(() => <Skeleton />);
    const skeleton = container.querySelector('.sk-skeleton--rect');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders rect variant', () => {
    const { container } = render(() => <Skeleton variant="rect" />);
    const skeleton = container.querySelector('.sk-skeleton--rect');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders circle variant', () => {
    const { container } = render(() => <Skeleton variant="circle" />);
    const skeleton = container.querySelector('.sk-skeleton--circle');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders text variant with multiple lines', () => {
    const { container } = render(() => <Skeleton variant="text" />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    expect(textContainer).toBeInTheDocument();
    const lines = textContainer?.querySelectorAll('.sk-skeleton--rect');
    expect(lines?.length).toBe(3); // Default 3 lines
  });

  it('renders text variant with custom number of lines', () => {
    const { container } = render(() => <Skeleton variant="text" lines={5} />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    const lines = textContainer?.querySelectorAll('.sk-skeleton--rect');
    expect(lines?.length).toBe(5);
  });

  it('applies default width for rect (100%)', () => {
    const { container } = render(() => <Skeleton variant="rect" />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
  });

  it('applies default height for rect (20px)', () => {
    const { container } = render(() => <Skeleton variant="rect" />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.height).toBe('20px');
  });

  it('applies custom width as string', () => {
    const { container } = render(() => <Skeleton width="200px" />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
  });

  it('applies custom width as number', () => {
    const { container } = render(() => <Skeleton width={150} />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('150px');
  });

  it('applies custom height as string', () => {
    const { container } = render(() => <Skeleton height="50px" />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.height).toBe('50px');
  });

  it('applies custom height as number', () => {
    const { container } = render(() => <Skeleton height={100} />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.height).toBe('100px');
  });

  it('applies default size for circle (40px)', () => {
    const { container } = render(() => <Skeleton variant="circle" />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('40px');
    expect(skeleton.style.height).toBe('40px');
  });

  it('applies custom size for circle', () => {
    const { container } = render(() => <Skeleton variant="circle" size={60} />);
    const skeleton = container.querySelector('.sk-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('60px');
    expect(skeleton.style.height).toBe('60px');
  });

  it('applies base class', () => {
    const { container } = render(() => <Skeleton />);
    const skeleton = container.querySelector('.sk-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <Skeleton class="custom-class" />);
    const skeleton = container.querySelector('.sk-skeleton');
    expect(skeleton?.classList.contains('custom-class')).toBe(true);
  });

  it('applies custom class to text variant container', () => {
    const { container } = render(() => <Skeleton variant="text" class="custom-class" />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    expect(textContainer?.classList.contains('custom-class')).toBe(true);
  });

  it('text variant lines have varying widths', () => {
    const { container } = render(() => <Skeleton variant="text" lines={3} />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    const lines = textContainer?.querySelectorAll('.sk-skeleton--rect') as NodeListOf<HTMLElement>;

    expect(lines[0].style.width).toBe('100%');
    expect(lines[1].style.width).toBe('80%');
    expect(lines[2].style.width).toBe('60%');
  });

  it('text variant lines cycle through widths', () => {
    const { container } = render(() => <Skeleton variant="text" lines={4} />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    const lines = textContainer?.querySelectorAll('.sk-skeleton--rect') as NodeListOf<HTMLElement>;

    expect(lines[0].style.width).toBe('100%');
    expect(lines[1].style.width).toBe('80%');
    expect(lines[2].style.width).toBe('60%');
    expect(lines[3].style.width).toBe('100%'); // Cycles back
  });

  it('text variant lines have fixed height', () => {
    const { container } = render(() => <Skeleton variant="text" />);
    const textContainer = container.querySelector('.sk-skeleton-text');
    const lines = textContainer?.querySelectorAll('.sk-skeleton--rect') as NodeListOf<HTMLElement>;

    lines.forEach((line) => {
      expect(line.style.height).toBe('20px');
    });
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Skeleton unstyled class="custom" />);
    const skeleton = container.firstElementChild;
    expect(skeleton?.className).not.toContain('sk-');
    expect(skeleton?.className).toContain('custom');
  });
});
