// DEV-ONLY. See packages/ai-renderer/SECURITY.md before exposing beyond 127.0.0.1.

import { For, ErrorBoundary, Show, createMemo } from 'solid-js';
import type { JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { UINode } from './node-schema.js';
import { getComponent } from './component-registry.js';
import { sanitizeProps } from './prop-sanitizer.js';
import './live-render.css';

export interface NodeRendererProps {
  node: UINode;
}

/**
 * Recursively render a UINode tree using registered HyperKit components.
 *
 * Per-node errors (unknown component, bad props, runtime crash) render an
 * error placeholder but do NOT abort sibling rendering — each node is wrapped
 * in its own ErrorBoundary.
 */
export function NodeRenderer(props: NodeRendererProps): JSX.Element {
  return (
    <ErrorBoundary
      fallback={(err) => (
        <div class="sk-live-error" role="alert">
          {err instanceof Error ? err.message : String(err)}
        </div>
      )}
    >
      <NodeRendererInner node={props.node} />
    </ErrorBoundary>
  );
}

function NodeRendererInner(props: NodeRendererProps): JSX.Element {
  const isString = createMemo(() => typeof props.node === 'string');
  return (
    <Show when={!isString()} fallback={<>{props.node as string}</>}>
      <ComponentNode node={props.node as Exclude<UINode, string>} />
    </Show>
  );
}

interface ComponentNodeProps {
  node: Exclude<UINode, string>;
}

function ComponentNode(props: ComponentNodeProps): JSX.Element {
  const component = createMemo(() => {
    const comp = getComponent(props.node.component);
    if (!comp) {
      throw new Error(`[LiveRenderer] Unknown component: "${props.node.component}"`);
    }
    return comp;
  });

  const cleanProps = createMemo(() => {
    const { sanitized } = sanitizeProps(props.node.props);
    // Drop reserved keys that would shadow Dynamic's `component` slot.
    const { component: _drop, ...rest } = sanitized as Record<string, unknown>;
    void _drop;
    return rest;
  });

  const childNodes = createMemo<readonly UINode[]>(() => {
    const ch = props.node.children;
    return Array.isArray(ch) && ch.length > 0 ? ch : [];
  });

  const childrenJsx = (): JSX.Element => (
    <Show when={childNodes().length > 0}>
      <Show
        when={childNodes().length === 1}
        fallback={
          <For each={childNodes()}>
            {(child) => (
              <ErrorBoundary
                fallback={(err) => (
                  <div class="sk-live-error" role="alert">
                    {err instanceof Error ? err.message : String(err)}
                  </div>
                )}
              >
                <NodeRendererInner node={child} />
              </ErrorBoundary>
            )}
          </For>
        }
      >
        <ErrorBoundary
          fallback={(err) => (
            <div class="sk-live-error" role="alert">
              {err instanceof Error ? err.message : String(err)}
            </div>
          )}
        >
          <NodeRendererInner node={childNodes()[0] as UINode} />
        </ErrorBoundary>
      </Show>
    </Show>
  );

  // Dynamic's strict generic prop-check can't reason about runtime-validated
  // component targets, so we cast at the boundary.
  const dynProps = (): Parameters<typeof Dynamic>[0] =>
    ({
      ...cleanProps(),
      component: component(),
      children: childrenJsx(),
    }) as Parameters<typeof Dynamic>[0];

  return <Dynamic {...dynProps()} />;
}
