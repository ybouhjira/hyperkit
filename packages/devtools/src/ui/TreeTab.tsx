import { Show, For, createMemo } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { useComponentTree, flattenTree } from '../hooks/useComponentTree';
import { getComponentLabel } from '../engine/ComponentIdentifier';
import type { TreeNode } from '../hooks/useComponentTree';

export function TreeTab() {
  const { state, dispatch } = useDevTools();
  const tree = useComponentTree(() => document.body);

  const flatNodes = createMemo(() => flattenTree(tree()));

  return (
    <div>
      <Show when={flatNodes().length > 0} fallback={
        <div class="sk-devtools__empty">
          <div class="sk-devtools__empty-icon">&#128065;</div>
          <div class="sk-devtools__empty-text">No SolidKit components on this page</div>
        </div>
      }>
        <For each={flatNodes()}>
          {(node) => (
            <div
              class={`sk-devtools__tree-row ${state.inspectedElement === node.component.element ? 'sk-devtools__tree-row--selected' : ''}`}
              style={{ 'padding-left': `${12 + node.depth * 20}px` }}
              onClick={() => dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: node.component.element })}
              onMouseEnter={() => dispatch({ type: 'SET_HOVERED_ELEMENT', payload: node.component.element })}
              onMouseLeave={() => dispatch({ type: 'SET_HOVERED_ELEMENT', payload: null })}
            >
              <span class="sk-devtools__tree-tag">&lt;</span>
              <span class="sk-devtools__tree-name">{getComponentLabel(node.component)}</span>
              <span class="sk-devtools__tree-tag"> /&gt;</span>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
