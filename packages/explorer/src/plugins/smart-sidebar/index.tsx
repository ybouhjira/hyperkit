import { createSignal, createMemo, For, Show } from 'solid-js'
import type { ExplorerPlugin, PluginContext } from '../types'
import type { StoryEntry } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'
import { groupByCategory } from '../../utils/groupByCategory'
import { fuzzyMatch } from '../shared/fuzzyMatch'
import { KindDot } from '../shared/KindIcon'

// ─── Module-level ctx for the sidebar component ──────────────────────────────

let _ctx: PluginContext | null = null

// ─── Sidebar component ───────────────────────────────────────────────────────

function SmartSidebar() {
  const { state, actions } = useExplorer()

  const [activeFilter, setActiveFilterLocal] = createSignal<string>(
    _ctx?.getConfig<string>('activeFilter') ?? 'all'
  )
  const [collapsedGroups, setCollapsedGroups] = createSignal<Set<string>>(
    new Set(_ctx?.getConfig<string[]>('collapsedGroups') ?? [])
  )
  const [recentIds, setRecentIds] = createSignal<string[]>(
    _ctx?.getConfig<string[]>('recentStories') ?? []
  )
  const [favoriteIds, setFavoriteIds] = createSignal<string[]>(
    _ctx?.getConfig<string[]>('favoriteStories') ?? []
  )

  const setFilter = (f: string) => {
    setActiveFilterLocal(f)
    _ctx?.setConfig('activeFilter', f)
  }

  const pushRecent = (id: string) => {
    const updated = [id, ...recentIds().filter((r) => r !== id)].slice(0, 10)
    setRecentIds(updated)
    _ctx?.setConfig('recentStories', updated)
  }

  const toggleFavorite = (id: string) => {
    const current = favoriteIds()
    const updated = current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    setFavoriteIds(updated)
    _ctx?.setConfig('favoriteStories', updated)
  }

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      _ctx?.setConfig('collapsedGroups', Array.from(next))
      return next
    })
  }

  const handleSelect = (id: string) => {
    actions.selectStory(id)
    pushRecent(id)
  }

  // Kind filter options
  const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'component', label: 'Component' },
    { id: 'service', label: 'Service' },
    { id: 'algorithm', label: 'Algorithm' },
  ]

  const filteredStories = createMemo(() => {
    const q = state.searchQuery.toLowerCase().trim()
    const f = activeFilter()

    return state.stories.filter((story) => {
      const kindOk = f === 'all' || story.def.kind === f
      if (!kindOk) return false
      if (!q) return true
      const titleMatch = fuzzyMatch(q, story.title)
      const catMatch = fuzzyMatch(q, story.category)
      return titleMatch.matched || catMatch.matched
    })
  })

  const countByKind = createMemo(() => {
    const counts: Record<string, number> = { all: state.stories.length }
    for (const s of state.stories) {
      counts[s.def.kind] = (counts[s.def.kind] ?? 0) + 1
    }
    return counts
  })

  const groupedStories = createMemo(() => groupByCategory(filteredStories()))

  const recentStories = createMemo<StoryEntry[]>(() =>
    recentIds()
      .map((id) => state.stories.find((s) => s.id === id))
      .filter((s): s is StoryEntry => s !== undefined)
      .slice(0, 5)
  )

  const favoriteStories = createMemo<StoryEntry[]>(() =>
    favoriteIds()
      .map((id) => state.stories.find((s) => s.id === id))
      .filter((s): s is StoryEntry => s !== undefined)
  )

  const [showRecent, setShowRecent] = createSignal(true)
  const [showFavorites, setShowFavorites] = createSignal(true)

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
      {/* Search input */}
      <div style={{ padding: 'var(--sk-space-sm)' }}>
        <input
          type="text"
          placeholder="Search stories..."
          value={state.searchQuery}
          onInput={(e) => actions.setSearchQuery(e.currentTarget.value)}
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

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          'flex-wrap': 'wrap',
          gap: '4px',
          padding: '0 var(--sk-space-sm) var(--sk-space-sm)',
        }}
      >
        <For each={FILTER_OPTIONS}>
          {(opt) => {
            const count = () => countByKind()[opt.id] ?? 0
            const isActive = () => activeFilter() === opt.id
            return (
              <button
                onClick={() => setFilter(opt.id)}
                style={{
                  display: 'inline-flex',
                  'align-items': 'center',
                  gap: '3px',
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
                  transition: 'all var(--sk-duration-fast)',
                }}
              >
                {opt.label}
                <span
                  style={{
                    background: isActive()
                      ? 'var(--sk-accent)'
                      : 'var(--sk-bg-tertiary)',
                    color: isActive() ? 'white' : 'var(--sk-text-muted)',
                    'border-radius': '999px',
                    padding: '0 4px',
                    'font-size': '9px',
                    'line-height': '14px',
                  }}
                >
                  {count()}
                </span>
              </button>
            )
          }}
        </For>
      </div>

      {/* Scrollable content */}
      <div style={{ 'overflow-y': 'auto', flex: '1', 'padding-bottom': 'var(--sk-space-sm)' }}>
        {/* Recently Viewed */}
        <Show when={recentStories().length > 0}>
          <CollapsibleSection
            title="Recently Viewed"
            icon="🕐"
            count={recentStories().length}
            collapsed={!showRecent()}
            onToggle={() => setShowRecent((v) => !v)}
          >
            <For each={recentStories()}>
              {(story) => (
                <StoryItem
                  story={story}
                  isSelected={state.selectedId === story.id}
                  isFavorite={favoriteIds().includes(story.id)}
                  onSelect={() => handleSelect(story.id)}
                  onFavoriteToggle={() => toggleFavorite(story.id)}
                />
              )}
            </For>
          </CollapsibleSection>
        </Show>

        {/* Favorites */}
        <Show when={favoriteStories().length > 0}>
          <CollapsibleSection
            title="Favorites"
            icon="★"
            count={favoriteStories().length}
            collapsed={!showFavorites()}
            onToggle={() => setShowFavorites((v) => !v)}
          >
            <For each={favoriteStories()}>
              {(story) => (
                <StoryItem
                  story={story}
                  isSelected={state.selectedId === story.id}
                  isFavorite={true}
                  onSelect={() => handleSelect(story.id)}
                  onFavoriteToggle={() => toggleFavorite(story.id)}
                />
              )}
            </For>
          </CollapsibleSection>
        </Show>

        {/* Category tree */}
        <Show
          when={groupedStories().length > 0}
          fallback={
            <div
              style={{
                padding: 'var(--sk-space-lg)',
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
          <For each={groupedStories()}>
            {(group) => {
              const isCollapsed = () => collapsedGroups().has(group.name)
              const storyEntries = group.children.filter(
                (c): c is StoryEntry => 'id' in c
              )
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
                      'font-family': 'var(--sk-font-ui)',
                      'font-size': 'var(--sk-font-size-xs)',
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
                        transition: 'transform var(--sk-duration-fast)',
                        transform: isCollapsed() ? 'rotate(-90deg)' : 'rotate(0deg)',
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
                      {(story) => (
                        <StoryItem
                          story={story}
                          isSelected={state.selectedId === story.id}
                          isFavorite={favoriteIds().includes(story.id)}
                          onSelect={() => handleSelect(story.id)}
                          onFavoriteToggle={() => toggleFavorite(story.id)}
                          indent={1}
                        />
                      )}
                    </For>
                  </Show>
                </div>
              )
            }}
          </For>
        </Show>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: 'var(--sk-space-xs) var(--sk-space-sm)',
          'border-top': '1px solid var(--sk-border)',
          'font-size': 'var(--sk-font-size-xs)',
          color: 'var(--sk-text-muted)',
          'font-family': 'var(--sk-font-ui)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
        }}
      >
        <span>{filteredStories().length} stories</span>
        <span>v1.0.0</span>
      </div>
    </div>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

