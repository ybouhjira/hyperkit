import { type Component, splitProps, For } from 'solid-js';

export interface SummaryGridItem {
  icon: string;
  iconColor?: 'teal' | 'blue' | 'purple';
  title: string;
  description: string;
}

export interface SummaryGridProps {
  items: SummaryGridItem[];
}

export const SummaryGrid: Component<SummaryGridProps> = (props) => {
  const [local, others] = splitProps(props, ['items']);

  return (
    <div class="sk-report-summary-grid" {...others}>
      <For each={local.items}>
        {(item) => (
          <div class="sk-report-summary-card">
            <div
              class={`sk-report-summary-card__icon sk-report-summary-card__icon--${item.iconColor ?? 'teal'}`}
            >
              {item.icon}
            </div>
            <div class="sk-report-summary-card__title">{item.title}</div>
            <div class="sk-report-summary-card__desc">{item.description}</div>
          </div>
        )}
      </For>
    </div>
  );
};
