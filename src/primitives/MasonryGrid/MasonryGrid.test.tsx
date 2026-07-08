import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { MasonryGrid } from './MasonryGrid';

describe('MasonryGrid', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <MasonryGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </MasonryGrid>
    ));

    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
  });

  it('applies sk-masonry-grid class', () => {
    const { container } = render(() => <MasonryGrid>content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid');
    expect(grid).toBeInTheDocument();
  });

  it('appends custom class', () => {
    const { container } = render(() => <MasonryGrid class="my-grid">content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid.my-grid');
    expect(grid).toBeInTheDocument();
  });

  it('defaults to 3 columns', () => {
    const { container } = render(() => <MasonryGrid>content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns')).toBe('3');
  });

  it('sets custom column count as number', () => {
    const { container } = render(() => <MasonryGrid columns={4}>content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns')).toBe('4');
  });

  it('sets responsive columns via breakpoints', () => {
    const { container } = render(() => (
      <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>content</MasonryGrid>
    ));

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-sm')).toBe('1');
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-md')).toBe('2');
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-lg')).toBe('3');
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-xl')).toBe('4');
  });

  it('sets partial responsive columns', () => {
    const { container } = render(() => (
      <MasonryGrid columns={{ sm: 1, lg: 3 }}>content</MasonryGrid>
    ));

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-sm')).toBe('1');
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-lg')).toBe('3');
    // Undefined breakpoints should not be set
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-md')).toBe('');
    expect(grid.style.getPropertyValue('--sk-masonry-grid-columns-xl')).toBe('');
  });

  it('defaults to md gap', () => {
    const { container } = render(() => <MasonryGrid>content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-gap')).toBe('var(--sk-space-md)');
  });

  it('sets custom gap token', () => {
    const { container } = render(() => <MasonryGrid gap="lg">content</MasonryGrid>);

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-masonry-grid-gap')).toBe('var(--sk-space-lg)');
  });

  it('passes custom style', () => {
    const { container } = render(() => (
      <MasonryGrid style={{ background: 'red' }}>content</MasonryGrid>
    ));

    const grid = container.querySelector('.sk-masonry-grid') as HTMLElement;
    expect(grid.style.background).toBe('red');
  });

  it('renders without children', () => {
    const { container } = render(() => <MasonryGrid />);

    const grid = container.querySelector('.sk-masonry-grid');
    expect(grid).toBeInTheDocument();
  });
});
