// This file is ONLY imported on the client (via lazy() in RangeSlider.tsx).
// It is safe to import @kobalte/core/slider here.
import { Slider as KobalteSlider } from '@kobalte/core/slider';
import { mergeProps, Show, createSignal, createEffect, type Component } from 'solid-js';
import type { RangeSliderProps } from './RangeSlider';
import './RangeSlider.css';

export const RangeSliderClient: Component<RangeSliderProps> = (props) => {
  const merged = mergeProps(
    {
      min: 0,
      max: 100,
      step: 1,
      minGap: 0,
      showValues: true,
      disabled: false,
    },
    props
  );

  const initialValue = (): [number, number] =>
    merged.value ?? merged.defaultValue ?? [merged.min, merged.max];
  const [currentValue, setCurrentValue] = createSignal<[number, number]>(initialValue());

  createEffect(() => {
    if (merged.value) {
      setCurrentValue(merged.value);
    }
  });

  const handleChange = (value: number[]) => {
    if (value.length === 2) {
      let [minVal, maxVal] = value as [number, number];

      if (merged.minGap > 0) {
        const gap = maxVal - minVal;
        if (gap < merged.minGap) {
          const prevValue = currentValue();
          if (minVal !== prevValue[0]) {
            maxVal = Math.min(merged.max, minVal + merged.minGap);
          } else {
            minVal = Math.max(merged.min, maxVal - merged.minGap);
          }
        }
      }

      const newValue: [number, number] = [minVal, maxVal];
      setCurrentValue(newValue);
      if (merged.onChange) {
        merged.onChange(newValue);
      }
    }
  };

  return (
    <KobalteSlider
      value={merged.value}
      defaultValue={merged.defaultValue || [merged.min, merged.max]}
      onChange={handleChange}
      minValue={merged.min}
      maxValue={merged.max}
      step={merged.step}
      disabled={merged.disabled}
      class={`sk-range-slider ${merged.class || ''}`}
    >
      <div class="sk-range-slider__header">
        <Show when={merged.label}>
          <KobalteSlider.Label class="sk-range-slider__label">{merged.label}</KobalteSlider.Label>
        </Show>
        <Show when={merged.showValues}>
          <div class="sk-range-slider__value">
            {currentValue()[0]} - {currentValue()[1]}
          </div>
        </Show>
      </div>
      <KobalteSlider.Track class="sk-range-slider__track">
        <KobalteSlider.Fill class="sk-range-slider__fill" />
        <KobalteSlider.Thumb class="sk-range-slider__thumb">
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
        <KobalteSlider.Thumb class="sk-range-slider__thumb">
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  );
};
