import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Button/Button.css';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Visual style variant.
   * @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
  /** Control height/padding scale.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Show a spinner and disable interaction. */
  loading?: boolean;
  /** Stretch to the container's full width. */
  fullWidth?: boolean;
  /** Fully rounded (pill) shape. */
  rounded?: boolean;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Button rendering the same `sk-btn` CSS contract as the SolidJS package —
 * identical class names, styled entirely by @ybouhjira/hyperkit-styles tokens.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  rounded = false,
  unstyled = false,
  className,
  style,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) {
  const computedStyle: CSSProperties = {
    ...style,
    ...(fullWidth ? { width: '100%' } : null),
    ...(rounded ? { borderRadius: '9999px' } : null),
  };

  const rootClass = unstyled
    ? (className ?? '')
    : `sk-btn sk-btn--${variant} sk-btn--${size}${className ? ` ${className}` : ''}`;

  return (
    <button
      className={rootClass}
      style={computedStyle}
      disabled={disabled || loading}
      type={type ?? 'button'}
      {...rest}
    >
      {loading && (
        <svg
          className={unstyled ? '' : 'sk-btn__spinner'}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
