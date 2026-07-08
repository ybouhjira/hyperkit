import { For, Show } from 'solid-js'
import { useExplorer } from '../../stores/explorerStore'

export function ActionsTab() {
  const { state } = useExplorer()

  const actionLogs = () =>
    state.outputLogs.filter((log) => log.message.includes('action') || log.message.includes('Action'))

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  return (
    <div
      style={{
        padding: '12px',
        'font-family': 'var(--sk-font-mono)',
        'font-size': '12px',
        height: '100%',
        'overflow-y': 'auto',
        background: 'var(--sk-bg-primary)',
      }}
    >
      <Show
        when={actionLogs().length > 0}
        fallback={
          <div
            style={{
              'text-align': 'center',
              color: 'var(--sk-text-secondary)',
              padding: '20px',
            }}
          >
            No actions executed yet
          </div>
        }
      >
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <For each={actionLogs()}>
            {(log) => (
              <div
                style={{
                  padding: '8px',
                  background: 'var(--sk-bg-secondary)',
                  'border-radius': 'var(--sk-radius-sm)',
                  border: '1px solid var(--sk-border)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', 'margin-bottom': '4px' }}>
                  <span style={{ color: 'var(--sk-text-secondary)' }}>
                    {formatTime(log.timestamp)}
                  </span>
                  <span style={{ color: 'var(--sk-text-primary)' }}>{log.message}</span>
                </div>
                <Show when={log.data}>
                  <pre
                    style={{
                      margin: '0',
                      'margin-top': '8px',
                      padding: '8px',
                      background: 'var(--sk-bg-primary)',
                      'border-radius': 'var(--sk-radius-sm)',
                      color: 'var(--sk-text-secondary)',
                      'overflow-x': 'auto',
                    }}
                  >
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
