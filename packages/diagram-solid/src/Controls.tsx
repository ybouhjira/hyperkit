import { type Component, type JSX, Show } from 'solid-js';
import { useDiagramContext } from './DiagramProvider';

export interface ControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onReset?: () => void;
  class?: string;
  style?: JSX.CSSProperties;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoom?: boolean;
  showHistory?: boolean;
  showEdit?: boolean;
}

export const Controls: Component<ControlsProps> = (props) => {
  const { state, actions } = useDiagramContext();

  const handleZoomIn = () => (props.onZoomIn ?? actions.zoomIn)();
  const handleZoomOut = () => (props.onZoomOut ?? actions.zoomOut)();
  const handleFitView = () => (props.onFitView ?? actions.fitView)();
  const handleReset = () => (props.onReset ?? actions.resetView)();

  const positionStyles: Record<string, JSX.CSSProperties> = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
  };

  const pos = positionStyles[props.position ?? 'bottom-right'] ?? positionStyles['bottom-right']!;

  return (
    <div
      class={`sk-diagram-controls ${props.class ?? ''}`}
      style={{
        position: 'absolute',
        display: 'flex',
        'flex-direction': 'column',
        gap: '2px',
        'z-index': '10',
        ...pos,
        ...props.style,
      }}
    >
      <Show when={props.showZoom !== false}>
        <div class="sk-diagram-control-group" style={groupStyle()}>
          <button class="sk-diagram-control-btn" onClick={handleZoomIn} title="Zoom In" style={btnStyle()}>+</button>
          <button class="sk-diagram-control-btn" onClick={handleZoomOut} title="Zoom Out" style={btnStyle()}>−</button>
          <button class="sk-diagram-control-btn" onClick={handleFitView} title="Fit View" style={btnStyle()}>⊡</button>
          <button class="sk-diagram-control-btn" onClick={handleReset} title="Reset View" style={btnStyle()}>↺</button>
        </div>
      </Show>

      <Show when={props.showHistory !== false && state.editable}>
        <div class="sk-diagram-control-group" style={groupStyle()}>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.undo()}
            title="Undo (Ctrl+Z)"
            disabled={!actions.canUndo()}
            style={btnStyle()}
          >↶</button>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.redo()}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!actions.canRedo()}
            style={btnStyle()}
          >↷</button>
        </div>
      </Show>

      <Show when={props.showEdit !== false && state.editable}>
        <div class="sk-diagram-control-group" style={groupStyle()}>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.deleteSelected()}
            title="Delete Selected (Del)"
            disabled={state.selectedNodes.size === 0 && state.selectedEdges.size === 0}
            style={btnStyle()}
          >🗑</button>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.copy()}
            title="Copy (Ctrl+C)"
            disabled={state.selectedNodes.size === 0}
            style={btnStyle()}
          >⎘</button>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.paste()}
            title="Paste (Ctrl+V)"
            disabled={!state.clipboard}
            style={btnStyle()}
          >📋</button>
        </div>
      </Show>

      <Show when={props.showEdit !== false}>
        <div class="sk-diagram-control-group" style={groupStyle()}>
          <button
            class="sk-diagram-control-btn"
            onClick={() => actions.setEditable(!state.editable)}
            title={state.editable ? "Lock (View Only)" : "Unlock (Edit)"}
            style={{
              ...btnStyle(),
              background: state.editable ? 'var(--sk-diagram-select-stroke, #3b82f6)' : 'var(--sk-bg-elevated, #ffffff)',
              color: state.editable ? '#ffffff' : 'var(--sk-text-primary, #111827)',
            }}
          >{state.editable ? '✏️' : '🔒'}</button>
        </div>
      </Show>
    </div>
  );
};

const groupStyle = (): JSX.CSSProperties => ({
  display: 'flex',
  'flex-direction': 'column',
  gap: '1px',
  background: 'var(--sk-border, #d1d5db)',
  'border-radius': 'var(--sk-radius-sm, 4px)',
  overflow: 'hidden',
});

const btnStyle = (): JSX.CSSProperties => ({
  width: '32px',
  height: '32px',
  border: 'none',
  background: 'var(--sk-bg-elevated, #ffffff)',
  color: 'var(--sk-text-primary, #111827)',
  cursor: 'pointer',
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
  'font-size': '14px',
  'line-height': '1',
  padding: '0',
});
