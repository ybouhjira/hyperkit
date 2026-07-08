import { createSignal, createMemo, For, Show } from 'solid-js'
import type { ExplorerPlugin, PluginContext } from '../types'
import type { StoryEntry } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'
import { groupByCategory } from '../../utils/groupByCategory'
import { fuzzyMatch } from '../shared/fuzzyMatch'
import { KindBadge } from '../shared/KindBadge'
import { KindDot } from '../shared/KindIcon'

// ─── Module-level ctx ────────────────────────────────────────────────────────

let _ctx: PluginContext | null = null

type ViewId = 'search' | 'tree' | 'favorites' | 'recent' | 'settings'

interface RecentEntry {
  id: string
  timestamp: number
}

// ─── Views ───────────────────────────────────────────────────────────────────

interface SearchViewProps {
  stories: StoryEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  cardColumns: number
}

function SearchView(props: SearchViewProps) {
  const [query, setQuery] = createSignal('')

  const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'component', label: 'Component' },
    { id: 'service', label: 'Service' },
    { id: 'algorithm', label: 'Algorithm' },
  ]
  const [activeFilter, setActiveFilter] = createSignal('all')

  const filtered = createMemo<StoryEntry[]>(() => {
    const q = query().trim()
    const f = activeFilter()

    return props.stories
      .filter((s) => {
        const kindOk = f === 'all' || s.def.kind === f
        if (!kindOk) return false
        if (!q) return true
        const t = fuzzyMatch(q, s.title)
        const c = fuzzyMatch(q, s.category)
        return t.matched || c.matched
      })
      .sort((a, b) => {
        if (!query().trim()) return 0
        const scoreA = Math.max(
          fuzzyMatch(query(), a.title).score,
          fuzzyMatch(query(), a.category).score
        )
        const scoreB = Math.max(
          fuzzyMatch(query(), b.title).score,
          fuzzyMatch(query(), b.category).score
        )
        return scoreB - scoreA
      })
  })

  const KIND_TOP_COLORS: Record<string, string> = {
    component: 'var(--sk-accent)',
    service: 'var(--sk-success)',
    algorithm: 'var(--sk-warning)',
  }

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', height: '100%', gap: '0' }}>
      <div style={{ padding: 'var(--sk-space-sm)' }}>
        <input
          type="text"
          placeholder="Search stories..."
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          style={{
            width: '100%',
            padding: 'var(--sk-space-xs) var(--sk-space-sm)',
            'font-family': 'var(--sk-font-ui)',
            'font-size': 'var(--sk-font-size-sm)',
            background: 'var(--sk-bg-primary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            'border-radius': 'var(--sk-radius-md)',
            outline: 'none',
            'box-sizing': 'border-box',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '0 var(--sk-space-sm) var(--sk-space-sm)',
          'flex-wrap': 'wrap',
        }}
      >
        <For each={FILTER_OPTIONS}>
          {(opt) => {
            const isActive = () => activeFilter() === opt.id
            return (
              <button
                onClick={() => setActiveFilter(opt.id)}
                style={{
                  padding: '2px var(--sk-space-xs)',
                  'border-radius': 'var(--sk-radius-sm)',
                  'font-size': 'var(--sk-font-size-xs)',
                  'font-family': 'var(--sk-font-ui)',
                  cursor: 'pointer',
                  border: `1px solid ${isActive() ? 'var(--sk-accent)' : 'var(--sk-border)'}`,
                  background: isActive()
                    ? 'color-mix(in srgb, var(--sk-accent) 15%, transparent)'
                    : 'transparent',
                  color: isActive() ? 'var(--sk-accent)' : 'var(--sk-text-secondary)',
                }}
              >
                {opt.label}
              </button>
            )
          }}
        </For>
      </div>
      <div
        style={{
          'overflow-y': 'auto',
          flex: '1',
          padding: 'var(--sk-space-xs) var(--sk-space-sm)',
          display: 'grid',
          'grid-template-columns': `repeat(${props.cardColumns}, 1fr)`,
          gap: 'var(--sk-space-xs)',
          'align-content': 'start',
        }}
      >
        <For
          each={filtered()}
          fallback={
            <div
              style={{
                'grid-column': `1 / -1`,
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
          {(story) => {
            const topColor = KIND_TOP_COLORS[story.def.kind] ?? 'var(--sk-border)'
            const isSelected = () => props.selectedId === story.id

            return (
              <div
                onClick={() => props.onSelect(story.id)}
                style={{
                  background: isSelected()
                    ? 'color-mix(in srgb, var(--sk-accent) 10%, var(--sk-bg-secondary))'
                    : 'var(--sk-bg-secondary)',
                  border: `1px solid ${isSelected() ? 'var(--sk-accent)' : 'var(--sk-border)'}`,
                  'border-top': `3px solid ${topColor}`,
                  'border-radius': 'var(--sk-radius-md)',
                  padding: 'var(--sk-space-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--sk-duration-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected()) {
                    e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected()) {
                    e.currentTarget.style.background = isSelected()
                      ? 'color-mix(in srgb, var(--sk-accent) 10%, var(--sk-bg-secondary))'
                      : 'var(--sk-bg-secondary)'
                  }
                }}
              >
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-family': 'var(--sk-font-ui)',
                    'font-weight': '500',
                    color: 'var(--sk-text-primary)',
                    'margin-bottom': '4px',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                  }}
                >
                  {story.title}
                </div>
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-xs)',
                    color: 'var(--sk-text-muted)',
                    'font-family': 'var(--sk-font-ui)',
                    'margin-bottom': 'var(--sk-space-xs)',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                  }}
                >
                  {story.category}
                </div>
                <KindBadge kind={story.def.kind} />
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}

