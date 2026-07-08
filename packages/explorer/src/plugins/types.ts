import type { Component } from 'solid-js'
import type { StoryEntry } from '../api/types'

/** What a plugin can provide */
export interface PluginSlots {
  /** Replaces sidebar content when this plugin is active */
  sidebar?: Component
  /** Floating overlay (e.g., command palette) */
  overlay?: Component
  /** Items rendered in toolbar area */
  toolbar?: Component
  /** Items rendered in status bar */
  statusBar?: Component
  /** Plugin-specific settings panel */
  settings?: Component
}

/** Plugin definition — what plugin authors create */
export interface ExplorerPlugin {
  id: string
  name: string
  description: string
  icon: string
  version: string
  slots: PluginSlots

  /** Called when plugin is activated. Return cleanup function. */
  activate?(ctx: PluginContext): void | (() => void)

  /** Default plugin config values */
  defaultConfig?: Record<string, unknown>

  /** Keyboard shortcut to toggle/open this plugin (e.g., "mod+k") */
  shortcut?: string
}

/** Context passed to plugins on activation */
export interface PluginContext {
  /** Read explorer state */
  getStories(): readonly StoryEntry[]
  getSelectedId(): string | null
  getSearchQuery(): string

  /** Perform explorer actions */
  selectStory(id: string): void
  setSearchQuery(query: string): void

  /** Plugin-scoped storage (persisted to localStorage) */
  getConfig<T = unknown>(key: string): T | undefined
  setConfig<T = unknown>(key: string, value: T): void

  /** Register a keyboard shortcut (returns unregister fn) */
  registerShortcut(key: string, description: string, handler: () => void): () => void
}

/** Plugin instance with runtime state */
export interface PluginInstance {
  plugin: ExplorerPlugin
  enabled: boolean
  cleanup?: () => void
}
