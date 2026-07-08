import { Show, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { usePlugins } from '../plugins/pluginStore'

export function OverlayLayer() {
  const { state, actions } = usePlugins()

  const activeOverlayPlugin = createMemo(() => {
    const id = state.overlayPluginId
    if (!id) return null
    return state.plugins.find((p) => p.plugin.id === id && p.enabled) ?? null
  })

  const handleBackdropClick = () => {
    actions.closeOverlay()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      actions.closeOverlay()
    }
  }

  return (
    <Show when={activeOverlayPlugin() !== null}>
      <div
        style={{
          position: 'fixed',
          inset: '0',
          'z-index': '1000',
          display: 'flex',
          'align-items': 'flex-start',
          'justify-content': 'center',
          'padding-top': '80px',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <div
          onClick={handleBackdropClick}
          style={{
            position: 'absolute',
            inset: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            'backdrop-filter': 'blur(4px)',
          }}
        />

        {/* Overlay content */}
        <div
          style={{
            position: 'relative',
            'z-index': '1',
            width: '100%',
            'max-width': '640px',
            margin: '0 var(--sk-space-md)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Show when={activeOverlayPlugin()?.plugin.slots.overlay}>
            {(OverlayComponent) => <Dynamic component={OverlayComponent()} />}
          </Show>
        </div>
      </div>
    </Show>
  )
}
