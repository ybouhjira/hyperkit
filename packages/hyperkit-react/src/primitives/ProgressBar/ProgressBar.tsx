import type { CSSProperties } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/ProgressBar/ProgressBar.css';

export interface ProgressBarProps {
  /** Progress 0–100. Ignored when indeterminate. */
  value?: number;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Fill color — defaults to the accent token. */
  color?: string;
  indeterminate?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Horizontal progress bar rendering the same `sk-progress` contract as the SolidJS package. */
export function ProgressBar({
  value = 0,
  size = 'md',
  color,
  indeterminate = false,
  className,
  style,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`sk-progress sk-progress--${size}${indeterminate ? ' sk-progress--indeterminate' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
    >
      <div
        className={`sk-progress__fill${indeterminate ? ' sk-progress__fill--indeterminate' : ''}`}
        style={{
          ...(indeterminate ? null : { width: `${clamped}%` }),
          background: color ?? 'var(--sk-accent)',
        }}
      />
    </div>
  );
}
