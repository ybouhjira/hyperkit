/**
 * File-tree sidebar over the generated nav data. Every docs page is linked
 * here, which is what makes the whole tree reachable for the prerender
 * crawler from any single docs page.
 */
import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { nav } from './content';
import type { NavLeaf } from './types';

function TreeLinks(props: { items: NavLeaf[] }) {
  return (
    <ul class="docs-tree__list">
      <For each={props.items}>
        {(item) => (
          <li>
            <A
              href={`/docs/${item.slug}`}
              class="docs-tree__link"
              activeClass="docs-tree__link--active"
              end
            >
              {item.title}
            </A>
          </li>
        )}
      </For>
    </ul>
  );
}

export function DocsSidebar(props: { currentSlug: string }) {
  return (
    <aside class="docs-sidebar">
      <nav aria-label="Docs">
        <A href="/docs" class="docs-tree__overview" end>
          Documentation
        </A>
        <For each={nav.sections}>
          {(section) => (
            <div class="docs-tree__section">
              <Show
                when={section.slug}
                fallback={<span class="docs-tree__label">{section.label}</span>}
              >
                {(slug) => (
                  <A href={`/docs/${slug()}`} class="docs-tree__label" end>
                    {section.label}
                  </A>
                )}
              </Show>
              <Show when={section.items}>{(items) => <TreeLinks items={items()} />}</Show>
              <Show when={section.categories}>
                {(categories) => (
                  <For each={categories()}>
                    {(category) => (
                      <details
                        class="docs-tree__cat"
                        classList={{
                          'docs-tree__cat--active': props.currentSlug.startsWith(category.slug),
                        }}
                        open={props.currentSlug.startsWith(category.slug)}
                      >
                        <summary>
                          <span class="docs-tree__caret" aria-hidden="true">
                            ▸
                          </span>
                          <span>{category.label}</span>
                        </summary>
                        <ul class="docs-tree__list">
                          <li>
                            <A
                              href={`/docs/${category.slug}`}
                              class="docs-tree__link"
                              activeClass="docs-tree__link--active"
                              end
                            >
                              Overview
                            </A>
                          </li>
                          <For each={category.items}>
                            {(item) => (
                              <li>
                                <A
                                  href={`/docs/${item.slug}`}
                                  class="docs-tree__link"
                                  activeClass="docs-tree__link--active"
                                  end
                                >
                                  {item.title}
                                </A>
                              </li>
                            )}
                          </For>
                        </ul>
                      </details>
                    )}
                  </For>
                )}
              </Show>
            </div>
          )}
        </For>
      </nav>
    </aside>
  );
}
