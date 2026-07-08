import { type JSX, type Component, splitProps, Show } from 'solid-js';

export interface ReportSectionProps {
  id: string;
  label?: string;
  title: string;
  description?: string;
  descriptionHtml?: boolean;
  children: JSX.Element;
}

export const ReportSection: Component<ReportSectionProps> = (props) => {
  const [local, others] = splitProps(props, [
    'id',
    'label',
    'title',
    'description',
    'descriptionHtml',
    'children',
  ]);

  return (
    <section class="sk-report-section" id={local.id} {...others}>
      <Show when={local.label}>
        <div class="sk-report-section__label">{local.label}</div>
      </Show>
      <h2 class="sk-report-section__title">{local.title}</h2>
      <Show when={local.description}>
        {local.descriptionHtml ? (
          // eslint-disable-next-line solid/no-innerhtml
          <p class="sk-report-section__desc" innerHTML={local.description} />
        ) : (
          <p class="sk-report-section__desc">{local.description}</p>
        )}
      </Show>
      {local.children}
    </section>
  );
};
