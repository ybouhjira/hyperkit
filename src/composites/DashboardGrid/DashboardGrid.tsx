import { Component, JSX, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/composites/DashboardGrid/DashboardGrid.css';

export interface DashboardGridProps {
  /** Minimum width of each grid item before wrapping.
   * @default '320px' */
  minItemWidth?: string;
  /** Gap between grid items.
   * @default 'md' */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Maximum number of columns.
   * @default undefined (unlimited) */
  maxColumns?: number;
  /** Grid items. */
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  unstyled?: boolean;
}

const gapMap = {
  sm: 'var(--sk-space-sm)',
  md: 'var(--sk-space-md)',
  lg: 'var(--sk-space-lg)',
  xl: 'var(--sk-space-xl)',
};

export const DashboardGrid: Component<DashboardGridProps> = (props) => {
  const [local, others] = splitProps(props, [
    'minItemWidth',
    'gap',
    'maxColumns',
    'children',
    'class',
    'style',
    'unstyled',
  ]);

  const gridStyle = (): JSX.CSSProperties => {
    const baseStyle = {
      '--sk-dashboard-grid-min-width': local.minItemWidth ?? '320px',
      '--sk-dashboard-grid-gap': gapMap[local.gap ?? 'md'],
      ...local.style,
    } as JSX.CSSProperties;

    if (local.maxColumns !== undefined) {
      return {
        ...baseStyle,
        '--sk-dashboard-grid-max-columns': local.maxColumns,
      } as JSX.CSSProperties;
    }

    return baseStyle;
  };

  return (
    <div
      class={`${local.unstyled ? '' : 'sk-dashboard-grid'} ${local.maxColumns !== undefined ? 'sk-dashboard-grid--capped' : ''} ${local.class ?? ''}`}
      style={gridStyle()}
      {...others}
    >
      {local.children}
    </div>
  );
};
