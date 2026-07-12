/**
 * Architecture Studio demo — a diagram-heavy workspace built from HyperKit +
 * the diagram-solid engine. A categorized sidebar switches between 11 diagrams;
 * a toolbar re-lays-out the active graph (Hierarchical / Left→Right / Force).
 *
 * The chrome (sidebar + toolbar) renders on the server; the interactive canvas
 * is loaded through `clientOnly` because `@ybouhjira/diagram-*` is a
 * browser-only bundle. The canvas is keyed on id+layout so it remounts — and
 * re-lays-out — cleanly on every switch.
 */
import { createEffect, createMemo, createSignal, For } from 'solid-js';
import { clientOnly } from '@solidjs/start';
import { Badge, Button, Text } from '@ybouhjira/hyperkit';
import { CATEGORIES, DIAGRAMS, type DiagramMeta, type LayoutKind } from './data';
import './diagrams.css';

const DiagramCanvas = clientOnly(() => import('./DiagramCanvas'));

const LAYOUTS: { value: LayoutKind; label: string }[] = [
  { value: 'TB', label: 'Hierarchical' },
  { value: 'LR', label: 'Left → Right' },
  { value: 'force', label: 'Force' },
];

export function DiagramsApp() {
  const [activeId, setActiveId] = createSignal(DIAGRAMS[0]!.id);
  const active = createMemo<DiagramMeta>(
    () => DIAGRAMS.find((d) => d.id === activeId()) ?? DIAGRAMS[0]!
  );
  const [layout, setLayout] = createSignal<LayoutKind>(DIAGRAMS[0]!.defaultLayout);

  // When the diagram changes, reset the layout to the one it reads best in.
  createEffect(() => {
    setLayout(active().defaultLayout);
  });

  return (
    <div class="diagrams">
      <aside class="diagrams__sidebar">
        <div class="diagrams__sidebar-head">
          <Text size="sm" weight="semibold">
            Diagrams
          </Text>
          <Badge variant="soft" size="sm">
            {DIAGRAMS.length}
          </Badge>
        </div>
        <nav class="diagrams__nav" aria-label="Diagrams">
          <For each={CATEGORIES}>
            {(category) => (
              <div class="diagrams__group">
                <span class="diagrams__group-label">{category}</span>
                <For each={DIAGRAMS.filter((d) => d.category === category)}>
                  {(d) => (
                    <button
                      type="button"
                      class="diagrams__item"
                      classList={{ 'diagrams__item--active': d.id === activeId() }}
                      aria-current={d.id === activeId() ? 'true' : undefined}
                      onClick={() => setActiveId(d.id)}
                    >
                      {d.name}
                    </button>
                  )}
                </For>
              </div>
            )}
          </For>
        </nav>
      </aside>

      <section class="diagrams__main">
        <header class="diagrams__toolbar">
          <div class="diagrams__title">
            <Text size="lg" weight="semibold">
              {active().name}
            </Text>
            <span class="diagrams__desc">{active().description}</span>
          </div>
          <div class="diagrams__layouts" role="group" aria-label="Layout">
            <For each={LAYOUTS}>
              {(opt) => (
                <Button
                  size="sm"
                  variant={layout() === opt.value ? 'primary' : 'ghost'}
                  onClick={() => setLayout(opt.value)}
                >
                  {opt.label}
                </Button>
              )}
            </For>
          </div>
        </header>

        <div class="diagrams__stage">
          <DiagramCanvas id={activeId()} layout={layout()} />
        </div>
      </section>
    </div>
  );
}
