/**
 * Overview pages for the component catalog: the full /docs/components index
 * (all categories) and per-category pages, both as thumbnail card grids.
 * These pages link every component page, which keeps the whole catalog
 * reachable for the prerender crawler.
 */
import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { componentsIndex } from './content';
import type { ComponentsIndexCategory, ComponentsIndexItem } from './types';

function ComponentCard(props: { categorySlug: string; item: ComponentsIndexItem }) {
  return (
    <A href={`/docs/components/${props.categorySlug}/${props.item.name}`} class="docs-card">
      <Show
        when={props.item.thumbnail}
        fallback={
          <span class="docs-card__thumb docs-card__thumb--placeholder" aria-hidden="true">
            {'<'}
            {props.item.name}
            {' />'}
          </span>
        }
      >
        {(src) => (
          <img
            class="docs-card__thumb"
            src={src()}
            alt={`${props.item.name} preview`}
            loading="lazy"
          />
        )}
      </Show>
      <span class="docs-card__body">
        <span class="docs-card__name">
          {props.item.name}
          <Show when={props.item.live}>
            <span class="docs-card__live" title="Has a live playground" />
          </Show>
        </span>
        <span class="docs-card__desc">{props.item.description}</span>
      </span>
    </A>
  );
}

function CardGrid(props: { category: ComponentsIndexCategory }) {
  return (
    <div class="docs-cards">
      <For each={props.category.items}>
        {(item) => <ComponentCard categorySlug={props.category.slug} item={item} />}
      </For>
    </div>
  );
}

export function ComponentsOverview() {
  return (
    <article class="docs-md">
      <h1 class="docs-article__title">Components</h1>
      <p class="docs-article__lede">
        HyperKit ships {componentsIndex.total} components. Every component is themed through{' '}
        <code>--sk-*</code> CSS custom properties and imported from a single package. Cards with a
        green dot have a live, editable playground.
      </p>
      <div innerHTML={componentsIndex.importHtml} />
      <For each={componentsIndex.categories}>
        {(category) => (
          <section>
            <h2 id={category.slug} class="docs-overview__section-title">
              <a class="docs-anchor" href={`#${category.slug}`} aria-label="Direct link">
                #
              </a>
              <A href={`/docs/components/${category.slug}`}>{category.label}</A>
            </h2>
            <p class="docs-overview__blurb">{category.blurb}</p>
            <CardGrid category={category} />
          </section>
        )}
      </For>
    </article>
  );
}

export function CategoryOverview(props: { category: ComponentsIndexCategory }) {
  return (
    <article class="docs-md">
      <nav class="docs-breadcrumb" aria-label="Breadcrumb">
        <A href="/docs/components">Components</A>
        <span aria-hidden="true">/</span>
        <span>{props.category.label}</span>
      </nav>
      <h1 class="docs-article__title">{props.category.label}</h1>
      <p class="docs-article__lede">
        {props.category.blurb} {props.category.items.length} components.
      </p>
      <CardGrid category={props.category} />
    </article>
  );
}
