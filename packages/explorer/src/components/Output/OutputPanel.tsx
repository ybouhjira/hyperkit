import { For, Match, Switch } from 'solid-js'
import { useExplorer } from '../../stores/explorerStore'
import type { ExplorerState } from '../../api/types'
import { ConsoleTab } from './ConsoleTab'
import { ActionsTab } from './ActionsTab'
import { InspectorPanel } from '../../../../devtools/src/explorer/InspectorPanel'

const TABS: ReadonlyArray<{ id: ExplorerState['activeOutputTab']; label: string }> = [
  { id: 'console', label: 'Console' },
  { id: 'actions', label: 'Actions' },
  { id: 'inspector', label: 'Inspector' },
]

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
        <For each={TABS}>
          {(tab) => {
            const isActive = () => state.activeOutputTab === tab.id
            return (
              <button
                onClick={() => actions.setActiveOutputTab(tab.id)}
                style={{
                  padding: 'var(--sk-space-sm) var(--sk-space-md)',
                  'font-family': 'var(--sk-font-mono)',
                  'font-size': 'var(--sk-font-size-sm)',
                  background: isActive() ? 'var(--sk-bg-primary)' : 'transparent',
                  color: isActive() ? 'var(--sk-text-primary)' : 'var(--sk-text-muted)',
                  border: 'none',
                  'border-bottom': isActive()
                    ? '2px solid var(--sk-accent)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition:
                    'color var(--sk-duration-fast) var(--sk-ease-default), background var(--sk-duration-fast) var(--sk-ease-default)',
                }}
              >
                {tab.label}
              </button>
            )
          }}
        </For>
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
