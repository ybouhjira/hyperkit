import { createContext, useContext, type JSX } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { ExplorerPlugin, PluginInstance, PluginContext } from './types'
import { useExplorer } from '../stores/explorerStore'

// ─── State ──────────────────────────────────────────────────────────────────

interface PluginStoreState {
  plugins: PluginInstance[]
  activeSidebarPluginId: string | null
  overlayPluginId: string | null
  showPluginManager: boolean
  configs: Record<string, Record<string, unknown>>
}

// ─── Actions ────────────────────────────────────────────────────────────────

interface PluginStoreActions {
  registerPlugin(plugin: ExplorerPlugin): void
  enablePlugin(id: string): void
  disablePlugin(id: string): void
  togglePlugin(id: string): void
  setActiveSidebar(id: string): void
  openOverlay(id: string): void
  closeOverlay(): void
  toggleOverlay(id: string): void
  setPluginConfig(pluginId: string, key: string, value: unknown): void
  getPluginConfig(pluginId: string, key: string): unknown
  setShowPluginManager(show: boolean): void
}

interface PluginStoreContext {
  state: PluginStoreState
  actions: PluginStoreActions
}

// ─── Context ────────────────────────────────────────────────────────────────

const PluginStoreContext = createContext<PluginStoreContext>()

// ─── localStorage helpers ────────────────────────────────────────────────────

const ENABLED_KEY = 'sk-explorer-enabled-plugins'
const ACTIVE_SIDEBAR_KEY = 'sk-explorer-active-sidebar'

function loadEnabledPlugins(): string[] {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveEnabledPlugins(ids: string[]): void {
  localStorage.setItem(ENABLED_KEY, JSON.stringify(ids))
}

function loadActiveSidebar(): string | null {
  return localStorage.getItem(ACTIVE_SIDEBAR_KEY)
}

function saveActiveSidebar(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(ACTIVE_SIDEBAR_KEY)
  } else {
    localStorage.setItem(ACTIVE_SIDEBAR_KEY, id)
  }
}

