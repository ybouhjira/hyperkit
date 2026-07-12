import { useId, useState, type CSSProperties } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import '@ybouhjira/hyperkit-styles/primitives/Switch/Switch.css';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Label text displayed next to the switch. */
  label?: string;
  /** Description text displayed below the label. */
  description?: string;
  disabled?: boolean;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

/**
 * Toggle switch on @radix-ui/react-switch rendering the same `sk-switch`
 * contract as the SolidJS package (states mirrored as [data-checked] /
 * [data-disabled] for the shared CSS).
 */
export function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  disabled,
  size = 'md',
  className,
  style,
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internal;
  const labelId = useId();

  const handleChange = (next: boolean) => {
    setInternal(next);
    onChange?.(next);
  };

  return (
    <label
      className={`sk-switch sk-switch--${size}${className ? ` ${className}` : ''}`}
      style={style}
      data-checked={isChecked ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="sk-switch__main">
        {label != null && (
          <span id={labelId} className="sk-switch__label">
            {label}
          </span>
        )}
        {description != null && <span className="sk-switch__description">{description}</span>}
      </div>
      <RadixSwitch.Root
        className="sk-switch__control"
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        aria-labelledby={label != null ? labelId : undefined}
        data-checked={isChecked ? '' : undefined}
      >
        <RadixSwitch.Thumb className="sk-switch__thumb" />
      </RadixSwitch.Root>
    </label>
  );
}
