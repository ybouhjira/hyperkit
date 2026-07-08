import { Show, createMemo } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { identifyComponent, getComponentLabel } from '../engine/ComponentIdentifier';
import './HighlightOverlay.css';

export function HighlightOverlay() {
  const { state } = useDevTools();

  const target = createMemo(() => state.hoveredElement ?? state.inspectedElement);

  const rect = createMemo(() => {
    const el = target();
    if (!el) return null;
    return el.getBoundingClientRect();
  });

  const label = createMemo(() => {
    const el = target();
    if (!el) return '';
    const info = identifyComponent(el);
    return info ? getComponentLabel(info) : el.tagName.toLowerCase();
  });

  return (
    <Show when={rect()}>
      {(r) => (
        <div
          class="sk-devtools-overlay"
          style={{
            top: `${r().top}px`,
            left: `${r().left}px`,
            width: `${r().width}px`,
            height: `${r().height}px`,
          }}
        >
          <div class="sk-devtools-overlay__tooltip">{label()}</div>
        </div>
      )}
    </Show>
  );
}
