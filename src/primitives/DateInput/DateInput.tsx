import { type Component, type JSX, splitProps, createSignal, Show, mergeProps } from 'solid-js';
import './DateInput.css';

/** Props for the DateInput component. */
export interface DateInputProps {
  /** Controlled date value in ISO format. */
  value?: string;
  /** Initial date value for uncontrolled mode. */
  defaultValue?: string;
  /** Callback when date changes. */
  onChange?: (value: string) => void;
  /** Minimum selectable date in ISO format. */
  min?: string;
  /** Maximum selectable date in ISO format. */
  max?: string;
  /** Label text displayed above the input. */
  label?: string;
  /** Placeholder text.
   * @default 'Select date' */
  placeholder?: string;
  /** Disable the date picker.
   * @default false */
  disabled?: boolean;
  /** Mark the field as required.
   * @default false */
  required?: boolean;
  /** Include time selection (datetime-local input).
   * @default false */
  includeTime?: boolean;
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/** Date picker with calendar icon, clear button, and formatted display. */
export const DateInput: Component<DateInputProps> = (props) => {
  const merged = mergeProps(
    {
      placeholder: 'Select date',
      disabled: false,
      required: false,
      includeTime: false,
      size: 'md' as const,
    },
    props
  );

  const [local, rest] = splitProps(merged, [
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'label',
    'placeholder',
    'disabled',
    'required',
    'includeTime',
    'size',
    'class',
    'style',
    'unstyled',
  ]);

  const [internalValue, setInternalValue] = createSignal(local.defaultValue || '');

  const isControlled = () => local.value !== undefined;
  const currentValue = () => (isControlled() ? (local.value ?? '') : internalValue());

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    if (!isControlled()) {
      setInternalValue(newValue);
    }

    local.onChange?.(newValue);
  };

  const handleClear = () => {
    if (!isControlled()) {
      setInternalValue('');
    }
    local.onChange?.('');
  };

  const formatDisplayValue = (value: string) => {
    if (!value) return '';

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      if (local.includeTime) {
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  };

  return (
    <div
      class={
        local.unstyled
          ? local.class || ''
          : `sk-date-input ${local.size} ${local.disabled ? 'disabled' : ''} ${local.class || ''}`
      }
      style={local.style}
      {...rest}
    >
      <Show when={local.label}>
        <label class={local.unstyled ? '' : 'sk-date-input-label'}>
          {local.label}
          <Show when={local.required}>
            <span class={local.unstyled ? '' : 'sk-date-input-required'}>*</span>
          </Show>
        </label>
      </Show>

      <div class={local.unstyled ? '' : 'sk-date-input-wrapper'}>
        <input
          type={local.includeTime ? 'datetime-local' : 'date'}
          class={local.unstyled ? '' : 'sk-date-input-control'}
          value={currentValue()}
          onInput={handleChange}
          min={local.min}
          max={local.max}
          placeholder={local.placeholder}
          disabled={local.disabled}
          required={local.required}
        />

        <svg
          class={local.unstyled ? '' : 'sk-date-input-icon'}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.667 2.667H3.333A.667.667 0 0 0 2.667 3.333v9.334a.667.667 0 0 0 .666.666h9.334a.667.667 0 0 0 .666-.666V3.333a.667.667 0 0 0-.666-.666ZM5.333 1.333v2.667M10.667 1.333v2.667M2.667 6.667h10.666"
            stroke="currentColor"
            stroke-width="1.333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <Show when={currentValue() && !local.disabled}>
          <button
            type="button"
            class={local.unstyled ? '' : 'sk-date-input-clear'}
            onClick={handleClear}
            aria-label="Clear date"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 3L3 9M3 3l6 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </Show>
      </div>

      <Show when={currentValue()}>
        <div class={local.unstyled ? '' : 'sk-date-input-display'}>
          {formatDisplayValue(currentValue())}
        </div>
      </Show>
    </div>
  );
};
