import { Component, JSX, splitProps, createMemo } from 'solid-js';
import { SpaceToken } from '../layout';
import '@ybouhjira/hyperkit-styles/primitives/MasonryGrid/MasonryGrid.css';

/** Props for the MasonryGrid component. */
export interface MasonryGridProps {
  /** Number of columns (fixed or responsive breakpoints).
   * @default 3 */
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between items using SpaceToken.
   * @default 'md' */
  gap?: SpaceToken;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
  /** Grid item children. */
  children?: JSX.Element;
}

/** CSS-based masonry grid layout with responsive columns and configurable gap. */
export const MasonryGrid: Component<MasonryGridProps> = (props) => {
  const [local, others] = splitProps(props, ['columns', 'gap', 'class', 'style', 'children']);

  const columns = createMemo(() => local.columns ?? 3);
  const gap = createMemo(() => local.gap ?? 'md');

  const gridClasses = () => {
    const classes = ['sk-masonry-grid'];
    if (local.class) classes.push(local.class);
    return classes.join(' ');
  };

  const gridStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = {
      '--sk-masonry-grid-gap': `var(--sk-space-${gap()})`,
      ...local.style,
    };

    const cols = columns();
    if (typeof cols === 'number') {
      style['--sk-masonry-grid-columns'] = cols.toString();
    } else {
      // Responsive columns - use CSS custom properties per breakpoint
      if (cols.sm !== undefined) {
        style['--sk-masonry-grid-columns-sm'] = cols.sm.toString();
      }
      if (cols.md !== undefined) {
        style['--sk-masonry-grid-columns-md'] = cols.md.toString();
      }
      if (cols.lg !== undefined) {
        style['--sk-masonry-grid-columns-lg'] = cols.lg.toString();
      }
      if (cols.xl !== undefined) {
        style['--sk-masonry-grid-columns-xl'] = cols.xl.toString();
      }
    }

    return style;
  };

  return (
    <div class={gridClasses()} style={gridStyle()} {...others}>
      {local.children}
    </div>
  );
};
