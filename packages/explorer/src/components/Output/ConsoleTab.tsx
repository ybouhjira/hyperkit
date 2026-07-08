import { For, Show } from 'solid-js'
import { useExplorer } from '../../stores/explorerStore'

export function ConsoleTab() {
  const { state, actions } = useExplorer()

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#ef4444'
      case 'warn':
        return '#f59e0b'
      case 'info':
      default:
        return 'var(--sk-text-primary)'
    }
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
      <div
        style={{
          'margin-bottom': '12px',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
        }}
      >
        <span
          style={{
            color: 'var(--sk-text-secondary)',
            'font-family': 'var(--sk-font-ui)',
            'font-size': '11px',
          }}
        >
          {state.outputLogs.length} log entries
        </span>
        <button
          onClick={() => actions.clearLogs()}
          style={{
            padding: '4px 8px',
            'font-family': 'var(--sk-font-ui)',
            'font-size': '11px',
            background: 'transparent',
            color: 'var(--sk-text-secondary)',
            border: '1px solid var(--sk-border)',
            'border-radius': 'var(--sk-radius-sm)',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <Show
        when={state.outputLogs.length > 0}
        fallback={
          <div
            style={{
              'text-align': 'center',
              color: 'var(--sk-text-secondary)',
              padding: '20px',
            }}
          >
            No logs yet
          </div>
        }
      >
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
          <For each={state.outputLogs}>
            {(log) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--sk-text-secondary)', 'flex-shrink': '0' }}>
                  {formatTime(log.timestamp)}
                </span>
                <span
                  style={{
                    color: getLevelColor(log.level),
                    'text-transform': 'uppercase',
                    'flex-shrink': '0',
                    width: '50px',
                  }}
                >
                  {log.level}
                </span>
                <span style={{ color: 'var(--sk-text-primary)' }}>{log.message}</span>
                <Show when={log.data}>
                  <pre
                    style={{
                      margin: '0',
                      color: 'var(--sk-text-secondary)',
                      'word-break': 'break-all',
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
