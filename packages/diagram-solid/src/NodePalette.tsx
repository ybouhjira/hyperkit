import { createSignal, createMemo, For, Show, onMount, onCleanup, type Component } from 'solid-js';
import { Portal } from 'solid-js/web';
import { searchNodeTypes, getCompatibleNodeTypes, getAllNodeTypes, type NodeTypeDefinition } from '@ybouhjira/diagram-core';
import { useDiagramContext } from './DiagramProvider';

export interface NodePaletteProps {
  containerRef?: HTMLElement;
}

export const NodePalette: Component<NodePaletteProps> = (props) => {
  const { state, actions } = useDiagramContext();
  const [query, setQuery] = createSignal('');
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    inputRef?.focus();
  });

  const results = createMemo(() => {
    const q = query();
    if (state.nodePaletteFilterPort) {
      // Filter by compatible ports
      const port = (() => {
        const node = state.graph.nodes.get(state.nodePaletteFilterPort!.nodeId);
        return node?.ports.find(p => p.id === state.nodePaletteFilterPort!.portId);
      })();
      if (port) {
        const compatible = getCompatibleNodeTypes(port);
        if (q) {
          return compatible.filter(def =>
            def.label.toLowerCase().includes(q.toLowerCase()) ||
            def.type.toLowerCase().includes(q.toLowerCase())
          );
        }
        return compatible;
      }
    }
    return q ? searchNodeTypes(q) : getAllNodeTypes();
  });

  // Group results by category
  const groupedResults = createMemo(() => {
    const groups = new Map<string, NodeTypeDefinition[]>();
    for (const def of results()) {
      const list = groups.get(def.category) ?? [];
      list.push(def);
      groups.set(def.category, list);
    }
    return groups;
  });

  const handleSelect = (def: NodeTypeDefinition) => {
    const pos = state.nodePalettePosition ?? { x: 0, y: 0 };
    actions.createNodeFromPalette(def.type, pos);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      actions.closeNodePalette();
    }
  };

  // Close on outside click
  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.sk-node-palette')) {
      actions.closeNodePalette();
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleOutsideClick);
  });

  return (
    <Show when={state.nodePaletteOpen}>
      <Portal mount={props.containerRef ?? document.body}>
        <div
          class="sk-node-palette"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            'min-width': '320px',
            'max-width': '420px',
            'max-height': '400px',
            background: 'var(--sk-diagram-bg, #ffffff)',
            border: '1px solid var(--sk-diagram-node-stroke, #e2e8f0)',
            'border-radius': '12px',
            'box-shadow': '0 20px 60px rgba(0,0,0,0.15)',
            'z-index': '10000',
            display: 'flex',
            'flex-direction': 'column',
            overflow: 'hidden',
            'font-family': 'system-ui, -apple-system, sans-serif',
          }}
          onKeyDown={handleKeyDown}
        >
          <div style={{ padding: '12px 16px', 'border-bottom': '1px solid #e2e8f0' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search nodes..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                'border-radius': '8px',
                'font-size': '14px',
                outline: 'none',
                background: 'var(--sk-diagram-bg, #ffffff)',
                color: 'var(--sk-diagram-node-label-color, #1e293b)',
              }}
            />
          </div>
          <div style={{ 'overflow-y': 'auto', flex: '1', padding: '8px' }}>
            <Show when={results().length === 0}>
              <div style={{ padding: '16px', 'text-align': 'center', color: '#94a3b8', 'font-size': '13px' }}>
                No matching nodes found
              </div>
            </Show>
            <For each={[...groupedResults().entries()]}>
              {([category, defs]) => (
                <div style={{ 'margin-bottom': '8px' }}>
                  <div style={{
                    'font-size': '11px',
                    'font-weight': '600',
                    color: '#94a3b8',
                    'text-transform': 'uppercase',
                    padding: '4px 8px',
                    'letter-spacing': '0.05em',
                  }}>
                    {category}
                  </div>
                  <For each={defs}>
                    {(def) => (
                      <button
                        onClick={() => handleSelect(def)}
                        style={{
                          display: 'flex',
                          'align-items': 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 10px',
                          border: 'none',
                          background: 'transparent',
                          'border-radius': '6px',
                          cursor: 'pointer',
                          'text-align': 'left',
                          'font-size': '13px',
                          color: 'var(--sk-diagram-node-label-color, #1e293b)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sk-diagram-hover-fill, #f1f5f9)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Show when={def.icon}>
                          <span style={{ 'font-size': '18px' }}>{def.icon}</span>
                        </Show>
                        <div>
                          <div style={{ 'font-weight': '500' }}>{def.label}</div>
                          <Show when={def.description}>
                            <div style={{ 'font-size': '11px', color: '#94a3b8', 'margin-top': '2px' }}>
                              {def.description}
                            </div>
                          </Show>
                        </div>
                      </button>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