interface TreeViewProps {
  stories: StoryEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function TreeView(props: TreeViewProps) {
  const [collapsedGroups, setCollapsedGroups] = createSignal<Set<string>>(new Set())
  const groupedStories = createMemo(() => groupByCategory(props.stories))

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div style={{ 'overflow-y': 'auto', height: '100%', 'padding-bottom': 'var(--sk-space-sm)' }}>
      <For each={groupedStories()}>
        {(group) => {
          const isCollapsed = () => collapsedGroups().has(group.name)
          const storyEntries = group.children.filter((c): c is StoryEntry => 'id' in c)

          return (
            <div>
              <button
                onClick={() => toggleGroup(group.name)}
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: 'var(--sk-space-xs)',
                  width: '100%',
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  'font-size': 'var(--sk-font-size-xs)',
                  'font-family': 'var(--sk-font-ui)',
                  'font-weight': '600',
                  color: 'var(--sk-text-muted)',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.06em',
                  'text-align': 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: isCollapsed() ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform var(--sk-duration-fast)',
                  }}
                >
                  ▾
                </span>
                {group.name}
                <span
                  style={{
                    'margin-left': 'auto',
                    background: 'var(--sk-bg-tertiary)',
                    color: 'var(--sk-text-muted)',
                    'border-radius': '999px',
                    padding: '0 4px',
                    'font-size': '9px',
                    'line-height': '14px',
                  }}
                >
                  {storyEntries.length}
                </span>
              </button>
              <Show when={!isCollapsed()}>
                <For each={storyEntries}>
                  {(story) => {
                    const isSelected = () => props.selectedId === story.id
                    return (
                      <div
                        onClick={() => props.onSelect(story.id)}
                        style={{
                          display: 'flex',
                          'align-items': 'center',
                          gap: 'var(--sk-space-xs)',
                          padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                          'padding-left': 'calc(var(--sk-space-sm) + 12px)',
                          cursor: 'pointer',
                          background: isSelected()
                            ? 'color-mix(in srgb, var(--sk-accent) 12%, transparent)'
                            : 'transparent',
                          'border-left': isSelected()
                            ? '2px solid var(--sk-accent)'
                            : '2px solid transparent',
                          transition: 'background var(--sk-duration-fast)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected()) e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected()) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <KindDot kind={story.def.kind} />
                        <span
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'font-family': 'var(--sk-font-ui)',
                            color: isSelected() ? 'var(--sk-accent)' : 'var(--sk-text-primary)',
                            overflow: 'hidden',
                            'text-overflow': 'ellipsis',
                            'white-space': 'nowrap',
                          }}
                        >
                          {story.title}
                        </span>
                      </div>
                    )
                  }}
                </For>
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}

interface FavoritesViewProps {
  favoriteIds: string[]
  stories: StoryEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

function FavoritesView(props: FavoritesViewProps) {
  const favoriteStories = createMemo<StoryEntry[]>(() =>
    props.favoriteIds
      .map((id) => props.stories.find((s) => s.id === id))
      .filter((s): s is StoryEntry => s !== undefined)
  )

  return (
    <div style={{ 'overflow-y': 'auto', height: '100%' }}>
      <Show
        when={favoriteStories().length > 0}
        fallback={
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              'justify-content': 'center',
              height: '100%',
              gap: 'var(--sk-space-sm)',
              color: 'var(--sk-text-muted)',
              'font-family': 'var(--sk-font-ui)',
            }}
          >
            <span style={{ 'font-size': '24px' }}>★</span>
            <span style={{ 'font-size': 'var(--sk-font-size-sm)' }}>No favorites yet</span>
            <span style={{ 'font-size': 'var(--sk-font-size-xs)' }}>
              Click the star on a story to add it
            </span>
          </div>
        }
      >
        <For each={favoriteStories()}>
          {(story) => {
            const isSelected = () => props.selectedId === story.id
            return (
              <div
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: 'var(--sk-space-xs)',
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  cursor: 'pointer',
                  background: isSelected()
                    ? 'color-mix(in srgb, var(--sk-accent) 12%, transparent)'
                    : 'transparent',
                  'border-left': isSelected()
                    ? '2px solid var(--sk-accent)'
                    : '2px solid transparent',
                }}
                onClick={() => props.onSelect(story.id)}
              >
                <KindDot kind={story.def.kind} />
                <span
                  style={{
                    flex: '1',
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-family': 'var(--sk-font-ui)',
                    color: isSelected() ? 'var(--sk-accent)' : 'var(--sk-text-primary)',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                  }}
                >
                  {story.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    props.onRemove(story.id)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--sk-text-muted)',
                    'font-size': 'var(--sk-font-size-xs)',
                    padding: '2px 4px',
                  }}
                  title="Remove from favorites"
                >
                  ✕
                </button>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}

interface RecentViewProps {
  recentEntries: RecentEntry[]
  stories: StoryEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function RecentView(props: RecentViewProps) {
  const recentStories = createMemo<Array<{ story: StoryEntry; timestamp: number }>>(() =>
    props.recentEntries
      .map((entry) => {
        const story = props.stories.find((s) => s.id === entry.id)
        return story ? { story, timestamp: entry.timestamp } : null
      })
      .filter((e): e is { story: StoryEntry; timestamp: number } => e !== null)
  )

  const relativeTime = (ts: number) => {
    const diffMs = Date.now() - ts
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return `${Math.floor(diffHr / 24)}d ago`
  }

  return (
    <div style={{ 'overflow-y': 'auto', height: '100%' }}>
      <Show
        when={recentStories().length > 0}
        fallback={
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              'justify-content': 'center',
              height: '100%',
              gap: 'var(--sk-space-sm)',
              color: 'var(--sk-text-muted)',
              'font-family': 'var(--sk-font-ui)',
            }}
          >
            <span style={{ 'font-size': '24px' }}>🕐</span>
            <span style={{ 'font-size': 'var(--sk-font-size-sm)' }}>No recent activity</span>
          </div>
        }
      >
        <For each={recentStories()}>
          {(entry) => {
            const isSelected = () => props.selectedId === entry.story.id
            return (
              <div
                onClick={() => props.onSelect(entry.story.id)}
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: 'var(--sk-space-xs)',
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  cursor: 'pointer',
                  background: isSelected()
                    ? 'color-mix(in srgb, var(--sk-accent) 12%, transparent)'
                    : 'transparent',
                  'border-left': isSelected()
                    ? '2px solid var(--sk-accent)'
                    : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected()) e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected()) e.currentTarget.style.background = 'transparent'
                }}
              >
                <KindDot kind={entry.story.def.kind} />
                <span
                  style={{
                    flex: '1',
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-family': 'var(--sk-font-ui)',
                    color: isSelected() ? 'var(--sk-accent)' : 'var(--sk-text-primary)',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    'white-space': 'nowrap',
                  }}
                >
                  {entry.story.title}
                </span>
                <span
                  style={{
                    'font-size': 'var(--sk-font-size-xs)',
                    color: 'var(--sk-text-muted)',
                    'font-family': 'var(--sk-font-ui)',
                    'white-space': 'nowrap',
                    'flex-shrink': '0',
                  }}
                >
                  {relativeTime(entry.timestamp)}
                </span>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}

