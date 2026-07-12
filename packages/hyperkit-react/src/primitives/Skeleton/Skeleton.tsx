import type { CSSProperties } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Skeleton/Skeleton.css';

export interface SkeletonProps {
  /** @default 'rect' */
  variant?: 'rect' | 'circle' | 'text';
  /** Circle diameter in px when variant is 'circle'.
   * @default 40 */
  size?: number;
  width?: string | number;
  height?: string | number;
  /** Number of text lines when variant is 'text'.
   * @default 1 */
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

/** Loading placeholder rendering the same `sk-skeleton` contract as the SolidJS package. */
export function Skeleton({
  variant = 'rect',
  size = 40,
  width,
  height,
  lines = 1,
  className,
  style,
}: SkeletonProps) {
  const cls = `sk-skeleton sk-skeleton--${variant}${className ? ` ${className}` : ''}`;
  const dim = (v: string | number | undefined) => (typeof v === 'number' ? `${v}px` : v);

  if (variant === 'text') {
    return (
      <span style={{ display: 'block', ...style }}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={cls} style={{ width: dim(width) }} />
        ))}
      </span>
    );
  }
  const circle = variant === 'circle' ? { width: `${size}px`, height: `${size}px` } : null;
  return (
    <span
      className={cls}
      style={{ width: dim(width), height: dim(height), ...circle, ...style }}
    />
  );
}
