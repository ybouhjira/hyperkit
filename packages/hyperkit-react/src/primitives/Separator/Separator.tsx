import type { CSSProperties } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Separator/Separator.css';

export interface SeparatorProps {
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: CSSProperties;
}

/** Divider rendering the same `sk-separator` contract as the SolidJS package. */
export function Separator({ orientation = 'horizontal', className, style }: SeparatorProps) {
  return (
    <div
      className={`sk-separator sk-separator--${orientation}${className ? ` ${className}` : ''}`}
      style={style}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
