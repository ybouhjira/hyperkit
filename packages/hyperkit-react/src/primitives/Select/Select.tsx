import type { CSSProperties } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import '@ybouhjira/hyperkit-styles/primitives/Select/Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  /** Currently selected option value. */
  value?: string;
  onChange?: (value: string) => void;
  /** @default 'Select...' */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Dropdown select on @radix-ui/react-select rendering the same `sk-select`
 * contract as the SolidJS package.
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled,
  className,
  style,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={`sk-select__trigger${className ? ` ${className}` : ''}`}
        style={style}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="sk-select__icon">▾</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="sk-select__content" position="popper" sideOffset={4}>
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="sk-select__item"
                data-selected={value === option.value ? '' : undefined}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="sk-select__item-check">
                  ✓
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
