import { Match, Switch } from 'solid-js'
import { useExplorer } from '../../stores/explorerStore'
import { ConsoleTab } from './ConsoleTab'
import { ActionsTab } from './ActionsTab'
import { InspectorPanel } from '../../../../devtools/src/explorer/InspectorPanel'

export function OutputPanel() {
  const { state, actions } = useExplorer()

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        height: '100%',
        background: 'var(--sk-bg-secondary)',
        'border-top': '1px solid var(--sk-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0',
          'border-bottom': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)',
        }}
      >
        <button
          onClick={() => actions.setActiveOutputTab('console')}
          style={{
            padding: '8px 16px',
            'font-family': 'var(--sk-font-ui)',
            'font-size': '12px',
            background:
              state.activeOutputTab === 'console'
                ? 'var(--sk-bg-primary)'
                : 'transparent',
            color: 'var(--sk-text-primary)',
            border: 'none',
            'border-bottom':
              state.activeOutputTab === 'console'
                ? '2px solid var(--sk-accent)'
                : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Console
        </button>
        <button
          onClick={() => actions.setActiveOutputTab('actions')}
          style={{
            padding: '8px 16px',
            'font-family': 'var(--sk-font-ui)',
            'font-size': '12px',
            background:
              state.activeOutputTab === 'actions'
                ? 'var(--sk-bg-primary)'
                : 'transparent',
            color: 'var(--sk-text-primary)',
            border: 'none',
            'border-bottom':
              state.activeOutputTab === 'actions'
                ? '2px solid var(--sk-accent)'
                : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Actions
        </button>
        <button
          onClick={() => actions.setActiveOutputTab('inspector')}
          style={{
            padding: '8px 16px',
            'font-family': 'var(--sk-font-ui)',
            'font-size': '12px',
            background:
              state.activeOutputTab === 'inspector'
                ? 'var(--sk-bg-primary)'
                : 'transparent',
            color: 'var(--sk-text-primary)',
            border: 'none',
            'border-bottom':
              state.activeOutputTab === 'inspector'
                ? '2px solid var(--sk-accent)'
                : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Inspector
        </button>
      </div>

      <div style={{ flex: '1', 'overflow-y': 'auto' }}>
        <Switch>
          <Match when={state.activeOutputTab === 'console'}>
            <ConsoleTab />
          </Match>
          <Match when={state.activeOutputTab === 'actions'}>
            <ActionsTab />
          </Match>
          <Match when={state.activeOutputTab === 'inspector'}>
            <InspectorPanel />
          </Match>
        </Switch>
      </div>
    </div>
  )
}
