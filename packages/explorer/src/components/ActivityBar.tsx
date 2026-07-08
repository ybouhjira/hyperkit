import { For, createMemo } from 'solid-js'
import { usePlugins } from '../plugins/pluginStore'

export function ActivityBar() {
  const { state, actions } = usePlugins()

  const sidebarPlugins = createMemo(() =>
    state.plugins.filter((p) => p.enabled && p.plugin.slots.sidebar)
  )

  return (
    <div
      style={{
        width: '40px',
        'flex-shrink': '0',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        'border-right': '1px solid var(--sk-border)',
        'align-items': 'center',
        'padding-top': 'var(--sk-space-xs)',
        'padding-bottom': 'var(--sk-space-xs)',
        gap: '2px',
      }}
    >
      <For each={sidebarPlugins()}>
        {(instance) => {
          const isActive = () => state.activeSidebarPluginId === instance.plugin.id
          return (
            <button
              onClick={() => actions.setActiveSidebar(instance.plugin.id)}
              title={instance.plugin.name}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                background: isActive()
                  ? 'color-mix(in srgb, var(--sk-accent) 15%, transparent)'
                  : 'transparent',
                border: 'none',
                'border-radius': 'var(--sk-radius-sm)',
                cursor: 'pointer',
                'font-size': '16px',
                position: 'relative',
                transition: 'background var(--sk-duration-fast)',
                'border-left': `2px solid ${isActive() ? 'var(--sk-accent)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                if (!isActive()) {
                  e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive()) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {instance.plugin.icon}
            </button>
          )
        }}
      </For>

      {/* Spacer */}
      <div style={{ flex: '1' }} />

      {/* Plugin Manager gear */}
      <button
        onClick={() => actions.setShowPluginManager(true)}
        title="Plugin Manager"
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          background: 'transparent',
          border: 'none',
          'border-radius': 'var(--sk-radius-sm)',
          cursor: 'pointer',
          'font-size': '14px',
          color: 'var(--sk-text-muted)',
          transition: 'background var(--sk-duration-fast)',
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
        ⚙
      </button>
    </div>
  )
}
