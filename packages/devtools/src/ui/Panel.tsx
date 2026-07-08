import { ParentProps, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useDevTools } from '../context/DevToolsProvider';
import {
  clampDockSize,
  DEFAULT_DOCK_SIZES,
  isSideDock,
  nextDockSize,
  type DockPosition,
} from '../dock/dockState';
import { DetachedHost } from './DetachedHost';
import './Panel.css';

export function Panel(props: ParentProps) {
  const { state, dispatch } = useDevTools();
  // One remembered size per dock edge: height for bottom, width for sides.
  const [sizes, setSizes] = createStore<Record<DockPosition, number>>({ ...DEFAULT_DOCK_SIZES });

  let dragPosition: DockPosition = 'bottom';
  let dragStart = { x: 0, y: 0 };
  let dragStartSize = 0;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    dragPosition = state.dockPosition;
    dragStart = { x: e.clientX, y: e.clientY };
    dragStartSize = sizes[dragPosition];
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    const raw = nextDockSize(dragPosition, dragStartSize, dragStart, {
      x: e.clientX,
      y: e.clientY,
    });
    setSizes(
      dragPosition,
      clampDockSize(dragPosition, raw, {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    );
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const sizeStyle = () =>
    isSideDock(state.dockPosition)
      ? { width: `${sizes[state.dockPosition]}px` }
      : { height: `${sizes[state.dockPosition]}px` };

  return (
    <Show when={state.panelVisible}>
      <Show
        when={!state.detached}
        fallback={
          <DetachedHost onClosed={() => dispatch({ type: 'SET_DETACHED', payload: false })}>
            {props.children}
          </DetachedHost>
        }
      >
        <div class={`sk-devtools sk-devtools--${state.dockPosition}`} style={sizeStyle()}>
          <div
            class={`sk-devtools__resize-handle sk-devtools__resize-handle--${state.dockPosition}`}
            onMouseDown={onMouseDown}
          />
          {props.children}
        </div>
      </Show>
    </Show>
  );
}
