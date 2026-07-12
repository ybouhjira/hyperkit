import type { CSSProperties } from 'react';
import { mapSpace, type SpaceToken } from '@ybouhjira/hyperkit-styles';
import { Box, type BoxProps } from '../Box/Box';

export interface GridProps extends BoxProps {
  /** Number of equal 1fr columns, or a raw grid-template-columns value. */
  columns?: number | string;
  /** Gap between rows and columns — space token. */
  gap?: SpaceToken;
}

/** CSS-grid layout primitive over Box, matching the SolidJS Grid mapping. */
export function Grid({ columns, gap, style, ...rest }: GridProps) {
  const computed: CSSProperties = {
    display: 'grid',
    ...(columns !== undefined
      ? {
          gridTemplateColumns:
            typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
        }
      : null),
    ...(gap ? { gap: mapSpace(gap) } : null),
    ...style,
  };
  return <Box style={computed} {...rest} />;
}
