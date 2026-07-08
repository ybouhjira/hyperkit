import { type Component, lazy, Suspense, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

/** Props for the RangeSlider component. */
export interface RangeSliderProps {
  /** Controlled [min, max] values. */
  value?: [number, number];
  /** Default [min, max] values. */
  defaultValue?: [number, number];
  /** Callback when value changes. */
  onChange?: (value: [number, number]) => void;
  /** Minimum allowed value.
   * @default 0 */
  min?: number;
  /** Maximum allowed value.
   * @default 100 */
  max?: number;
  /** Step increment for dragging.
   * @default 1 */
  step?: number;
  /** Minimum gap between the two handles.
   * @default 0 */
  minGap?: number;
  /** Label text displayed above the slider. */
  label?: string;
  /** Show current min-max values.
   * @default true */
  showValues?: boolean;
  /** Disable interaction.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const RangeSliderImpl = lazy(() =>
  import('./RangeSlider.client').then((m) => ({ default: m.RangeSliderClient }))
);

const NativeRangeSlider: Component<RangeSliderProps> = (props) => {
  return (
    <div class={`sk-range-slider ${props.class || ''}`}>
      <input
        type="range"
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={(props.value ?? props.defaultValue ?? [props.min ?? 0, props.max ?? 100])[0]}
        disabled={props.disabled}
      />
      <input
        type="range"
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={(props.value ?? props.defaultValue ?? [props.min ?? 0, props.max ?? 100])[1]}
        disabled={props.disabled}
      />
    </div>
  );
};

/** Two-handle range slider with min/max values, step control, and minimum gap enforcement. */
export const RangeSlider: Component<RangeSliderProps> = (props) => {
  return (
    <Show when={!isServer} fallback={<NativeRangeSlider {...props} />}>
      <Suspense fallback={<NativeRangeSlider {...props} />}>
        <RangeSliderImpl {...props} />
      </Suspense>
    </Show>
  );
};
