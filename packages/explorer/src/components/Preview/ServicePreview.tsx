import { For, Show } from 'solid-js'
import type { ServiceStoryDef } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'

interface ServicePreviewProps {
  readonly story: ServiceStoryDef
}

export function ServicePreview(props: ServicePreviewProps) {
  const { actions } = useExplorer()

  const handleAction = async (name: string, action: () => Promise<unknown> | unknown) => {
    const start = performance.now()
    try {
      actions.addLog({
        timestamp: Date.now(),
        level: 'info',
        message: `Running action: ${name}`,
      })
      const result = await action()
      const duration = performance.now() - start
      actions.addLog({
        timestamp: Date.now(),
        level: 'info',
        message: `Action "${name}" completed in ${duration.toFixed(2)}ms`,
        data: result,
      })
    } catch (error) {
      const duration = performance.now() - start
      actions.addLog({
        timestamp: Date.now(),
        level: 'error',
        message: `Action "${name}" failed after ${duration.toFixed(2)}ms`,
        data: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const actionEntries = () => Object.entries(props.story.actions)

  return (
    <div
      style={{
        padding: '32px',
        background: 'var(--sk-bg-primary)',
        height: '100%',
        'overflow-y': 'auto',
      }}
    >
      <Show when={props.story.description}>
        <p
          style={{
            'font-family': 'var(--sk-font-ui)',
            'font-size': '14px',
            color: 'var(--sk-text-secondary)',
            'margin-bottom': '24px',
            'line-height': '1.5',
          }}
        >
          {props.story.description}
        </p>
      </Show>

      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
        <For each={actionEntries()}>
          {([name, action]) => (
            <button
              onClick={() => handleAction(name, action)}
              style={{
                padding: '10px 16px',
                'font-family': 'var(--sk-font-ui)',
                'font-size': '14px',
                background: 'var(--sk-accent)',
                color: '#fff',
                border: 'none',
                'border-radius': 'var(--sk-radius-md)',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                'text-align': 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {name}
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
