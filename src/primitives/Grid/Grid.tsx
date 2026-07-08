import { Component, JSX, splitProps } from 'solid-js';
import { Box, BoxProps } from '../Box';
import { SpaceToken, mapSpace } from '../layout';

/**
 * Props for the Grid component
 */
export interface GridProps extends BoxProps {
  /** Number of columns, or a CSS grid-template-columns value.
   * When a number is passed, creates that many equal `1fr` columns. */
  columns?: number | string;
  /** Number of rows, or a CSS grid-template-rows value.
   * When a number is passed, creates that many equal `1fr` rows. */
  rows?: number | string;
  /** Gap between both rows and columns using SpaceToken */
  gap?: SpaceToken;
  /** Gap between rows using SpaceToken */
  rowGap?: SpaceToken;
  /** Gap between columns using SpaceToken */
  columnGap?: SpaceToken;
  /** Direction of auto-placement for grid items */
  autoFlow?: 'row' | 'column' | 'dense';
  /** Alignment of items along both axes */
  placeItems?: 'start' | 'center' | 'end' | 'stretch';
  /** CSS grid-template-areas value for named grid areas */
  areas?: string;
}

/**
 * CSS Grid layout component with token-based spacing.
 *
 * @example
 * ```tsx
 * import { Grid, Card, Text, Badge } from "@ybouhjira/hyperkit";
 *
 * // Responsive 3-column card grid
 * <Grid columns={3} gap="md">
 *   <For each={projects}>
 *     {(project) => (
 *       <Card variant="outlined">
 *         <Text weight="semibold">{project.name}</Text>
 *         <Badge variant={project.status === "active" ? "success" : "default"}>
 *           {project.status}
 *         </Badge>
 *       </Card>
 *     )}
 *   </For>
 * </Grid>
 *
 * // Dashboard layout with named areas
 * <Grid
 *   areas='"sidebar main" "sidebar footer"'
 *   columns="240px 1fr"
 *   rows="1fr auto"
 *   gap="md"
 *   style={{ height: "100vh" }}
 * >
 *   <div style={{ "grid-area": "sidebar" }}><Sidebar /></div>
 *   <div style={{ "grid-area": "main" }}><MainContent /></div>
 * </Grid>
 *
 * // Auto-fill responsive grid
 * <Grid columns="repeat(auto-fill, minmax(200px, 1fr))" gap="sm">
 *   <For each={items}>{(item) => <MetricCard {...item} />}</For>
 * </Grid>
 * ```
 *
 * @see Flex - for one-dimensional layouts
 * @see Stack - for simple vertical stacking
 */
export const Grid: Component<GridProps> = (props) => {
  const [gridProps, boxProps] = splitProps(props, [
    'columns',
    'rows',
    'gap',
    'rowGap',
    'columnGap',
    'autoFlow',
    'placeItems',
    'areas',
  ]);

  const gridStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = {};

    if (gridProps.columns !== undefined) {
      style['grid-template-columns'] =
        typeof gridProps.columns === 'number'
          ? `repeat(${gridProps.columns}, 1fr)`
          : gridProps.columns;
    }

    if (gridProps.rows !== undefined) {
      style['grid-template-rows'] =
        typeof gridProps.rows === 'number' ? `repeat(${gridProps.rows}, 1fr)` : gridProps.rows;
    }

    if (gridProps.gap) {
      style.gap = mapSpace(gridProps.gap);
    }

    if (gridProps.rowGap) {
      style['row-gap'] = mapSpace(gridProps.rowGap);
    }

    if (gridProps.columnGap) {
      style['column-gap'] = mapSpace(gridProps.columnGap);
    }

    if (gridProps.autoFlow) {
      style['grid-auto-flow'] = gridProps.autoFlow;
    }

    if (gridProps.placeItems) {
      style['place-items'] = gridProps.placeItems;
    }

    if (gridProps.areas) {
      style['grid-template-areas'] = gridProps.areas;
    }

    return style;
  };

  return (
    <Box
      display="grid"
      {...boxProps}
      style={{
        ...gridStyle(),
        ...boxProps.style,
      }}
    />
  );
};
