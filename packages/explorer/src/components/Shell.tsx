import { Show, createMemo, createSignal, onMount, onCleanup, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useExplorer } from '../stores/explorerStore'
import { getStory } from '../api/registry'
import { Sidebar } from './Sidebar/Sidebar'
import { Preview } from './Preview/Preview'
import { ControlsPanel } from './Controls/ControlsPanel'
import { OutputPanel } from './Output/OutputPanel'
import { EmptyState } from './shared/EmptyState'
import { ResizablePanel } from './shared/ResizablePanel'
import { ActivityBar } from './ActivityBar'
import { OverlayLayer } from './OverlayLayer'
import { PluginManager } from './PluginManager'
import { usePlugins } from '../plugins/pluginStore'
import { useTheme } from '@ybouhjira/hyperkit'
import type { ComponentStoryDef } from '../api/types'

const THEME_KEY = 'sk-explorer-theme'

export function Shell() {
  const { state, actions } = useExplorer()
  const plugins = usePlugins()
  const { setTheme, themes } = useTheme()

  const savedThemeId = localStorage.getItem(THEME_KEY) ?? 'zed-dark'
  const [currentThemeId, setCurrentThemeId] = createSignal(savedThemeId)

  // Apply saved theme on mount
  onMount(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      setTheme(saved)
    }
  })

  const handleThemeChange = (id: string) => {
    setTheme(id)
    setCurrentThemeId(id)
    localStorage.setItem(THEME_KEY, id)
  }

  const selectedStory = createMemo(() => {
    const id = state.selectedId
    return id ? getStory(id) : null
  })

  const handleSidebarResize = (x: number) => {
    const newWidth = Math.max(200, Math.min(400, x))
    actions.setSidebarWidth(newWidth)
  }

  const handleBottomResize = (y: number) => {
    const windowHeight = window.innerHeight
    const newHeight = Math.max(100, Math.min(400, windowHeight - y))
    actions.setBottomPanelHeight(newHeight)
  }

  // Listen for custom events from plugin activations (e.g., command-palette shortcut)
  const handleToggleOverlay = (e: Event) => {
    const detail = (e as CustomEvent<{ pluginId: string }>).detail
    plugins.actions.toggleOverlay(detail.pluginId)
  }

  onMount(() => {
    window.addEventListener('sk-explorer:toggle-overlay', handleToggleOverlay)
  })

  onCleanup(() => {
    window.removeEventListener('sk-explorer:toggle-overlay', handleToggleOverlay)
  })

  // Resolve which sidebar to render
  const activeSidebarComponent = createMemo(() => {
    const activeId = plugins.state.activeSidebarPluginId
    if (!activeId) return null

    const instance = plugins.state.plugins.find(
      (p) => p.plugin.id === activeId && p.enabled
    )
    return instance?.plugin.slots.sidebar ?? null
  })

  // Enabled plugins with toolbar slots
  const toolbarPlugins = createMemo(() =>
    plugins.state.plugins.filter((p) => p.enabled && p.plugin.slots.toolbar)
  )

  // Has any enabled sidebar plugins?
  const hasSidebarPlugins = createMemo(() =>
    plugins.state.plugins.some((p) => p.enabled && p.plugin.slots.sidebar)
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          height: '100%',
          width: '100%',
          background: 'var(--sk-bg-primary)',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            padding: '12px var(--sk-space-md)',
            background: 'var(--sk-bg-secondary)',
            'border-bottom': '1px solid var(--sk-border)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'space-between',
            'flex-shrink': '0',
          }}
        >
          <h1
            style={{
              margin: '0',
              'font-family': 'var(--sk-font-ui)',
              'font-size': 'var(--sk-font-size-xl)',
              'font-weight': '600',
              color: 'var(--sk-text-primary)',
            }}
          >
            SolidKit Explorer
          </h1>

          {/* Right side: toolbar plugin slots + theme picker */}
          <div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--sk-space-sm)' }}>
            <Show when={toolbarPlugins().length > 0}>
              <Dynamic component={toolbarPlugins()[0]!.plugin.slots.toolbar!} />
            </Show>
            <select
              value={currentThemeId()}
              onChange={(e) => handleThemeChange(e.currentTarget.value)}
              style={{
                background: 'var(--sk-bg-secondary)',
                color: 'var(--sk-text-primary)',
                border: '1px solid var(--sk-border)',
                'border-radius': 'var(--sk-radius-sm)',
                padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                'font-size': 'var(--sk-font-size-sm)',
                'font-family': 'var(--sk-font-ui)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <For each={themes}>
                {(t) => <option value={t.id}>{t.name}</option>}
              </For>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flex: '1', 'min-height': '0' }}>
          {/* Activity Bar (only when plugins with sidebar slots are enabled) */}
          <Show when={hasSidebarPlugins()}>
            <ActivityBar />
          </Show>

          {/* Sidebar Content */}
          <div style={{ width: `${state.sidebarWidth}px`, 'flex-shrink': '0' }}>
            <Show
              when={activeSidebarComponent()}
              fallback={<Sidebar />}
            >
              {(SidebarComponent) => <Dynamic component={SidebarComponent()} />}
            </Show>
          </div>

          <ResizablePanel direction="horizontal" onResize={handleSidebarResize} />

          {/* Center + Bottom */}
          <div style={{ display: 'flex', 'flex-direction': 'column', flex: '1', 'min-width': '0' }}>
            {/* Preview + Controls */}
            <div
              style={{
                flex: '1',
                display: 'flex',
                'flex-direction': 'column',
                'min-height': '0',
              }}
            >
              <Show when={selectedStory()} keyed fallback={<EmptyState />}>
                {(story) => (
                  <>
                    <div style={{ flex: '1', 'min-height': '0', overflow: 'hidden' }}>
                      <Preview story={story} />
                    </div>
                    <Show when={story.def.kind === 'component' && story.def}>
                      {(def) => (
                        <ControlsPanel controls={(def() as ComponentStoryDef).controls} />
                      )}
                    </Show>
                  </>
                )}
              </Show>
            </div>

            <ResizablePanel direction="vertical" onResize={handleBottomResize} />

            {/* Output Panel */}
            <div style={{ height: `${state.bottomPanelHeight}px`, 'flex-shrink': '0' }}>
              <OutputPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Layer (portaled above everything) */}
      <OverlayLayer />

      {/* Plugin Manager */}
      <PluginManager />
    </>
  )
}