function loadPluginConfig(pluginId: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(`sk-explorer-plugin-config-${pluginId}`)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function savePluginConfig(pluginId: string, config: Record<string, unknown>): void {
  localStorage.setItem(`sk-explorer-plugin-config-${pluginId}`, JSON.stringify(config))
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PluginProvider(props: { children: JSX.Element }) {
  const explorer = useExplorer()

  const [state, setState] = createStore<PluginStoreState>({
    plugins: [],
    activeSidebarPluginId: loadActiveSidebar(),
    overlayPluginId: null,
    showPluginManager: false,
    configs: {},
  })

  // ─── Plugin Context Factory ──────────────────────────────────────────────

  function createPluginContext(pluginId: string): PluginContext {
    return {
      getStories: () => explorer.state.stories,
      getSelectedId: () => explorer.state.selectedId,
      getSearchQuery: () => explorer.state.searchQuery,
      selectStory: (id: string) => explorer.actions.selectStory(id),
      setSearchQuery: (query: string) => explorer.actions.setSearchQuery(query),

      getConfig<T = unknown>(key: string): T | undefined {
        const pluginConfig = state.configs[pluginId]
        if (!pluginConfig) return undefined
        return pluginConfig[key] as T | undefined
      },

      setConfig<T = unknown>(key: string, value: T): void {
        actions.setPluginConfig(pluginId, key, value)
      },

      registerShortcut(key: string, _description: string, handler: () => void): () => void {
        const listener = (e: KeyboardEvent) => {
          const isModK =
            key === 'mod+k' &&
            (e.metaKey || e.ctrlKey) &&
            e.key.toLowerCase() === 'k'

          if (isModK) {
            e.preventDefault()
            handler()
          }
        }
        window.addEventListener('keydown', listener)
        return () => window.removeEventListener('keydown', listener)
      },
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  const actions: PluginStoreActions = {
    registerPlugin(plugin: ExplorerPlugin): void {
      // Skip if already registered
      if (state.plugins.some((p) => p.plugin.id === plugin.id)) return

      // Load persisted config
      const savedConfig = loadPluginConfig(plugin.id)
      const config = { ...(plugin.defaultConfig ?? {}), ...savedConfig }

      setState('configs', plugin.id, config)

      // Always create as disabled — enablePlugin handles activate + state
      const instance: PluginInstance = {
        plugin,
        enabled: false,
        cleanup: undefined,
      }

      setState('plugins', (prev) => [...prev, instance])

      // If previously enabled in localStorage, activate on next tick
      const enabledIds = loadEnabledPlugins()
      if (enabledIds.includes(plugin.id)) {
        queueMicrotask(() => actions.enablePlugin(plugin.id))
      }
    },

    enablePlugin(id: string): void {
      const idx = state.plugins.findIndex((p) => p.plugin.id === id)
      if (idx === -1) return
      const instance = state.plugins[idx]
      if (!instance) return
      if (instance.enabled) return

      // Run activate
      let cleanup: (() => void) | undefined
      if (instance.plugin.activate) {
        const ctx = createPluginContext(id)
        const result = instance.plugin.activate(ctx)
        cleanup = typeof result === 'function' ? result : undefined
      }

      setState('plugins', idx, 'enabled', true)
      if (cleanup) setState('plugins', idx, 'cleanup', () => cleanup)

      // Persist enabled state
      const enabledIds = loadEnabledPlugins()
      if (!enabledIds.includes(id)) {
        saveEnabledPlugins([...enabledIds, id])
      }
    },

    disablePlugin(id: string): void {
      const idx = state.plugins.findIndex((p) => p.plugin.id === id)
      if (idx === -1) return
      const instance = state.plugins[idx]
      if (!instance) return
      if (!instance.enabled) return

      // Run cleanup
      instance.cleanup?.()

      setState('plugins', idx, 'enabled', false)
      setState('plugins', idx, 'cleanup', undefined)

      // Remove from active sidebar if it was active
      if (state.activeSidebarPluginId === id) {
        const nextSidebar = state.plugins.find(
          (p, i) => i !== idx && p.enabled && p.plugin.slots.sidebar
        )
        setState('activeSidebarPluginId', nextSidebar?.plugin.id ?? null)
        saveActiveSidebar(nextSidebar?.plugin.id ?? null)
      }

      // Close overlay if it was open
      if (state.overlayPluginId === id) {
        setState('overlayPluginId', null)
      }

      // Persist
      const enabledIds = loadEnabledPlugins().filter((eid) => eid !== id)
      saveEnabledPlugins(enabledIds)
    },

    togglePlugin(id: string): void {
      const instance = state.plugins.find((p) => p.plugin.id === id)
      if (!instance) return
      if (instance.enabled) {
        actions.disablePlugin(id)
      } else {
        actions.enablePlugin(id)
      }
    },

    setActiveSidebar(id: string): void {
      setState('activeSidebarPluginId', id)
      saveActiveSidebar(id)
    },

    openOverlay(id: string): void {
      setState('overlayPluginId', id)
    },

    closeOverlay(): void {
      setState('overlayPluginId', null)
    },

    toggleOverlay(id: string): void {
      if (state.overlayPluginId === id) {
        setState('overlayPluginId', null)
      } else {
        // Only open overlay for enabled plugins (activate must have run)
        const instance = state.plugins.find((p) => p.plugin.id === id && p.enabled)
        if (instance) {
          setState('overlayPluginId', id)
        }
      }
    },

    setPluginConfig(pluginId: string, key: string, value: unknown): void {
      setState('configs', pluginId, key, value)
      // Persist
      const current = state.configs[pluginId] ?? {}
      savePluginConfig(pluginId, { ...current, [key]: value })
    },

    getPluginConfig(pluginId: string, key: string): unknown {
      return state.configs[pluginId]?.[key]
    },

    setShowPluginManager(show: boolean): void {
      setState('showPluginManager', show)
    },
  }

  const ctx: PluginStoreContext = { state, actions }

  return (
    <PluginStoreContext.Provider value={ctx}>
      {props.children}
    </PluginStoreContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePlugins(): PluginStoreContext {
  const ctx = useContext(PluginStoreContext)
  if (!ctx) {
    throw new Error('usePlugins must be used within PluginProvider')
  }
  return ctx
}

// ─── Plugin Context Factory (exported for testing) ──────────────────────────

export { type PluginStoreContext, type PluginStoreActions, type PluginStoreState }
