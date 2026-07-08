import { type Component, splitProps, Show, For } from 'solid-js';

export interface ReportHeroMeta {
  label: string;
  icon?: string;
}

export interface ReportHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  meta?: ReportHeroMeta[];
}

export const ReportHero: Component<ReportHeroProps> = (props) => {
  const [local, others] = splitProps(props, ['title', 'subtitle', 'badge', 'meta']);

  return (
    <div class="sk-report-hero" {...others}>
      <Show when={local.badge}>
        <div class="sk-report-hero__badge">{local.badge}</div>
      </Show>
      <h1 class="sk-report-hero__title">{local.title}</h1>
      <Show when={local.subtitle}>
        <p class="sk-report-hero__subtitle">{local.subtitle}</p>
      </Show>
      <Show when={local.meta && local.meta.length > 0}>
        <div class="sk-report-hero__meta">
          <For each={local.meta}>
            {(item) => (
              <div class="sk-report-hero__meta-item">
                <Show when={item.icon}>
                  <span>{item.icon}</span>
                </Show>
                <span>{item.label}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
