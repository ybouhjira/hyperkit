import { useState, type CSSProperties } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import '@ybouhjira/hyperkit-styles/primitives/Checkbox/Checkbox.css';

export interface CheckboxProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Label text displayed next to the checkbox. */
  label?: string;
  disabled?: boolean;
  /** Show an indeterminate/mixed state. */
  indeterminate?: boolean;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

/**
 * Accessible checkbox on @radix-ui/react-checkbox rendering the same
 * `sk-checkbox` contract as the SolidJS package. The shared CSS keys states
 * off Kobalte-style data attributes ([data-checked], [data-indeterminate],
 * [data-disabled]) — the wrapper mirrors them from its own state.
 */
export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  indeterminate,
  size = 'md',
  className,
  style,
}: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internal;

  const handleChange = (next: boolean | 'indeterminate') => {
    const value = next === true;
    setInternal(value);
    onChange?.(value);
  };

  return (
    <label
      className={`sk-checkbox sk-checkbox--${size}${className ? ` ${className}` : ''}`}
      style={style}
      data-checked={isChecked ? '' : undefined}
      data-indeterminate={indeterminate ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-testid="checkbox-root"
    >
      <RadixCheckbox.Root
        className="sk-checkbox__control"
        checked={indeterminate ? 'indeterminate' : isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
      >
        <RadixCheckbox.Indicator className="sk-checkbox__indicator" forceMount>
          {(indeterminate || isChecked) && (
            <svg
              className="sk-checkbox__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              aria-hidden="true"
            >
              {indeterminate ? <line x1="5" y1="12" x2="19" y2="12" /> : <polyline points="20 6 9 17 4 12" />}
            </svg>
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label != null && <span className="sk-checkbox__label">{label}</span>}
    </label>
  );
}
