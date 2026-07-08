import { For, Show } from 'solid-js'
import { usePlugins } from '../plugins/pluginStore'

export function PluginManager() {
  const { state, actions } = usePlugins()

  const handleClose = () => {
    actions.setShowPluginManager(false)
  }

  return (
    <Show when={state.showPluginManager}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: '0',
          'z-index': '900',
          background: 'rgba(0, 0, 0, 0.5)',
          'backdrop-filter': 'blur(4px)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        }}
      >
        {/* Dialog */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--sk-bg-secondary)',
            border: '1px solid var(--sk-border)',
            'border-radius': 'var(--sk-radius-lg)',
            width: '100%',
            'max-width': '520px',
            'max-height': '70vh',
            margin: 'var(--sk-space-md)',
            display: 'flex',
            'flex-direction': 'column',
            'box-shadow': '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              padding: 'var(--sk-space-md)',
              'border-bottom': '1px solid var(--sk-border)',
              'flex-shrink': '0',
            }}
          >
            <div>
              <h2
                style={{
                  margin: '0',
                  'font-size': 'var(--sk-font-size-base)',
                  'font-family': 'var(--sk-font-ui)',
                  'font-weight': '600',
                  color: 'var(--sk-text-primary)',
                }}
              >
                Plugin Manager
              </h2>
              <p
                style={{
                  margin: '2px 0 0',
                  'font-size': 'var(--sk-font-size-xs)',
                  'font-family': 'var(--sk-font-ui)',
                  color: 'var(--sk-text-muted)',
                }}
              >
                {state.plugins.length} plugins installed
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--sk-text-muted)',
                'font-size': '18px',
                padding: 'var(--sk-space-xs)',
                'border-radius': 'var(--sk-radius-sm)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
                e.currentTarget.style.color = 'var(--sk-text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--sk-text-muted)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Plugin list */}
          <div style={{ 'overflow-y': 'auto', flex: '1', padding: 'var(--sk-space-sm)' }}>
            <For each={state.plugins}>
              {(instance) => (
                <div
                  style={{
                    display: 'flex',
                    'align-items': 'flex-start',
                    gap: 'var(--sk-space-sm)',
                    padding: 'var(--sk-space-sm)',
                    'border-radius': 'var(--sk-radius-md)',
                    background: 'var(--sk-bg-primary)',
                    'margin-bottom': 'var(--sk-space-xs)',
                    border: '1px solid var(--sk-border-subtle)',
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{
                      'font-size': '20px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      'flex-shrink': '0',
                      background: 'var(--sk-bg-tertiary)',
                      'border-radius': 'var(--sk-radius-sm)',
                    }}
                  >
                    {instance.plugin.icon}
                  </span>

                  {/* Info */}
                  <div style={{ flex: '1', 'min-width': '0' }}>
                    <div
                      style={{
                        display: 'flex',
                        'align-items': 'center',
                        gap: 'var(--sk-space-xs)',
                        'margin-bottom': '2px',
                      }}
                    >
                      <span
                        style={{
                          'font-size': 'var(--sk-font-size-sm)',
                          'font-family': 'var(--sk-font-ui)',
                          'font-weight': '500',
                          color: 'var(--sk-text-primary)',
                        }}
                      >
                        {instance.plugin.name}
                      </span>
                      <span
                        style={{
                          'font-size': 'var(--sk-font-size-xs)',
                          color: 'var(--sk-text-muted)',
                          'font-family': 'var(--sk-font-ui)',
                          background: 'var(--sk-bg-tertiary)',
                          'border-radius': 'var(--sk-radius-sm)',
                          padding: '1px 4px',
                        }}
                      >
                        v{instance.plugin.version}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '0',
                        'font-size': 'var(--sk-font-size-xs)',
                        'font-family': 'var(--sk-font-ui)',
                        color: 'var(--sk-text-secondary)',
                        'line-height': '1.4',
                      }}
                    >
                      {instance.plugin.description}
                    </p>
                    <Show when={instance.plugin.shortcut}>
                      <span
                        style={{
                          display: 'inline-block',
                          'margin-top': '4px',
                          'font-size': 'var(--sk-font-size-xs)',
                          color: 'var(--sk-text-muted)',
                          'font-family': 'var(--sk-font-ui)',
                          background: 'var(--sk-bg-tertiary)',
                          'border-radius': 'var(--sk-radius-sm)',
                          padding: '1px var(--sk-space-xs)',
                          border: '1px solid var(--sk-border)',
                        }}
                      >
                        {instance.plugin.shortcut}
                      </span>
                    </Show>
                  </div>

                  {/* Toggle */}
                  <div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--sk-space-xs)' }}>
                    <button
                      onClick={() => actions.togglePlugin(instance.plugin.id)}
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '20px',
                        'border-radius': '999px',
                        border: 'none',
                        cursor: 'pointer',
                        background: instance.enabled ? 'var(--sk-accent)' : 'var(--sk-bg-tertiary)',
                        transition: 'background var(--sk-duration-normal)',
                        'flex-shrink': '0',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: instance.enabled ? 'calc(100% - 18px)' : '2px',
                          width: '16px',
                          height: '16px',
                          'border-radius': '50%',
                          background: 'white',
                          transition: 'left var(--sk-duration-normal)',
                          display: 'block',
                        }}
                      />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: 'var(--sk-space-sm) var(--sk-space-md)',
              'border-top': '1px solid var(--sk-border)',
              display: 'flex',
              'justify-content': 'flex-end',
              'flex-shrink': '0',
            }}
          >
            <button
              onClick={handleClose}
              style={{
                padding: 'var(--sk-space-xs) var(--sk-space-md)',
                'border-radius': 'var(--sk-radius-md)',
                border: '1px solid var(--sk-border)',
                background: 'transparent',
                cursor: 'pointer',
                'font-size': 'var(--sk-font-size-sm)',
                'font-family': 'var(--sk-font-ui)',
                color: 'var(--sk-text-secondary)',
                transition: 'background var(--sk-duration-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Show>
  )
}
