/**
 * Native renderer for a generated component page: header, live playground (or
 * static fallback), extra examples, props table, accessibility, usage notes,
 * and design tokens. Code HTML is shiki output from our own generator.
 */
import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { LivePlayground } from '../LivePlayground';
import type { ComponentPage } from './types';

function SectionHeading(props: { id: string; title: string }) {
  return (
    <h2 id={props.id}>
      <a class="docs-anchor" href={`#${props.id}`} aria-label="Direct link">
        #
      </a>
      {props.title}
    </h2>
  );
}

export function ComponentArticle(props: { page: ComponentPage }) {
  const page = () => props.page;
  return (
    <article class="docs-md">
      <nav class="docs-breadcrumb" aria-label="Breadcrumb">
        <A href="/docs/components">Components</A>
        <span aria-hidden="true">/</span>
        <A href={`/docs/components/${page().category.slug}`}>{page().category.label}</A>
      </nav>
      <h1 class="docs-article__title">{page().title}</h1>
      <p class="docs-article__lede">{page().description}</p>
      <div innerHTML={page().importHtml} />

      <Show when={page().playground}>
        {(code) => (
          <section>
            <SectionHeading id="playground" title="Playground" />
            <p>Edit the code — the preview recompiles and re-renders as you type.</p>
            <LivePlayground code={code()} />
          </section>
        )}
      </Show>

      <Show when={!page().playground}>
        <Show when={page().staticNote}>
          <div class="docs-admonition docs-admonition--note">
            <p class="docs-admonition__title">Static examples</p>
            <p>
              This component depends on app-level context (providers, services, or interactive
              setup) that does not fit the inline playground yet, so its examples are shown as
              static code.
            </p>
          </div>
        </Show>
      </Show>

      <Show when={page().examples.length > 0}>
        <section>
          <SectionHeading id="examples" title={page().playground ? 'More Examples' : 'Examples'} />
          <For each={page().examples}>
            {(example) => (
              <>
                <h3>{example.title}</h3>
                <div innerHTML={example.html} />
              </>
            )}
          </For>
        </section>
      </Show>

      <Show when={page().props.length > 0}>
        <section>
          <SectionHeading id="props" title="Props" />
          <div class="docs-table-scroll">
            <table class="docs-props__table docs-props">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <For each={page().props}>
                  {(prop) => (
                    <tr>
                      <td class="docs-props__name">
                        <code>{prop.name}</code>
                        <Show when={prop.required}>
                          <span class="docs-props__required" title="Required prop">
                            {' '}
                            *
                          </span>
                        </Show>
                      </td>
                      <td>
                        <code>{prop.type}</code>
                      </td>
                      <td>
                        <Show when={prop.defaultValue !== null} fallback={<>—</>}>
                          <code>{prop.defaultValue}</code>
                        </Show>
                      </td>
                      <td>
                        <Show when={prop.descriptionHtml} fallback={<>—</>}>
                          {(html) => <span innerHTML={html()} />}
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <Show when={page().hasRequiredProps}>
            <p class="docs-props__note">
              <span class="docs-props__required">*</span> required prop.
            </p>
          </Show>
        </section>
      </Show>

      <Show when={page().a11yHtml}>
        {(html) => (
          <section>
            <SectionHeading id="accessibility" title="Accessibility" />
            <p innerHTML={html()} />
          </section>
        )}
      </Show>

      <Show when={page().usage}>
        {(usage) => (
          <section>
            <SectionHeading id="usage-notes" title="Usage Notes" />
            <ul class="docs-usage">
              <For each={usage().do}>
                {(html) => (
                  <li>
                    <span class="docs-usage__tag docs-usage__tag--do">Do:</span>
                    <span innerHTML={html} />
                  </li>
                )}
              </For>
              <For each={usage().dont}>
                {(html) => (
                  <li>
                    <span class="docs-usage__tag docs-usage__tag--dont">Don't:</span>
                    <span innerHTML={html} />
                  </li>
                )}
              </For>
            </ul>
          </section>
        )}
      </Show>

      <Show when={page().tokens.length > 0}>
        <section>
          <SectionHeading id="design-tokens" title="Design Tokens" />
          <p>
            This component reads the following CSS custom properties. Override them globally or
            per-instance to restyle it — see the{' '}
            <A href="/docs/guides/css-variables">CSS Variables guide</A>.
          </p>
          <ul class="docs-tokens">
            <For each={page().tokens}>
              {(token) => (
                <li>
                  <code>{token}</code>
                </li>
              )}
            </For>
          </ul>
        </section>
      </Show>
    </article>
  );
}
