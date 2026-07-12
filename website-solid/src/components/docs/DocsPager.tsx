/** Previous/next pagination across the docs reading order. */
import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { pagination } from './content';

export function DocsPager(props: { slug: string }) {
  const pager = () => pagination(props.slug);
  return (
    <Show when={pager().prev || pager().next}>
      <nav class="docs-pager" aria-label="Docs pages">
        <Show when={pager().prev} fallback={<span class="docs-pager__spacer" />}>
          {(prev) => (
            <A href={`/docs/${prev().slug}`} class="docs-pager__link">
              <span class="docs-pager__dir">← Previous</span>
              <span class="docs-pager__title">{prev().title}</span>
            </A>
          )}
        </Show>
        <Show when={pager().next} fallback={<span class="docs-pager__spacer" />}>
          {(next) => (
            <A href={`/docs/${next().slug}`} class="docs-pager__link docs-pager__link--next">
              <span class="docs-pager__dir">Next →</span>
              <span class="docs-pager__title">{next().title}</span>
            </A>
          )}
        </Show>
      </nav>
    </Show>
  );
}