// ─── Settings View ───────────────────────────────────────────────────────────

interface SettingsViewProps {
  cardColumns: number
  onCardColumnsChange: (v: number) => void
}

function SettingsView(props: SettingsViewProps) {
  return (
    <div style={{ padding: 'var(--sk-space-md)', 'overflow-y': 'auto', height: '100%' }}>
      <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
        <div
          style={{
            'font-size': 'var(--sk-font-size-sm)',
            'font-family': 'var(--sk-font-ui)',
            'font-weight': '500',
            color: 'var(--sk-text-primary)',
            'margin-bottom': 'var(--sk-space-xs)',
          }}
        >
          Card Columns
        </div>
        <div style={{ display: 'flex', gap: 'var(--sk-space-xs)' }}>
          <For each={[1, 2]}>
            {(n) => (
              <button
                onClick={() => props.onCardColumnsChange(n)}
                style={{
                  padding: 'var(--sk-space-xs) var(--sk-space-sm)',
                  'border-radius': 'var(--sk-radius-sm)',
                  border: `1px solid ${props.cardColumns === n ? 'var(--sk-accent)' : 'var(--sk-border)'}`,
                  background:
                    props.cardColumns === n
                      ? 'color-mix(in srgb, var(--sk-accent) 15%, transparent)'
                      : 'transparent',
                  color: props.cardColumns === n ? 'var(--sk-accent)' : 'var(--sk-text-secondary)',
                  cursor: 'pointer',
                  'font-size': 'var(--sk-font-size-sm)',
                  'font-family': 'var(--sk-font-ui)',
                }}
              >
                {n} col
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

// ─── Main Command Center Sidebar ─────────────────────────────────────────────

const NAV_ITEMS: { id: ViewId; icon: string; label: string }[] = [
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'tree', icon: '📂', label: 'Tree' },
  { id: 'favorites', icon: '★', label: 'Favorites' },
  { id: 'recent', icon: '🕐', label: 'Recent' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

function CommandCenterSidebar() {
  const { state, actions } = useExplorer()

  const [activeView, setActiveView] = createSignal<ViewId>(
    (_ctx?.getConfig<ViewId>('activeView')) ?? 'search'
  )
  const [favoriteIds, setFavoriteIds] = createSignal<string[]>(
    _ctx?.getConfig<string[]>('favoriteStories') ?? []
  )
  const [recentEntries, setRecentEntries] = createSignal<RecentEntry[]>(
    _ctx?.getConfig<RecentEntry[]>('recentStories') ?? []
  )
  const [cardColumns, setCardColumns] = createSignal<number>(
    (_ctx?.getConfig<number>('cardColumns')) ?? 2
  )

  const setView = (v: ViewId) => {
    setActiveView(v)
    _ctx?.setConfig('activeView', v)
  }

  const handleSelect = (id: string) => {
    actions.selectStory(id)
    // Track recent
    const entry: RecentEntry = { id, timestamp: Date.now() }
    const updated = [entry, ...recentEntries().filter((e) => e.id !== id)].slice(0, 20)
    setRecentEntries(updated)
    _ctx?.setConfig('recentStories', updated)
  }

  const handleFavoriteToggle = (id: string) => {
    const current = favoriteIds()
    const updated = current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    setFavoriteIds(updated)
    _ctx?.setConfig('favoriteStories', updated)
  }

  const handleCardColumnsChange = (n: number) => {
    setCardColumns(n)
    _ctx?.setConfig('cardColumns', n)
  }

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        height: '100%',
        background: 'var(--sk-bg-secondary)',
        'border-right': '1px solid var(--sk-border)',
        overflow: 'hidden',
      }}
    >
      {/* Internal nav */}
      <div
        style={{
          display: 'flex',
          'border-bottom': '1px solid var(--sk-border)',
          'flex-shrink': '0',
        }}
      >
        <For each={NAV_ITEMS}>
          {(item) => {
            const isActive = () => activeView() === item.id
            return (
              <button
                onClick={() => setView(item.id)}
                title={item.label}
                style={{
                  flex: '1',
                  padding: 'var(--sk-space-sm) var(--sk-space-xs)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  'font-size': '14px',
                  color: isActive() ? 'var(--sk-accent)' : 'var(--sk-text-muted)',
                  'border-bottom': `2px solid ${isActive() ? 'var(--sk-accent)' : 'transparent'}`,
                  transition: 'all var(--sk-duration-fast)',
                }}
              >
                {item.icon}
              </button>
            )
          }}
        </For>
      </div>

      {/* View content */}
      <div style={{ flex: '1', 'min-height': '0', overflow: 'hidden' }}>
        <Show when={activeView() === 'search'}>
          <SearchView
            stories={state.stories as StoryEntry[]}
            selectedId={state.selectedId}
            onSelect={handleSelect}
            cardColumns={cardColumns()}
          />
        </Show>
        <Show when={activeView() === 'tree'}>
          <TreeView
            stories={state.stories as StoryEntry[]}
            selectedId={state.selectedId}
            onSelect={handleSelect}
          />
        </Show>
        <Show when={activeView() === 'favorites'}>
          <FavoritesView
            favoriteIds={favoriteIds()}
            stories={state.stories as StoryEntry[]}
            selectedId={state.selectedId}
            onSelect={handleSelect}
            onRemove={handleFavoriteToggle}
          />
        </Show>
        <Show when={activeView() === 'recent'}>
          <RecentView
            recentEntries={recentEntries()}
            stories={state.stories as StoryEntry[]}
            selectedId={state.selectedId}
            onSelect={handleSelect}
          />
        </Show>
        <Show when={activeView() === 'settings'}>
          <SettingsView
            cardColumns={cardColumns()}
            onCardColumnsChange={handleCardColumnsChange}
          />
        </Show>
      </div>
    </div>
  )
}

// ─── Plugin definition ───────────────────────────────────────────────────────

export const commandCenterPlugin: ExplorerPlugin = {
  id: 'command-center',
  name: 'Command Center',
  description: 'Multi-view panel: search, tree, favorites, recent, and settings.',
  icon: '🎛️',
  version: '1.0.0',
  slots: {
    sidebar: CommandCenterSidebar,
  },

  activate(ctx: PluginContext) {
    _ctx = ctx
    return () => {
      _ctx = null
    }
  },

  defaultConfig: {
    activeView: 'search',
    recentStories: [],
    favoriteStories: [],
    collapsedGroups: [],
    cardColumns: 2,
  },
}