interface CollapsibleSectionProps {
  title: string
  icon: string
  count: number
  collapsed: boolean
  onToggle: () => void
  children: unknown
}

function CollapsibleSection(props: CollapsibleSectionProps) {
  return (
    <div style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
      <button
        onClick={props.onToggle}
        style={{
          display: 'flex',
          'align-items': 'center',
          gap: 'var(--sk-space-xs)',
          width: '100%',
          padding: 'var(--sk-space-xs) var(--sk-space-sm)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          'font-family': 'var(--sk-font-ui)',
          'font-size': 'var(--sk-font-size-xs)',
          'font-weight': '600',
          color: 'var(--sk-text-secondary)',
          'text-align': 'left',
        }}
      >
        <span style={{ 'font-size': '12px' }}>{props.icon}</span>
        {props.title}
        <span
          style={{
            background: 'var(--sk-bg-tertiary)',
            color: 'var(--sk-text-muted)',
            'border-radius': '999px',
            padding: '0 4px',
            'font-size': '9px',
            'line-height': '14px',
          }}
        >
          {props.count}
        </span>
        <span
          style={{
            'margin-left': 'auto',
            display: 'inline-block',
            transition: 'transform var(--sk-duration-fast)',
            transform: props.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      <Show when={!props.collapsed}>{props.children as any}</Show>
    </div>
  )
}

interface StoryItemProps {
  story: StoryEntry
  isSelected: boolean
  isFavorite: boolean
  onSelect: () => void
  onFavoriteToggle: () => void
  indent?: number
}

function StoryItem(props: StoryItemProps) {
  const indent = () => (props.indent ?? 0) * 12 + 8

  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--sk-space-xs)',
        padding: 'var(--sk-space-xs) var(--sk-space-sm)',
        'padding-left': `${indent()}px`,
        cursor: 'pointer',
        background: props.isSelected
          ? 'color-mix(in srgb, var(--sk-accent) 12%, transparent)'
          : 'transparent',
        'border-left': props.isSelected
          ? '2px solid var(--sk-accent)'
          : '2px solid transparent',
        transition: 'background var(--sk-duration-fast)',
      }}
      onClick={props.onSelect}
      onMouseEnter={(e) => {
        if (!props.isSelected) {
          e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!props.isSelected) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <KindDot kind={props.story.def.kind} />
      <span
        style={{
          flex: '1',
          'font-size': 'var(--sk-font-size-sm)',
          'font-family': 'var(--sk-font-ui)',
          color: props.isSelected ? 'var(--sk-accent)' : 'var(--sk-text-primary)',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
        }}
      >
        {props.story.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          props.onFavoriteToggle()
        }}
        title={props.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: props.isFavorite ? 'var(--sk-warning)' : 'var(--sk-text-muted)',
          padding: '0',
          'font-size': '12px',
          opacity: props.isFavorite ? '1' : '0',
          transition: 'opacity var(--sk-duration-fast)',
          'flex-shrink': '0',
        }}
        classList={{ 'sk-fav-btn': true }}
      >
        ★
      </button>
    </div>
  )
}

// ─── Plugin definition ───────────────────────────────────────────────────────

export const smartSidebarPlugin: ExplorerPlugin = {
  id: 'smart-sidebar',
  name: 'Smart Sidebar',
  description: 'Enhanced sidebar with filters, favorites, recent history, and grouped tree.',
  icon: '📂',
  version: '1.0.0',
  slots: {
    sidebar: SmartSidebar,
  },

  activate(ctx: PluginContext) {
    _ctx = ctx
    return () => {
      _ctx = null
    }
  },

  defaultConfig: {
    recentStories: [],
    favoriteStories: [],
    collapsedGroups: [],
    activeFilter: 'all',
  },
}
