// This file is ONLY imported on the client (via lazy() in NumberInput.tsx).
// It is safe to import @kobalte/core/number-field here.
import { type Component, splitProps, Show, createMemo } from 'solid-js';
import { NumberField } from '@kobalte/core/number-field';
import type { NumberInputProps } from './NumberInput';
import '@ybouhjira/hyperkit-styles/primitives/NumberInput/NumberInput.css';

export const NumberInputClient: Component<NumberInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'disabled',
    'size',
    'class',
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'precision',
    'placeholder',
    'unstyled',
  ]);

  // Auto-detect precision from step
  const computedPrecision = createMemo(() => {
    if (local.precision !== undefined) return local.precision;
    if (local.step === undefined) return 0;
    const stepStr = local.step.toString();
    const decimalIndex = stepStr.indexOf('.');
    return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
  });

  const rootClass = createMemo(() => {
    if (local.unstyled) return local.class ?? '';
    const classes = ['sk-number-input'];
    if (local.size) classes.push(`sk-number-input--${local.size}`);
    if (local.class) classes.push(local.class);
    return classes.join(' ');
  });

  const handleChange = (value: string) => {
    if (local.onChange) {
      const numValue = parseFloat(value);
      local.onChange(numValue);
    }
  };

  return (
    <NumberField
      class={rootClass()}
      {...(local.value !== undefined ? { value: local.value } : {})}
      {...(local.defaultValue !== undefined ? { defaultValue: local.defaultValue } : {})}
      onChange={handleChange}
      minValue={local.min ?? -Infinity}
      maxValue={local.max ?? Infinity}
      step={local.step ?? 1}
      formatOptions={{
        minimumFractionDigits: computedPrecision(),
        maximumFractionDigits: computedPrecision(),
      }}
      {...(local.disabled !== undefined ? { disabled: local.disabled } : {})}
      {...others}
    >
      <Show when={local.label}>
        <NumberField.Label class={local.unstyled ? '' : 'sk-number-input__label'}>
          {local.label}
        </NumberField.Label>
      </Show>
      <div class={local.unstyled ? '' : 'sk-number-input__controls'}>
        <NumberField.DecrementTrigger
          class={local.unstyled ? '' : 'sk-number-input__button sk-number-input__button--decrement'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </NumberField.DecrementTrigger>
        <NumberField.Input
          class={local.unstyled ? '' : 'sk-number-input__field'}
          placeholder={local.placeholder}
        />
        <NumberField.IncrementTrigger
          class={local.unstyled ? '' : 'sk-number-input__button sk-number-input__button--increment'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2V10M2 6H10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </NumberField.IncrementTrigger>
      </div>
    </NumberField>
  );
};
