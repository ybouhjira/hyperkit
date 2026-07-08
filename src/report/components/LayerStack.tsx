import { type JSX, type Component, splitProps, For } from 'solid-js';

export interface StackLayer {
  label: string;
  name: string;
  info: string;
  color: 'purple' | 'blue' | 'teal' | 'green';
}

export interface LayerStackProps {
  layers: StackLayer[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const LayerStack: Component<LayerStackProps> = (props) => {
  const [local, rest] = splitProps(props, ['layers', 'class', 'style']);

  return (
    <div class={`sk-report-layer-stack ${local.class || ''}`} style={local.style} {...rest}>
      <For each={local.layers}>
        {(layer) => (
          <div class={`sk-report-layer sk-report-layer--${layer.color}`}>
            <div class="sk-report-layer__num">{layer.label}</div>
            <div class="sk-report-layer__name">{layer.name}</div>
            {/* eslint-disable-next-line solid/no-innerhtml */}
            <div class="sk-report-layer__info" innerHTML={layer.info} />
          </div>
        )}
      </For>
    </div>
  );
};
