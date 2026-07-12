import { type Component, createSignal, lazy, onMount, Suspense, Show, For } from 'solid-js';

export interface SelectOption {
  /** Unique value for this option. */
  value: string;
  /** Display label for this option. */
  label: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

export interface SelectProps {
  /** Array of selectable options. */
  options: SelectOption[];
  /** Currently selected option value. */
  value?: string;
  /** Callback fired when selection changes. */
  onChange?: (value: string) => void;
  /** Placeholder text shown when no option is selected.
   * @default 'Select...' */
  placeholder?: string;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Additional CSS class name for the trigger button. */
  class?: string;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const SelectImpl = lazy(() => import('./Select.client').then((m) => ({ default: m.SelectClient })));

const NativeSelect: Component<SelectProps> = (props) => (
  <select
    class={
      props.unstyled
        ? (props.class ?? '')
        : `sk-select__trigger${props.class ? ` ${props.class}` : ''}`
    }
    disabled={props.disabled}
    value={props.value ?? ''}
  >
    <Show when={!props.value}>
      <option value="" disabled>
        {props.placeholder ?? 'Select...'}
      </option>
    </Show>
    <For each={props.options}>
      {(o) => (
        <option value={o.value} disabled={o.disabled} selected={o.value === props.value}>
          {o.label}
        </option>
      )}
    </For>
  </select>
);

/**
 * Dropdown select component with searchable options and keyboard navigation support.
 *
 * @example
 * ```tsx
 * import { Select, Stack } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Controlled select with typed options
 * const [region, setRegion] = createSignal("us-east-1");
 * <Select
 *   value={region()}
 *   onChange={setRegion}
 *   options={[
 *     { value: "us-east-1", label: "US East (N. Virginia)" },
 *     { value: "eu-west-1", label: "Europe (Ireland)" },
 *     { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
 *   ]}
 * />
 * ```
 *
 * @see Input - for text input fields
 * @see Switch - for binary on/off settings
 */
export const Select: Component<SelectProps> = (props) => {
  // Mount-gate the Kobalte implementation instead of branching on `isServer`:
  // the server and the client's hydration pass must render the SAME tree
  // (the native fallback), otherwise hydration crashes on prerendered pages.
  // After mount the enhanced select swaps in.
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={<NativeSelect {...props} />}>
      <Suspense fallback={<NativeSelect {...props} />}>
        <SelectImpl {...props} />
      </Suspense>
    </Show>
  );
};
