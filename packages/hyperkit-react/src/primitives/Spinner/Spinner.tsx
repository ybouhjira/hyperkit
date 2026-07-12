import type { CSSProperties } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Spinner/Spinner.css';

export interface SpinnerProps {
  /** @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** @default 'accent' */
  color?: 'accent' | 'muted' | 'current';
  /** Accessible label; also rendered when provided. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Loading spinner rendering the same `sk-spinner` contract as the SolidJS package. */
export function Spinner({ size = 'md', color = 'accent', label, className, style }: SpinnerProps) {
  return (
    <span
      className={`sk-spinner sk-spinner--${size} sk-spinner--${color}${className ? ` ${className}` : ''}`}
      style={style}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      {label != null && <span className="sk-spinner__label">{label}</span>}
    </span>
  );
}
