import { onMount, createSignal, type Component, lazy, Suspense, Show } from 'solid-js';

export interface SliderProps {
  /**
   * Controlled value
   */
  value?: number;

  /**
   * Uncontrolled initial value
   */
  defaultValue?: number;

  /**
   * Change handler called when the value changes
   */
  onChange?: (value: number) => void;

  /**
   * Minimum value
   * @default 0
   */
  min?: number;

  /**
   * Maximum value
   * @default 100
   */
  max?: number;

  /**
   * Step increment
   * @default 1
   */
  step?: number;

  /**
   * Label text
   */
  label?: string;

  /**
   * Show current value next to label
   * @default true
   */
  showValue?: boolean;

  /**
   * Disable interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * Remove sk-* styling classes
   */
  unstyled?: boolean;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const SliderImpl = lazy(() => import('./Slider.client').then((m) => ({ default: m.SliderClient })));

const NativeSlider: Component<SliderProps> = (props) => (
  <div class={props.unstyled ? props.class || '' : `sk-slider ${props.class || ''}`}>
    <input
      type="range"
      min={props.min ?? 0}
      max={props.max ?? 100}
      step={props.step ?? 1}
      value={props.value ?? props.defaultValue ?? props.min ?? 0}
      disabled={props.disabled}
    />
  </div>
);

/** Single-handle slider with label, value display, and step control. */
export const Slider: Component<SliderProps> = (props) => {
  // Mount-gate the Kobalte implementation instead of branching on `isServer`:
  // server and the client's hydration pass must render the SAME tree (the
  // native fallback), or hydration crashes on prerendered pages. The enhanced
  // control swaps in after mount.
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={<NativeSlider {...props} />}>
      <Suspense fallback={<NativeSlider {...props} />}>
        <SliderImpl {...props} />
      </Suspense>
    </Show>
  );
};
