/**
 * Catch-all docs route. Resolves, in order:
 *   components            → catalog overview (native text cards)
 *   components/<category> → category overview (native text cards)
 *   <anything else>       → generated page JSON (guide or component)
 */
import { Match, Show, Suspense, Switch, createMemo } from 'solid-js';
import { createAsync, useParams } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { HttpStatusCode } from '@solidjs/start';
import { componentsIndex, loadPage } from '../../components/docs/content';
import { ComponentArticle } from '../../components/docs/ComponentArticle';
import { GuideArticle } from '../../components/docs/GuideArticle';
import { CategoryOverview, ComponentsOverview } from '../../components/docs/ComponentsOverview';
import { DocsPager } from '../../components/docs/DocsPager';
import { DocsToc } from '../../components/docs/DocsToc';
import type { ComponentPage, DocPage, GuidePage, TocItem } from '../../components/docs/types';

const asComponent = (doc: DocPage): ComponentPage | null => (doc.kind === 'component' ? doc : null);
const asGuide = (doc: DocPage): GuidePage | null => (doc.kind === 'guide' ? doc : null);
const metaDescription = (doc: DocPage): string | null => doc.description;

export default function DocsPage() {
  const params = useParams();
  const slug = () => params.slug ?? '';

  const category = createMemo(() =>
    componentsIndex.categories.find((c) => `components/${c.slug}` === slug())
  );
  const isCatalog = () => slug() === 'components';
  const isNative = () => isCatalog() || category() !== undefined;

  const page = createAsync(() => (isNative() ? Promise.resolve(null) : loadPage(slug())), {
    deferStream: true,
  });

  const catalogToc = (): TocItem[] =>
    componentsIndex.categories.map((c) => ({ id: c.slug, depth: 2, text: c.label }));

  return (
    <Switch>
      <Match when={isCatalog()}>
        <main class="docs-main">
          <Title>Components — HyperKit</Title>
          <Meta
            name="description"
            content={`The full HyperKit component catalog — ${componentsIndex.total} components organized by category.`}
          />
          <ComponentsOverview />
          <DocsPager slug={slug()} />
        </main>
        <DocsToc items={catalogToc()} />
      </Match>
      <Match when={category()}>
        {(cat) => (
          <main class="docs-main">
            <Title>{`${cat().label} — Components — HyperKit`}</Title>
            <Meta name="description" content={cat().blurb} />
            <CategoryOverview category={cat()} />
            <DocsPager slug={slug()} />
          </main>
        )}
      </Match>
      <Match when={true}>
        <Suspense>
          <Show
            when={page()}
            fallback={
              <main class="docs-main">
                <Show when={page() === null}>
                  <HttpStatusCode code={404} />
                  <article class="docs-md">
                    <h1 class="docs-article__title">Page not found</h1>
                    <p>
                      No docs page at <code>/docs/{slug()}</code>.
                    </p>
                  </article>
                </Show>
              </main>
            }
          >
            {(doc) => (
              <>
                <main class="docs-main">
                  <Title>{`${doc().title} — HyperKit`}</Title>
                  <Show when={metaDescription(doc())}>
                    {(description) => <Meta name="description" content={description()} />}
                  </Show>
                  <Show when={asComponent(doc())}>
                    {(componentPage) => <ComponentArticle page={componentPage()} />}
                  </Show>
                  <Show when={asGuide(doc())}>
                    {(guidePage) => <GuideArticle page={guidePage()} />}
                  </Show>
                  <DocsPager slug={slug()} />
                </main>
                <DocsToc items={doc().toc} />
              </>
            )}
          </Show>
        </Suspense>
      </Match>
    </Switch>
  );
}
