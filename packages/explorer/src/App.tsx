import { onMount } from 'solid-js'
import { createNavigable } from '@ybouhjira/hyperkit'
import { ExplorerProvider, useExplorer } from './stores/explorerStore'
import { PluginProvider, usePlugins } from './plugins/pluginStore'
import { Shell } from './components/Shell'
import { registerStory, type StoryDef, type StoryEntry, isCSFModule, convertCSFModule } from './api'
import { defaultSidebarPlugin } from './plugins/default-sidebar'
import { commandPalettePlugin } from './plugins/command-palette'
import { smartSidebarPlugin } from './plugins/smart-sidebar'
import { commandCenterPlugin } from './plugins/command-center'

function AppContent() {
  const { state, actions } = useExplorer()
  const { actions: pluginActions } = usePlugins()

  createNavigable({
    id: 'explorer',
    label: 'HyperKit Explorer',
    category: 'app',
    actions: [
      {
        name: 'selectStory',
        description: 'Select a story by its ID (from inspect().state.stories[].id)',
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        handler: (params: unknown) => {
          const p = params as { id: string }
          actions.selectStory(p.id)
          return { ok: true, selectedId: p.id }
        },
      },
      {
        name: 'selectStoryByTitle',
        description: 'Select the first story whose title matches (case-insensitive substring)',
        params: {
          type: 'object',
          properties: { title: { type: 'string' } },
          required: ['title'],
        },
        handler: (params: unknown) => {
          const p = params as { title: string }
          const needle = p.title.toLowerCase()
          const match = state.stories.find((s) => s.title.toLowerCase().includes(needle))
          if (!match) return { ok: false, error: `no story matches "${p.title}"` }
          actions.selectStory(match.id)
          return { ok: true, selectedId: match.id, title: match.title }
        },
      },
    ],
    getState: () => ({
      selectedId: state.selectedId,
      stories: state.stories.map((s) => ({ id: s.id, title: s.title, category: s.category })),
    }),
  })

  onMount(() => {
    // Discover stories
    const storyModules = import.meta.glob<Record<string, StoryDef>>([
      '../../src/**/*.story.tsx',
      '../../src/**/*.stories.tsx',
      '../../editor/src/**/*.stories.tsx',
      '../stories/**/*.story.tsx',
      '../hyperkit-src/**/*.story.tsx',
      '../hyperkit-src/**/*.stories.tsx',
      '../../diagram-solid/src/**/*.stories.tsx',
      '../../timeline/src/**/*.stories.tsx',
      '../../devtools/src/**/*.stories.tsx',
    ], { eager: true }) as Record<string, Record<string, StoryDef>>
    const discoveredStories: StoryEntry[] = []
    for (const [path, mod] of Object.entries(storyModules)) {
      // Check if this is a CSF (Storybook) module
      if (isCSFModule(mod)) {
        const csfEntries = convertCSFModule(mod, path)
        for (const entry of csfEntries) {
          registerStory(entry)
          discoveredStories.push(entry)
        }
        continue
      }

      // Otherwise, process as Explorer format
      for (const [exportName, storyDef] of Object.entries(mod)) {
        if (
          typeof storyDef === 'object' &&
          storyDef !== null &&
          'kind' in storyDef &&
          'title' in storyDef &&
          'category' in storyDef
        ) {
          const id = `${path}--${exportName}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')

          const entry: StoryEntry = {
            id,
            title: storyDef.title,
            category: storyDef.category,
            def: storyDef,
          }

          registerStory(entry)
          discoveredStories.push(entry)
        }
      }
    }

    actions.setStories(discoveredStories)

    if (discoveredStories.length > 0 && discoveredStories[0]) {
      // Deep-link: ?story=<id|title> or #story=<id|title> (or bare #<title>)
      // selects a story on load — e.g. /#story=AI%20Studio. Matches by exact id
      // or case-insensitive title substring; falls back to the first story.
      const want = (() => {
        try {
          const q = new URLSearchParams(window.location.search).get('story')
          if (q) return q
          const h = window.location.hash.replace(/^#/, '')
          const m = /(?:^|[&?])story=([^&]+)/.exec(h)
          return m?.[1] ? decodeURIComponent(m[1]) : h ? decodeURIComponent(h) : null
        } catch {
          return null
        }
      })()
      const lower = want?.toLowerCase()
      const match = lower
        ? discoveredStories.find(
            (s) => s.id === want || s.title.toLowerCase().includes(lower),
          )
        : undefined
      actions.selectStory((match ?? discoveredStories[0]).id)
    }

    // Register built-in plugins
    pluginActions.registerPlugin(defaultSidebarPlugin)
    pluginActions.registerPlugin(commandPalettePlugin)
    pluginActions.registerPlugin(smartSidebarPlugin)
    pluginActions.registerPlugin(commandCenterPlugin)

    // Enable smart-sidebar by default if no saved preference
    const savedEnabled = (() => {
      try {
        const raw = localStorage.getItem('sk-explorer-enabled-plugins')
        return raw ? (JSON.parse(raw) as string[]) : null
      } catch {
        return null
      }
    })()

    if (!savedEnabled || savedEnabled.length === 0) {
      // First run: enable smart-sidebar by default
      pluginActions.enablePlugin('smart-sidebar')
      // Set smart-sidebar as active sidebar
      pluginActions.setActiveSidebar('smart-sidebar')
    }
  })

  return <Shell />
}

export function App() {
  return (
    <ExplorerProvider>
      <PluginProvider>
        <AppContent />
      </PluginProvider>
    </ExplorerProvider>
  )
}
