/** On-page table of contents with a lightweight scroll-spy. */
import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js';
import type { TocItem } from './types';

export function DocsToc(props: { items: TocItem[] }) {
  const [activeId, setActiveId] = createSignal<string | null>(null);

  // Re-observe on every page change (the catch-all route component is reused
  // across docs navigations, so this must be an effect, not onMount).
  createEffect(() => {
    const headings = props.items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    setActiveId(null);
    if (headings.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = headings.find((h) => visible.has(h.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: '-56px 0px -70% 0px' }
    );
    for (const heading of headings) observer.observe(heading);
    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={props.items.length > 0}>
      <aside class="docs-toc" aria-label="On this page">
        <p class="docs-toc__label">On this page</p>
        <ul class="docs-toc__list">
          <For each={props.items}>
            {(item) => (
              <li class={`docs-toc__item--depth-${item.depth}`}>
                <a
                  href={`#${item.id}`}
                  class="docs-toc__link"
                  classList={{ 'docs-toc__link--active': activeId() === item.id }}
                >
                  {item.text}
                </a>
              </li>
            )}
          </For>
        </ul>
      </aside>
    </Show>
  );
}
