import { type JSX, type Component, splitProps, For, Show } from 'solid-js';

export interface FlowLayer {
  id: string;
  title: string;
  packages?: string;
  subtitle?: string;
  color: 'app' | 'adapter' | 'core';
}

export interface FlowDiagramProps {
  title?: string;
  layers: FlowLayer[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const FlowDiagram: Component<FlowDiagramProps> = (props) => {
  const [local, rest] = splitProps(props, ['title', 'layers', 'class', 'style']);

  return (
    <div class={`sk-report-flow ${local.class || ''}`} style={local.style} {...rest}>
      <Show when={local.title}>
        <h3 class="sk-report-flow__title">{local.title}</h3>
      </Show>
      <div class="sk-report-flow__layers">
        <For each={local.layers}>
          {(layer, index) => (
            <>
              <div class={`sk-report-flow__layer sk-report-flow__layer--${layer.color}`}>
                <div class="sk-report-flow__layer-title">{layer.title}</div>
                <Show when={layer.packages}>
                  <div class="sk-report-flow__layer-packages">{layer.packages}</div>
                </Show>
                <Show when={layer.subtitle}>
                  <div class="sk-report-flow__layer-subtitle">{layer.subtitle}</div>
                </Show>
              </div>
              <Show when={index() < local.layers.length - 1}>
                <div class="sk-report-flow__arrow" />
              </Show>
            </>
          )}
        </For>
      </div>
    </div>
  );
};
