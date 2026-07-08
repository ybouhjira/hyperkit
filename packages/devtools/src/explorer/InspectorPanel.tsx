import { Show, Switch, Match, createSignal } from 'solid-js';
import { DevToolsProvider } from '../context/DevToolsProvider';
import { useDevTools } from '../context/DevToolsProvider';
import { useInspectMode } from '../hooks/useInspectMode';
import { HighlightOverlay } from '../ui/HighlightOverlay';
import { InspectTab } from '../ui/InspectTab';
import { StylesTab } from '../ui/StylesTab';
import { TokensTab } from '../ui/TokensTab';
import { TreeTab } from '../ui/TreeTab';

export interface InspectorPanelProps {
  themeName?: string;
}

/**
 * Embeddable inspector panel for Explorer's output area.
 * Unlike the floating DevTools, this renders inline without a panel wrapper.
 */
export function InspectorPanel(props: InspectorPanelProps) {
  return (
    <DevToolsProvider themeName={props.themeName}>
      <InspectorPanelInner />
    </DevToolsProvider>
  );
}

function InspectorPanelInner() {
  const { state, dispatch } = useDevTools();
  const [activeTab, setActiveTab] = createSignal<'inspect' | 'styles' | 'tokens' | 'tree'>('inspect');

  // Auto-enable inspect mode
  useInspectMode();

  const tabs = [
    { id: 'inspect' as const, label: 'Inspect' },
    { id: 'styles' as const, label: 'Styles' },
    { id: 'tokens' as const, label: 'Tokens' },
    { id: 'tree' as const, label: 'Tree' },
  ];

  return (
    <div style={{
      'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      'font-size': '12px',
      color: '#e2e8f0',
      height: '100%',
      display: 'flex',
      'flex-direction': 'column',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '4px',
        'border-bottom': '1px solid #334155',
        'flex-shrink': '0',
      }}>
        <button
          onClick={() => dispatch({ type: 'SET_INSPECT_MODE', payload: !state.inspectMode })}
          style={{
            background: state.inspectMode ? '#3b82f6' : '#1e293b',
            color: state.inspectMode ? '#fff' : '#94a3b8',
            border: '1px solid #475569',
            'border-radius': '4px',
            padding: '3px 8px',
            cursor: 'pointer',
            'font-size': '11px',
            'font-family': 'inherit',
          }}
        >
          &#128269; Inspect
        </button>
        {tabs.map((tab) => (
          <button
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab() === tab.id ? '#334155' : 'transparent',
              color: activeTab() === tab.id ? '#f8fafc' : '#94a3b8',
              border: 'none',
              'border-radius': '4px',
              padding: '3px 8px',
              cursor: 'pointer',
              'font-size': '11px',
              'font-family': 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: '1', overflow: 'auto', padding: '8px' }}>
        <Switch>
          <Match when={activeTab() === 'inspect'}>
            <InspectTab />
          </Match>
          <Match when={activeTab() === 'styles'}>
            <StylesTab />
          </Match>
          <Match when={activeTab() === 'tokens'}>
            <TokensTab />
          </Match>
          <Match when={activeTab() === 'tree'}>
            <TreeTab />
          </Match>
        </Switch>
      </div>

      {/* Overlay for highlighting */}
      <Show when={state.inspectMode || state.hoveredElement}>
        <HighlightOverlay />
      </Show>
    </div>
  );
}
