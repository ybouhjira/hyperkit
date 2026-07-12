import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Card/Card.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Visual style variant. Affects border, shadow, and background.
   * @default 'default' */
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  /** Inner padding scale.
   * @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover lift/highlight affordance. */
  hoverable?: boolean;
  /** Data-driven status color — threads into --sk-card-border. */
  accentColor?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Content card rendering the same `sk-card` CSS contract as the SolidJS
 * package — identical class names, styled by @ybouhjira/hyperkit-styles.
 */
export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  accentColor,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const classes = ['sk-card', `sk-card--${variant}`, `sk-card--padding-${padding}`];
  if (hoverable) classes.push('sk-card--hoverable');
  if (className) classes.push(className);

  const computed: CSSProperties = { ...style };
  if (accentColor) {
    (computed as Record<string, unknown>)['--sk-card-border'] = accentColor;
  }

  return (
    <div className={classes.join(' ')} style={computed} {...rest}>
      {children}
    </div>
  );
}
