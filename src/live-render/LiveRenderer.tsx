// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { Runtime } from 'effect';
import { validateUINode } from './node-schema.js';
import type { UINode } from './node-schema.js';
import { NodeRenderer } from './NodeRenderer.js';
import './live-render.css';

export interface LiveRendererProps {
  /**
   * URL of the SSE endpoint that emits UINode JSON payloads.
   * Defaults to '/api/mockup/stream'.
   */
  source?: string;
}

/**
 * Subscribe to an SSE stream and render whatever UINode tree arrives last.
 *
 * Security: this component trusts the SSE endpoint to be loopback-bound.
 * Never point it at a public URL.
 */
export function LiveRenderer(props: LiveRendererProps): JSX.Element {
  const source = () => props.source ?? '/api/mockup/stream';
  const [tree, setTree] = createSignal<UINode | null>(null);
  const [parseError, setParseError] = createSignal<string | null>(null);

  // Open SSE connection; reopen if source changes.
  createEffect(() => {
    const url = source();
    const es = new EventSource(url);

    es.onmessage = (evt) => {
      let raw: unknown;
      try {
        raw = JSON.parse(evt.data as string);
      } catch {
        setParseError('Invalid JSON in SSE event');
        return;
      }

      // Use a synchronous Effect runtime to validate without async overhead.
      const result = Runtime.runSyncExit(Runtime.defaultRuntime)(validateUINode(raw));

      if (result._tag === 'Success') {
        setParseError(null);
        setTree(() => result.value);
      } else {
        // Cause is a LiveRenderError
        setParseError(`Validation failed: ${String(result.cause)}`);
      }
    };

    es.onerror = () => {
      // SSE auto-reconnects; don't surface transient errors as UI noise.
    };

    onCleanup(() => es.close());
  });

  return (
    <div class="sk-live-render-root" aria-live="polite">
      <Show
        when={parseError() === null}
        fallback={
          <div class="sk-live-error" role="alert">
            {parseError()}
          </div>
        }
      >
        <Show
          when={tree() !== null}
          fallback={
            <div class="sk-live-render-empty" aria-label="Waiting for render">
              Waiting for render…
            </div>
          }
        >
          <NodeRenderer node={tree() as UINode} />
        </Show>
      </Show>
    </div>
  );
}
