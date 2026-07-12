import type { CSSProperties, ReactNode } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Badge/Badge.css';

export interface BadgeProps {
  /** Color variant.
   * @default 'default' */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'soft';
  /** Size — height, padding, and font-size via tokens.
   * @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Display type.
   * @default 'label' */
  type?: 'label' | 'dot' | 'count';
  /** Numeric count when type is 'count'. */
  count?: number;
  /** Cap before showing a plus sign.
   * @default 99 */
  maxCount?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Status/count label rendering the same `sk-badge` contract as the SolidJS package. */
export function Badge({
  variant = 'default',
  size = 'md',
  type = 'label',
  count,
  maxCount = 99,
  children,
  className,
  style,
}: BadgeProps) {
  const base = `sk-badge sk-badge--${type} sk-badge--${variant} sk-badge--size-${size}${className ? ` ${className}` : ''}`;
  if (type === 'dot') {
    return <span className={base} style={style} />;
  }
  const content =
    type === 'count' && count != null ? (count > maxCount ? `${maxCount}+` : String(count)) : children;
  return (
    <span className={base} style={style}>
      {content}
    </span>
  );
}
