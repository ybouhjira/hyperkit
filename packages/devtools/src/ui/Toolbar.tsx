import { For } from 'solid-js';
import { Tabs, Kbd } from '@ybouhjira/hyperkit';
import { useDevTools } from '../context/DevToolsProvider';
import type { DevToolsState } from '../context/types';
import { DOCK_POSITIONS, type DockPosition } from '../dock/dockState';

const DOCK_ICONS: Record<DockPosition, string> = {
  bottom: '⬓', // ⬓ square with bottom half black
  left: '◧', // ◧ square with left half black
  right: '◨', // ◨ square with right half black
};

const DOCK_TITLES: Record<DockPosition, string> = {
  bottom: 'Dock to bottom',
  left: 'Dock to left',
  right: 'Dock to right',
};

interface ToolbarProps {
  /** Optional override for the close action. When provided, called instead of dispatching TOGGLE_ENABLED. */
  onClose?: () => void;
}

export function Toolbar(props: ToolbarProps) {
  const { state, dispatch } = useDevTools();

  return (
    <div class="sk-devtools__header">
      <div class="sk-devtools__header-left">
        {/* Inspect mode toggle */}
        <button
          class={`sk-devtools__inspect-btn ${state.inspectMode ? 'sk-devtools__inspect-btn--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INSPECT_MODE', payload: !state.inspectMode })}
          title="Select element to inspect"
        >
          &#9678;
        </button>

        {/* Tabs */}
        <Tabs
          items={[
            { value: 'inspect', label: 'Elements', content: <></> },
            { value: 'styles', label: 'Styles', content: <></> },
            { value: 'theme-audit', label: 'Theme Audit', content: <></> },
            { value: 'tokens', label: 'Tokens', content: <></> },
            { value: 'tree', label: 'Tree', content: <></> },
            { value: 'overview', label: 'Overview', content: <></> },
            { value: 'framework', label: 'Framework', content: <></> },
            { value: 'logs', label: 'Logs', content: <></> },
            { value: 'bugs', label: 'Bugs', content: <></> },
            { value: 'ux-audit', label: 'UX Audit', content: <></> },
            { value: 'timeline', label: 'Timeline', content: <></> },
            { value: 'perf', label: 'Perf', content: <></> },
          ]}
          value={state.activeTab}
          onChange={(tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab as DevToolsState['activeTab'] })}
        />
      </div>

      <div class="sk-devtools__header-right">
        {/* Dock position switcher + detach */}
        <div class="sk-devtools__dock-controls">
          <For each={DOCK_POSITIONS}>
            {(position) => (
              <button
                class="sk-devtools__dock-btn"
                classList={{
                  'sk-devtools__dock-btn--active':
                    !state.detached && state.dockPosition === position,
                }}
                onClick={() => dispatch({ type: 'SET_DOCK_POSITION', payload: position })}
                title={DOCK_TITLES[position]}
              >
                {DOCK_ICONS[position]}
              </button>
            )}
          </For>
          <button
            class="sk-devtools__dock-btn sk-devtools__detach-btn"
            classList={{ 'sk-devtools__dock-btn--active': state.detached }}
            onClick={() => dispatch({ type: 'SET_DETACHED', payload: !state.detached })}
            title={state.detached ? 'Re-attach panel' : 'Detach into separate window'}
          >
            {state.detached ? '⇲' : '⧉'}
          </button>
        </div>

        <Kbd keys={['Ctrl', 'Shift', 'D']} />

        <button
          class="sk-devtools__close-btn"
          onClick={() => {
            if (props.onClose) {
              props.onClose();
            } else {
              dispatch({ type: 'TOGGLE_ENABLED' });
            }
          }}
          title="Close DevTools"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
