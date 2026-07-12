// This file is ONLY imported on the client (via lazy() in Slider.tsx).
// It is safe to import @kobalte/core/slider here.
import { type Component, splitProps, Show } from 'solid-js';
import { Slider as KobalteSlider } from '@kobalte/core/slider';
import type { SliderProps } from './Slider';
import '@ybouhjira/hyperkit-styles/primitives/Slider/Slider.css';

export const SliderClient: Component<SliderProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'min',
    'max',
    'step',
    'label',
    'showValue',
    'disabled',
    'class',
    'unstyled',
  ]);

  const minValue = () => local.min ?? 0;
  const maxValue = () => local.max ?? 100;
  const stepValue = () => local.step ?? 1;
  const showValueLabel = () => local.showValue ?? true;

  const handleChange = (values: number[]) => {
    if (local.onChange && values.length > 0) {
      local.onChange(values[0] ?? 0);
    }
  };

  const isControlled = () => local.value !== undefined;
  const sliderProps = () => {
    const base = {
      class: local.unstyled ? local.class || '' : `sk-slider ${local.class || ''}`,
      onChange: handleChange,
      minValue: minValue(),
      maxValue: maxValue(),
      step: stepValue(),
      disabled: local.disabled,
      ...others,
    };

    if (isControlled()) {
      return { ...base, value: [local.value ?? 0] };
    } else {
      const defaultVal = local.defaultValue ?? minValue();
      return { ...base, defaultValue: [defaultVal] };
    }
  };

  return (
    <KobalteSlider {...sliderProps()}>
      <Show when={local.label}>
        <div class={local.unstyled ? '' : 'sk-slider__header'}>
          <KobalteSlider.Label class={local.unstyled ? '' : 'sk-slider__label'}>
            {local.label}
          </KobalteSlider.Label>
          <Show when={showValueLabel()}>
            <KobalteSlider.ValueLabel class={local.unstyled ? '' : 'sk-slider__value'} />
          </Show>
        </div>
      </Show>
      <KobalteSlider.Track class={local.unstyled ? '' : 'sk-slider__track'}>
        <KobalteSlider.Fill class={local.unstyled ? '' : 'sk-slider__fill'} />
        <KobalteSlider.Thumb class={local.unstyled ? '' : 'sk-slider__thumb'}>
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  );
};
