import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { SkeletonShimmer } from './SkeletonShimmer';

describe('SkeletonShimmer', () => {
  it('renders without errors', () => {
    const { container } = render(() => <SkeletonShimmer />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders rect variant by default', () => {
    const { container } = render(() => <SkeletonShimmer />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-skeleton--rect')).toBe(true);
  });

  it('renders circle variant with 50% border-radius', () => {
    const { container } = render(() => <SkeletonShimmer variant="circle" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.borderRadius).toBe('50%');
  });

  it('renders text variant with multiple lines', () => {
    const { container } = render(() => <SkeletonShimmer variant="text" lines={4} />);
    const lines = container.querySelectorAll('.sk-skeleton--rect');
    expect(lines.length).toBe(4);
  });

  it('renders card variant with header and lines', () => {
    const { container } = render(() => <SkeletonShimmer variant="card" />);
    const card = container.querySelector('.sk-skeleton-card');
    expect(card).toBeTruthy();
    expect(card?.querySelector('.sk-skeleton-card__header')).toBeTruthy();
    expect(card?.querySelector('.sk-skeleton-card__lines')).toBeTruthy();
  });

  it('has role status and aria-busy for accessibility', () => {
    const { container } = render(() => <SkeletonShimmer />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-busy')).toBe('true');
  });

  it('applies width and height', () => {
    const { container } = render(() => (
      <SkeletonShimmer variant="rect" width="200px" height="50px" />
    ));
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  it('applies custom class', () => {
    const { container } = render(() => <SkeletonShimmer class="my-skeleton" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-skeleton')).toBe(true);
  });

  it('applies speed as CSS custom property', () => {
    const { container } = render(() => <SkeletonShimmer speed={3} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue('--sk-skeleton-speed')).toBe('3s');
  });

  it('text variant renders default 3 lines when lines not specified', () => {
    const { container } = render(() => <SkeletonShimmer variant="text" />);
    const lines = container.querySelectorAll('.sk-skeleton--rect');
    expect(lines.length).toBe(3);
  });
});
