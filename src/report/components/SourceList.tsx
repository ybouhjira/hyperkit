import { type JSX, type Component, splitProps, For, Show } from 'solid-js';

export interface SourceGroup {
  title: string;
  sources: { url: string; label: string; description?: string }[];
}

export interface SourceListProps {
  groups: SourceGroup[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const SourceList: Component<SourceListProps> = (props) => {
  const [local, rest] = splitProps(props, ['groups', 'class', 'style']);

  return (
    <div class={`sk-report-sources ${local.class || ''}`} style={local.style} {...rest}>
      <For each={local.groups}>
        {(group) => (
          <div class="sk-report-source-group">
            <h4 class="sk-report-source-group__title">{group.title}</h4>
            <ul class="sk-report-source-list">
              <For each={group.sources}>
                {(source) => (
                  <li class="sk-report-source-list__item">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="sk-report-source-list__link"
                    >
                      {source.label}
                    </a>
                    <Show when={source.description}>
                      <span class="sk-report-source-list__desc">{source.description}</span>
                    </Show>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </div>
  );
};
