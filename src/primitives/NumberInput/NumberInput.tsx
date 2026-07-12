import { onMount, createSignal, type Component, lazy, Suspense, Show } from 'solid-js';

/** Props for the NumberInput component. */
export interface NumberInputProps {
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Callback when value changes. */
  onChange?: (value: number) => void;
  /** Minimum allowed value.
   * @default -Infinity */
  min?: number;
  /** Maximum allowed value.
   * @default Infinity */
  max?: number;
  /** Step increment for buttons and keyboard.
   * @default 1 */
  step?: number;
  /** Decimal places (auto-detected from step if not provided). */
  precision?: number;
  /** Label text displayed above the input. */
  label?: string;
  /** Disable interaction.
   * @default false */
  disabled?: boolean;
  /** Input size preset. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const NumberInputImpl = lazy(() =>
  import('./NumberInput.client').then((m) => ({ default: m.NumberInputClient }))
);

const NativeNumberInput: Component<NumberInputProps> = (props) => {
  const rootClass = () => {
    if (props.unstyled) return props.class ?? '';
    const classes = ['sk-number-input'];
    if (props.size) classes.push(`sk-number-input--${props.size}`);
    if (props.class) classes.push(props.class);
    return classes.join(' ');
  };
  return (
    <div class={rootClass()}>
      <Show when={props.label}>
        <label class={props.unstyled ? '' : 'sk-number-input__label'}>{props.label}</label>
      </Show>
      <div class={props.unstyled ? '' : 'sk-number-input__controls'}>
        <input
          type="number"
          class={props.unstyled ? '' : 'sk-number-input__field'}
          value={props.value ?? props.defaultValue ?? ''}
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          disabled={props.disabled}
          placeholder={props.placeholder}
        />
      </div>
    </div>
  );
};

/**
 * Number input with increment/decrement buttons, range validation, and precision control.
 *
 * @example
 * ```tsx
 * import { NumberInput, Stack } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Quantity selector with min/max bounds
 * const [qty, setQty] = createSignal(1);
 * <NumberInput
 *   label="Quantity"
 *   value={qty()}
 *   onChange={setQty}
 *   min={1}
 *   max={99}
 * />
 * ```
 *
 * @see Input - for text input fields
 * @see Slider - for range selection with a drag handle
 */
export const NumberInput: Component<NumberInputProps> = (props) => {
  // Mount-gate the Kobalte implementation instead of branching on `isServer`:
  // server and the client's hydration pass must render the SAME tree (the
  // native fallback), or hydration crashes on prerendered pages. The enhanced
  // control swaps in after mount.
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={<NativeNumberInput {...props} />}>
      <Suspense fallback={<NativeNumberInput {...props} />}>
        <NumberInputImpl {...props} />
      </Suspense>
    </Show>
  );
};
