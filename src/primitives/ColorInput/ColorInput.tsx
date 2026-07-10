import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  Show,
  createMemo,
  createEffect,
  For,
} from 'solid-js';
import './ColorInput.css';

/** Props for the ColorInput component. */
export interface ColorInputProps {
  /** Controlled color value in hex format. */
  value?: string;
  /** Initial color value for uncontrolled mode.
   * @default '#000000' */
  defaultValue?: string;
  /** Callback when color changes. */
  onChange?: (color: string) => void;
  /** Display format for the color value.
   * @default 'hex' */
  format?: 'hex' | 'rgb' | 'hsl';
  /** Show alpha/opacity slider.
   * @default false */
  showAlpha?: boolean;
  /** Array of preset colors to display as quick-select swatches. */
  presets?: string[];
  /** Label text displayed above the input. */
  label?: string;
  /** Disable the color picker.
   * @default false */
  disabled?: boolean;
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md';
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function formatColor(hex: string, format: 'hex' | 'rgb' | 'hsl'): string {
  if (format === 'hex') {
    return hex.toUpperCase();
  }

  if (format === 'rgb') {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (format === 'hsl') {
    const { h, s, l } = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  return hex;
}

function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/^#/, '');
  return `#${cleaned}`.toLowerCase();
}

/** Color picker with text input, native picker, alpha control, and preset swatches. */
export const ColorInput: Component<ColorInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'format',
    'showAlpha',
    'presets',
    'label',
    'disabled',
    'size',
    'class',
    'style',
  ]);

  const [internalColor, setInternalColor] = createSignal(
    // Data: documented API default for the color VALUE, not theme chrome.
    normalizeHex(local.defaultValue ?? '#000000')
  );

  const [alpha, setAlpha] = createSignal(1);
  const [textValue, setTextValue] = createSignal('');

  const isControlled = () => local.value !== undefined;
  const currentColor = () => {
    if (isControlled() && local.value !== undefined) {
      return normalizeHex(local.value);
    }
    return internalColor();
  };

  const displayValue = createMemo(() => {
    return formatColor(currentColor(), local.format ?? 'hex');
  });

  createEffect(() => {
    setTextValue(displayValue());
  });

  const handleColorChange = (newColor: string) => {
    const normalized = normalizeHex(newColor);
    if (!isControlled()) {
      setInternalColor(normalized);
    }
    local.onChange?.(normalized);
  };

  const handleSwatchClick = () => {
    if (local.disabled) return;
    const input = document.getElementById('color-picker-native') as HTMLInputElement;
    input?.click();
  };

  const handleNativeColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    handleColorChange(target.value);
  };

  const handleTextInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setTextValue(target.value);
  };

  const handleTextInputBlur = () => {
    const trimmed = textValue().trim();
    if (isValidHex(trimmed)) {
      handleColorChange(trimmed);
    } else {
      // Reset to current color if invalid
      setTextValue(displayValue());
    }
  };

  const handlePresetClick = (color: string) => {
    if (local.disabled) return;
    handleColorChange(color);
  };

  const handleAlphaChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setAlpha(parseFloat(target.value));
  };

  const sizeClass = () => (local.size === 'sm' ? 'sk-color-input--sm' : '');

  return (
    <div
      class={`sk-color-input ${sizeClass()} ${local.class ?? ''}`}
      classList={{ 'sk-color-input--disabled': local.disabled }}
      style={local.style}
      {...others}
    >
      <Show when={local.label}>
        <label class="sk-color-input__label">{local.label}</label>
      </Show>

      <div class="sk-color-input__container">
        <input
          id="color-picker-native"
          type="color"
          class="sk-color-input__native"
          value={currentColor()}
          onInput={handleNativeColorChange}
          disabled={local.disabled}
        />

        <button
          type="button"
          class="sk-color-input__swatch"
          style={{ '--sk-color-input-swatch-color': currentColor() }}
          onClick={handleSwatchClick}
          disabled={local.disabled}
          aria-label="Choose color"
        />

        <input
          type="text"
          class="sk-color-input__text"
          value={textValue()}
          onInput={handleTextInputChange}
          onBlur={handleTextInputBlur}
          disabled={local.disabled}
          aria-label="Color value"
        />
      </div>

      <Show when={local.showAlpha}>
        <div class="sk-color-input__alpha">
          <label class="sk-color-input__alpha-label">Alpha</label>
          <input
            type="range"
            class="sk-color-input__alpha-slider"
            min="0"
            max="1"
            step="0.01"
            value={alpha()}
            onInput={handleAlphaChange}
            disabled={local.disabled}
          />
          <span class="sk-color-input__alpha-value">{alpha().toFixed(2)}</span>
        </div>
      </Show>

      <Show when={local.presets && local.presets.length > 0}>
        <div class="sk-color-input__presets">
          <For each={local.presets}>
            {(preset) => (
              <button
                type="button"
                class="sk-color-input__preset"
                style={{ '--sk-color-input-swatch-color': preset }}
                onClick={() => handlePresetClick(preset)}
                disabled={local.disabled}
                aria-label={`Preset color ${preset}`}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
