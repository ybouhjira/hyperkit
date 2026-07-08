import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { DashboardGrid } from './DashboardGrid';

describe('DashboardGrid', () => {
  it('renders children', () => {
    const { container } = render(() => (
      <DashboardGrid>
        <div data-testid="child-1">Card 1</div>
        <div data-testid="child-2">Card 2</div>
        <div data-testid="child-3">Card 3</div>
      </DashboardGrid>
    ));

    expect(container.querySelector('[data-testid="child-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-2"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-3"]')).toBeInTheDocument();
  });

  it('applies default class', () => {
    const { container } = render(() => (
      <DashboardGrid>
        <div>Content</div>
      </DashboardGrid>
    ));

    expect(container.querySelector('.sk-dashboard-grid')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <DashboardGrid class="custom-grid">
        <div>Content</div>
      </DashboardGrid>
    ));

    expect(container.querySelector('.sk-dashboard-grid.custom-grid')).toBeInTheDocument();
  });

  it('applies unstyled prop', () => {
    const { container } = render(() => (
      <DashboardGrid unstyled>
        <div>Content</div>
      </DashboardGrid>
    ));

    expect(container.querySelector('.sk-dashboard-grid')).not.toBeInTheDocument();
  });

  it('sets CSS variable for minItemWidth', () => {
    const { container } = render(() => (
      <DashboardGrid minItemWidth="250px">
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-min-width')).toBe('250px');
  });

  it('uses default minItemWidth when not provided', () => {
    const { container } = render(() => (
      <DashboardGrid>
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-min-width')).toBe('320px');
  });

  it('sets CSS variable for gap variants', () => {
    const { container, unmount } = render(() => (
      <DashboardGrid gap="sm">
        <div>Content</div>
      </DashboardGrid>
    ));

    let grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-gap')).toBe('var(--sk-space-sm)');

    unmount();

    const { container: container2 } = render(() => (
      <DashboardGrid gap="lg">
        <div>Content</div>
      </DashboardGrid>
    ));

    grid = container2.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-gap')).toBe('var(--sk-space-lg)');
  });

  it('sets CSS variable for maxColumns', () => {
    const { container } = render(() => (
      <DashboardGrid maxColumns={3}>
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-max-columns')).toBe('3');
  });

  it('does not set maxColumns variable when not provided', () => {
    const { container } = render(() => (
      <DashboardGrid>
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-max-columns')).toBe('');
  });

  it('forwards additional HTML attributes', () => {
    const { container } = render(() => (
      <DashboardGrid data-testid="my-grid" aria-label="Dashboard">
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('[data-testid="my-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute('aria-label', 'Dashboard');
  });

  it('merges custom style prop with internal styles', () => {
    const { container } = render(() => (
      <DashboardGrid style={{ 'background-color': 'red' }}>
        <div>Content</div>
      </DashboardGrid>
    ));

    const grid = container.querySelector('.sk-dashboard-grid') as HTMLElement;
    expect(grid.style.backgroundColor).toBe('red');
    expect(grid.style.getPropertyValue('--sk-dashboard-grid-min-width')).toBe('320px');
  });
});
