import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { mapSpace, type SpaceToken } from '@ybouhjira/hyperkit-styles';

export interface FlexProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Flex direction. Controls main axis orientation. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Cross-axis alignment. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis distribution. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Gap between children — space token → var(--sk-space-*). */
  gap?: SpaceToken;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Render as inline-flex. */
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const ALIGN_MAP: Record<string, string> = { start: 'flex-start', end: 'flex-end' };
const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Flexbox layout primitive — inline-style based (no CSS classes), matching the
 * SolidJS Flex prop surface and token mapping.
 */
export function Flex({
  direction,
  align,
  justify,
  gap,
  wrap,
  inline,
  className,
  style,
  children,
  ...rest
}: FlexProps) {
  const computed: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    ...(direction ? { flexDirection: direction } : null),
    ...(align ? { alignItems: ALIGN_MAP[align] ?? align } : null),
    ...(justify ? { justifyContent: JUSTIFY_MAP[justify] ?? justify } : null),
    ...(gap ? { gap: mapSpace(gap) } : null),
    ...(wrap ? { flexWrap: wrap } : null),
    ...style,
  };

  return (
    <div className={className} style={computed} {...rest}>
      {children}
    </div>
  );
}
