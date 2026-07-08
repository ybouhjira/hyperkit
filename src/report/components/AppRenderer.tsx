import { type Component, createSignal, createResource, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { AppContent } from '../types';
import { Box } from '../../primitives/Box';
import { Spinner } from '../../primitives/Spinner';
import { Text } from '../../primitives/Text';

declare global {
  interface Window {
    __modules__?: Record<string, unknown>;
  }
}

// ─── Client-side component cache ────────────────────────────────────────────
// Keyed by code hash — avoids re-compiling + re-evaluating identical code.
// The server also caches, but this skips the network round-trip entirely.

const _clientCache = new Map<string, Component>();

function fastHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

async function compileAndEval(code: string): Promise<Component> {
  const key = fastHash(code);
  const cached = _clientCache.get(key);
  if (cached) return cached;

  const res = await fetch('/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const result: { compiled?: string; error?: string } = await res.json();

  if (result.error) throw new Error(result.error);
  if (!result.compiled) throw new Error('Compilation returned no output');

  const modules = window.__modules__ ?? {};

  const factory = (0, eval)(result.compiled);
  const component = factory(modules);

  if (typeof component !== 'function') {
    throw new Error(`Expected default export to be a component function, got ${typeof component}`);
  }

  // LRU eviction — keep 64 entries max
  if (_clientCache.size >= 64) {
    const oldest = _clientCache.keys().next().value;
    if (oldest !== undefined) _clientCache.delete(oldest);
  }
  _clientCache.set(key, component as Component);

  return component as Component;
}

// ─── Component ──────────────────────────────────────────────────────────────

export interface AppRendererProps {
  content: AppContent;
}

export const AppRenderer: Component<AppRendererProps> = (props) => {
  const [error, setError] = createSignal<string | null>(null);

  const [componentFn] = createResource(
    () => props.content.code,
    async (code) => {
      setError(null);
      try {
        return await compileAndEval(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    }
  );

  return (
    <div class="sk-app-renderer">
      <Show when={props.content.title}>
        <div class="sk-mockup__header">
          <div class="sk-mockup__title">{props.content.title}</div>
          <Show when={props.content.description}>
            <div class="sk-mockup__description">{props.content.description}</div>
          </Show>
        </div>
      </Show>
      <div
        class="sk-app-renderer__body"
        style={{
          width: props.content.width ?? '100%',
          'min-height': props.content.height ?? '200px',
          position: 'relative',
        }}
      >
        <Show when={componentFn.loading}>
          <Box
            display="flex"
            style={{
              'align-items': 'center',
              'justify-content': 'center',
              height: '100%',
              'min-height': '120px',
              gap: 'var(--sk-space-sm)',
            }}
          >
            <Spinner size="md" />
            <Text size="sm" color="muted">
              Compiling...
            </Text>
          </Box>
        </Show>
        <Show when={error()}>
          <Box
            style={{
              padding: 'var(--sk-space-md)',
              background: 'color-mix(in srgb, var(--sk-error) 10%, transparent)',
              border: '1px solid var(--sk-error)',
              'border-radius': 'var(--sk-radius-md)',
              'font-family': 'monospace',
              'font-size': 'var(--sk-font-size-sm)',
              color: 'var(--sk-error)',
              'white-space': 'pre-wrap',
              overflow: 'auto',
            }}
          >
            {error()}
          </Box>
        </Show>
        <Show when={!componentFn.loading && !error() && componentFn()}>
          {(comp) => <Dynamic component={comp()} />}
        </Show>
      </div>
    </div>
  );
};
