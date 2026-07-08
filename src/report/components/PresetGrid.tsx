import { type JSX, type Component, splitProps, For } from 'solid-js';

export interface PresetItem {
  name: string;
  description: string;
  gradient: string;
}

export interface PresetGridProps {
  presets: PresetItem[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const PresetGrid: Component<PresetGridProps> = (props) => {
  const [local, rest] = splitProps(props, ['presets', 'class', 'style']);

  return (
    <div class={`sk-report-preset-grid ${local.class || ''}`} style={local.style} {...rest}>
      <For each={local.presets}>
        {(preset) => (
          <div class="sk-report-preset-card">
            <div class="sk-report-preset-swatch" style={{ background: preset.gradient }} />
            <div class="sk-report-preset-card__name">{preset.name}</div>
            <div class="sk-report-preset-card__desc">{preset.description}</div>
          </div>
        )}
      </For>
    </div>
  );
};
