import { type JSX, type Component, splitProps, For, Show } from 'solid-js';

export interface GapCardProps {
  id: string;
  title: string;
  severity: 'critical' | 'important' | 'nice';
  rows?: { tag: 'problem' | 'solution' | 'precedent'; text: string }[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const GapCard: Component<GapCardProps> = (props) => {
  const [local, rest] = splitProps(props, ['id', 'title', 'severity', 'rows', 'class', 'style']);

  return (
    <div
      class={`sk-report-gap-card sk-report-gap-card--${local.severity} ${local.class || ''}`}
      style={local.style}
      {...rest}
    >
      <div class="sk-report-gap-card__header">
        <span class="sk-report-gap-card__id">{local.id}</span>
        <h5 class="sk-report-gap-card__title">{local.title}</h5>
      </div>
      <Show when={local.rows && local.rows.length > 0}>
        <div class="sk-report-gap-card__rows">
          <For each={local.rows}>
            {(row) => (
              <div class="sk-report-gap-card__row">
                <span class={`sk-report-gap-card__tag sk-report-gap-card__tag--${row.tag}`}>
                  {row.tag}
                </span>
                <span class="sk-report-gap-card__text">{row.text}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
