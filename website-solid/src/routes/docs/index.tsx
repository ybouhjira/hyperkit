/** /docs — documentation overview linking into every section. */
import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { nav, componentsIndex } from '../../components/docs/content';
import { DocsPager } from '../../components/docs/DocsPager';
import type { NavSection } from '../../components/docs/types';

function sectionTarget(section: NavSection): string {
  if (section.slug) return section.slug;
  return section.items?.[0]?.slug ?? '';
}

function sectionCount(section: NavSection): number {
  if (section.categories) {
    return section.categories.reduce((sum, category) => sum + category.items.length, 0);
  }
  return section.items?.length ?? 0;
}

export default function DocsIndex() {
  return (
    <main class="docs-main">
      <Title>Documentation — HyperKit</Title>
      <Meta
        name="description"
        content="HyperKit documentation — getting started, guides, the full component catalog, systems, and packages."
      />
      <article class="docs-md">
        <h1 class="docs-article__title">Documentation</h1>
        <p class="docs-article__lede">
          Everything you need to build with HyperKit: installation and theming, in-depth guides, the{' '}
          {componentsIndex.total}-component catalog with live playgrounds, the framework systems,
          and the monorepo packages.
        </p>
        <div class="docs-cards">
          <For each={nav.sections}>
            {(section) => (
              <A href={`/docs/${sectionTarget(section)}`} class="docs-card">
                <span class="docs-card__body">
                  <span class="docs-card__name">{section.label}</span>
                  <span class="docs-card__desc">
                    {sectionCount(section)} pages
                    <Show when={section.categories}>
                      {' '}
                      · {section.categories?.length} categories
                    </Show>
                  </span>
                </span>
              </A>
            )}
          </For>
        </div>
      </article>
      <DocsPager slug="" />
    </main>
  );
}
