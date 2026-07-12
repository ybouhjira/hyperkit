/**
 * The interactive diagram surface — CLIENT-ONLY (loaded via `clientOnly`).
 *
 * All `@ybouhjira/diagram-*` imports are isolated here so they never touch the
 * SSR/prerender path. The DiagramProvider reads its graph once per mount, so a
 * keyed <Show> on id+layout remounts the provider — rebuilding the graph and
 * re-running layout — whenever the reactive props change. (clientOnly forwards
 * props reactively, but does NOT re-instantiate on an outer keyed Show, so the
 * remount must be driven from here, off the props.)
 */
import { createMemo, createSignal, Show } from 'solid-js';
import { DiagramProvider, Diagram, Controls, MiniMap } from '@ybouhjira/diagram-solid';
import { buildGraph, graphStats, layoutFor } from './graphs';
import type { LayoutKind } from './data';

export default function DiagramCanvas(props: { id: string; layout: LayoutKind }) {
  const key = createMemo(() => `${props.id}|${props.layout}`);

  return (
    <Show when={key()} keyed>
      {() => {
        // Re-evaluated on every key change (keyed remount): fresh graph +
        // algorithm for the current id/layout.
        const graph = buildGraph(props.id);
        const stats = graphStats(graph);
        const algorithm = layoutFor(props.layout);

        const [selected, setSelected] = createSignal<string | null>(null);
        const selectedLabel = createMemo(() => {
          const id = selected();
          if (!id) return null;
          return graph.nodes.get(id as never)?.label ?? id;
        });

        return (
          <DiagramProvider initialGraph={graph} layoutAlgorithm={algorithm}>
            <div class="diagrams__canvas">
              <Diagram
                class="diagrams__surface"
                showGrid
                autoLayout
                onNodeClick={(nodeId) => setSelected(nodeId)}
                onBackgroundClick={() => setSelected(null)}
              />
              <Controls position="bottom-right" />
              <MiniMap position="bottom-left" />
              <div class="diagrams__badge">
                {stats.nodes} nodes · {stats.edges} edges
              </div>
              <Show when={selectedLabel()}>
                <div class="diagrams__inspector">
                  <span class="diagrams__inspector-key">Selected</span>
                  <span class="diagrams__inspector-val">{selectedLabel()}</span>
                </div>
              </Show>
            </div>
          </DiagramProvider>
        );
      }}
    </Show>
  );
}
