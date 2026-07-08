import { createSignal, createMemo, For, Show, onMount, type JSX } from 'solid-js'
import type { ExplorerPlugin, PluginContext } from '../types'
import type { StoryEntry } from '../../api/types'
import { fuzzyMatch } from '../shared/fuzzyMatch'
import { KindBadge } from '../shared/KindBadge'
import { KindIcon } from '../shared/KindIcon'
import { usePlugins } from '../pluginStore'

// ─── Overlay Component ──────────────────────────────────────────────────────

let _ctx: PluginContext | null = null

function CommandPaletteOverlay() {
  const { actions } = usePlugins()
  const [query, setQuery] = createSignal('')
  const [selectedIdx, setSelectedIdx] = createSignal(0)
  let inputRef!: HTMLInputElement

  const stories = () => _ctx?.getStories() ?? []

  const recentIds = (): string[] => _ctx?.getConfig<string[]>('recentStories') ?? []

  const results = createMemo<StoryEntry[]>(() => {
    const q = query().trim()
    const allStories = stories()

    if (!q) {
      // Show recent first, then all
      const recentSet = new Set(recentIds())
      const recentStories = recentIds()
        .map((id) => allStories.find((s) => s.id === id))
        .filter((s): s is StoryEntry => s !== undefined)
      const others = allStories.filter((s) => !recentSet.has(s.id))
      return [...recentStories, ...others].slice(0, 10)
    }

    return allStories
      .map((s) => {
        const titleMatch = fuzzyMatch(q, s.title)
        const catMatch = fuzzyMatch(q, s.category)
        const score = Math.max(titleMatch.score, catMatch.score)
        return { story: s, matched: titleMatch.matched || catMatch.matched, score }
      })
      .filter((r) => r.matched)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.story)
      .slice(0, 10)
  })

  onMount(() => {
    inputRef?.focus()
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results().length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const story = results()[selectedIdx()]
      if (story) {
        selectStory(story.id)
      }
    } else if (e.key === 'Escape') {
      actions.closeOverlay()
    }
  }

  const selectStory = (id: string) => {
    if (_ctx) {
      _ctx.selectStory(id)
      // Track recent
      const recent = _ctx.getConfig<string[]>('recentStories') ?? []
      const updated = [id, ...recent.filter((r) => r !== id)].slice(0, 10)
      _ctx.setConfig('recentStories', updated)
    }
    actions.closeOverlay()
  }

  const highlightText = (text: string, q: string) => {
    if (!q.trim()) return <span>{text}</span>
    const match = fuzzyMatch(q.trim(), text)
    if (!match.matched || match.ranges.length === 0) return <span>{text}</span>

    const parts: JSX.Element[] = []
    let last = 0
    for (const [start, end] of match.ranges) {
      if (start > last) {
        parts.push(<span>{text.slice(last, start)}</span>)
      }
      parts.push(
        <span style={{ color: 'var(--sk-accent)', 'font-weight': '600' }}>
          {text.slice(start, end)}
        </span>
      )
      last = end
    }
    if (last < text.length) {
      parts.push(<span>{text.slice(last)}</span>)
    }
    return <>{parts}</>
  }

  const recentSet = () => new Set(recentIds())
  const hasRecent = () => !query().trim() && recentIds().length > 0

  return (
    <div
      style={{
        background: 'var(--sk-bg-secondary)',
        border: '1px solid var(--sk-border)',
        'border-radius': 'var(--sk-radius-lg)',
        width: '100%',
        'max-width': '640px',
        overflow: 'hidden',
        'box-shadow': '0 24px 64px rgba(0,0,0,0.4)',
        display: 'flex',
        'flex-direction': 'column',
        'max-height': '70vh',
      }}
    >
      {/* Search input */}
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          padding: '0 var(--sk-space-md)',
          'border-bottom': '1px solid var(--sk-border)',
          gap: 'var(--sk-space-sm)',
        }}
      >
        <span style={{ 'font-size': 'var(--sk-font-size-base)', color: 'var(--sk-text-muted)' }}>
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stories, components, hooks..."
          value={query()}
          onInput={(e) => {
            setQuery(e.currentTarget.value)
            setSelectedIdx(0)
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: '1',
            padding: 'var(--sk-space-md) 0',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            'font-size': 'var(--sk-font-size-base)',
            'font-family': 'var(--sk-font-ui)',
            color: 'var(--sk-text-primary)',
          }}
        />
        <kbd
          style={{
            padding: '2px var(--sk-space-xs)',
            background: 'var(--sk-bg-tertiary)',
            border: '1px solid var(--sk-border)',
            'border-radius': 'var(--sk-radius-sm)',
            'font-size': 'var(--sk-font-size-xs)',
            color: 'var(--sk-text-muted)',
            'font-family': 'var(--sk-font-mono, monospace)',
          }}
        >
          Esc
        </kbd>
      </div>

      {/* Results */}
      <div style={{ 'overflow-y': 'auto', flex: '1' }}>
        <Show
          when={results().length > 0}
          fallback={
            <div
              style={{
                padding: 'var(--sk-space-xl)',
                'text-align': 'center',
                'font-size': 'var(--sk-font-size-sm)',
                color: 'var(--sk-text-muted)',
                'font-family': 'var(--sk-font-ui)',
              }}
            >
              No stories found
            </div>
          }
        >
          <Show when={hasRecent()}>
            <div
              style={{
                padding: 'var(--sk-space-xs) var(--sk-space-md)',
                'font-size': 'var(--sk-font-size-xs)',
                color: 'var(--sk-text-muted)',
                'font-family': 'var(--sk-font-ui)',
                'font-weight': '500',
                'letter-spacing': '0.05em',
                'text-transform': 'uppercase',
              }}
            >
              Recently Viewed
            </div>
          </Show>
          <For each={results()}>
            {(story, idx) => {
              const isSelected = () => selectedIdx() === idx()
              const isRecentItem = () => hasRecent() && recentSet().has(story.id)
              const showAllLabel = () =>
                hasRecent() && !isRecentItem() && idx() === recentIds().length

              return (
                <>
                  <Show when={showAllLabel()}>
                    <div
                      style={{
                        padding: 'var(--sk-space-xs) var(--sk-space-md)',
                        'font-size': 'var(--sk-font-size-xs)',
                        color: 'var(--sk-text-muted)',
                        'font-family': 'var(--sk-font-ui)',
                        'font-weight': '500',
                        'letter-spacing': '0.05em',
                        'text-transform': 'uppercase',
                        'border-top': '1px solid var(--sk-border-subtle)',
                        'padding-top': 'var(--sk-space-sm)',
                        'margin-top': 'var(--sk-space-xs)',
                      }}
                    >
                      All Results
                    </div>
                  </Show>
                  <div
                    onClick={() => selectStory(story.id)}
                    onMouseEnter={() => setSelectedIdx(idx())}
                    style={{
                      display: 'flex',
                      'align-items': 'center',
                      gap: 'var(--sk-space-sm)',
                      padding: 'var(--sk-space-sm) var(--sk-space-md)',
                      cursor: 'pointer',
                      background: isSelected()
                        ? 'color-mix(in srgb, var(--sk-accent) 12%, transparent)'
                        : 'transparent',
                      'border-left': isSelected()
                        ? '2px solid var(--sk-accent)'
                        : '2px solid transparent',
                      transition: 'background var(--sk-duration-fast)',
                    }}
                  >
                    <KindIcon kind={story.def.kind} />
                    <div style={{ flex: '1', 'min-width': '0' }}>
                      <div
                        style={{
                          'font-size': 'var(--sk-font-size-base)',
                          'font-family': 'var(--sk-font-ui)',
                          color: 'var(--sk-text-primary)',
                          'white-space': 'nowrap',
                          overflow: 'hidden',
                          'text-overflow': 'ellipsis',
                        }}
                      >
                        {highlightText(story.title, query())}
                      </div>
                      <div
                        style={{
                          'font-size': 'var(--sk-font-size-xs)',
                          color: 'var(--sk-text-muted)',
                          'font-family': 'var(--sk-font-ui)',
                          'margin-top': '1px',
                        }}
                      >
                        {story.category}
                      </div>
                    </div>
                    <KindBadge kind={story.def.kind} />
                  </div>
                </>
              )
            }}
          </For>
        </Show>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--sk-space-md)',
          padding: 'var(--sk-space-xs) var(--sk-space-md)',
          'border-top': '1px solid var(--sk-border)',
          'font-size': 'var(--sk-font-size-xs)',
          color: 'var(--sk-text-muted)',
          'font-family': 'var(--sk-font-ui)',
        }}
      >
        <span>↑↓ navigate</span>
        <span>↵ open</span>
        <span>Esc close</span>
      </div>
    </div>
  )
}

// ─── Plugin definition ───────────────────────────────────────────────────────

export const commandPalettePlugin: ExplorerPlugin = {
  id: 'command-palette',
  name: 'Command Palette',
  description: 'Quick story search with fuzzy matching and keyboard navigation. Open with ⌘K.',
  icon: '⌘',
  version: '1.0.0',
  shortcut: 'mod+k',
  slots: {
    overlay: CommandPaletteOverlay,
  },

  activate(ctx: PluginContext) {
    _ctx = ctx

    const unregister = ctx.registerShortcut('mod+k', 'Open Command Palette', () => {
      // We need to access the plugin store to toggle overlay
      // We dispatch a custom event that the Shell listens to
      window.dispatchEvent(new CustomEvent('sk-explorer:toggle-overlay', {
        detail: { pluginId: 'command-palette' },
      }))
    })

    return () => {
      unregister()
      _ctx = null
    }
  },

  defaultConfig: {
    recentStories: [],
  },
}
