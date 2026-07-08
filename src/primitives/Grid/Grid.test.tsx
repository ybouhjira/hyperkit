import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Grid } from './Grid';

describe('Grid', () => {
  describe('Rendering', () => {
    it('renders as grid display', () => {
      const { container } = render(() => <Grid>Content</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.display).toBe('grid');
    });

    it('renders children', () => {
      const { container } = render(() => (
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.children).toHaveLength(2);
      expect(el.textContent).toContain('Item 1');
      expect(el.textContent).toContain('Item 2');
    });
  });

  describe('Grid Template', () => {
    it('applies repeat columns from number', () => {
      const { container } = render(() => <Grid columns={3}>Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('applies custom columns string', () => {
      const { container } = render(() => <Grid columns="1fr 2fr">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateColumns).toBe('1fr 2fr');
    });

    it('applies repeat rows from number', () => {
      const { container } = render(() => <Grid rows={2}>Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateRows).toBe('repeat(2, 1fr)');
    });

    it('applies custom rows string', () => {
      const { container } = render(() => <Grid rows="100px auto">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateRows).toBe('100px auto');
    });
  });

  describe('Gap', () => {
    it('applies gap from token', () => {
      const { container } = render(() => <Grid gap="md">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gap).toBeTruthy();
    });

    it('applies row-gap separately', () => {
      const { container } = render(() => <Grid rowGap="lg">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.rowGap).toBeTruthy();
    });

    it('applies column-gap separately', () => {
      const { container } = render(() => <Grid columnGap="sm">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.columnGap).toBeTruthy();
    });

    it('applies both row-gap and column-gap', () => {
      const { container } = render(() => (
        <Grid rowGap="md" columnGap="lg">
          Items
        </Grid>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.rowGap).toBeTruthy();
      expect(el.style.columnGap).toBeTruthy();
    });
  });

  describe('Auto Flow', () => {
    it('applies auto-flow', () => {
      const { container } = render(() => <Grid autoFlow="dense">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridAutoFlow).toBe('dense');
    });

    it('applies auto-flow column', () => {
      const { container } = render(() => <Grid autoFlow="column">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridAutoFlow).toBe('column');
    });
  });

  describe('Place Items', () => {
    it('applies place-items', () => {
      const { container } = render(() => <Grid placeItems="center">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.placeItems).toBe('center');
    });

    it('applies place-items start', () => {
      const { container } = render(() => <Grid placeItems="start">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.placeItems).toBe('start');
    });
  });

  describe('Grid Areas', () => {
    it('applies grid-template-areas', () => {
      const areas = '"header header" "sidebar content"';
      const { container } = render(() => <Grid areas={areas}>Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateAreas).toBe(areas);
    });
  });

  describe('Props', () => {
    it('passes custom class', () => {
      const { container } = render(() => <Grid class="custom-grid">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.classList.contains('custom-grid')).toBe(true);
    });

    it('passes custom style', () => {
      const { container } = render(() => <Grid style={{ background: 'red' }}>Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.background).toBe('red');
    });

    it('merges grid style with custom style', () => {
      const { container } = render(() => (
        <Grid columns={2} style={{ padding: '10px' }}>
          Items
        </Grid>
      ));
      const el = container.firstChild as HTMLElement;

      expect(el.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
      expect(el.style.padding).toBe('10px');
    });
  });

  describe('Box Props Inheritance', () => {
    it('inherits Box props like padding', () => {
      const { container } = render(() => <Grid p="md">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.padding).toBeTruthy();
    });

    it('inherits Box props like background', () => {
      const { container } = render(() => <Grid bg="primary">Items</Grid>);
      const el = container.firstChild as HTMLElement;

      expect(el.style.background).toBeTruthy();
    });
  });
});
