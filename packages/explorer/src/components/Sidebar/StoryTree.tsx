import { For, Show, createMemo } from 'solid-js'
import type { StoryEntry, StoryGroup } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'
import { groupByCategory } from '../../utils/groupByCategory'

function TreeNode(props: { node: StoryGroup | StoryEntry; level: number }) {
  const { state, actions } = useExplorer()

  const isGroup = () => 'children' in props.node
  const isStory = () => 'id' in props.node

  const isSelected = () =>
    isStory() && state.selectedId === (props.node as StoryEntry).id

  const handleClick = () => {
    if (isStory()) {
      actions.selectStory((props.node as StoryEntry).id)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          padding: '6px 12px',
          'padding-left': `${props.level * 16 + 12}px`,
          'font-family': 'var(--sk-font-mono)',
          'font-size':
            isGroup() && props.level === 0 ? 'var(--sk-font-size-xs)' : 'var(--sk-font-size-sm)',
          color: isSelected()
            ? 'var(--sk-accent)'
            : isGroup()
              ? 'var(--sk-text-muted)'
              : 'var(--sk-text-secondary)',
          background: isSelected() ? 'var(--sk-accent-muted)' : 'transparent',
          'box-shadow': isSelected() ? 'inset 2px 0 0 var(--sk-accent)' : 'none',
          cursor: isStory() ? 'pointer' : 'default',
          transition: 'background var(--sk-duration-fast) var(--sk-ease-default)',
          'border-radius': 'var(--sk-radius-sm)',
          margin: '2px 8px',
          'font-weight': isGroup() ? '600' : '400',
          'text-transform': isGroup() && props.level === 0 ? 'uppercase' : 'none',
          'letter-spacing': isGroup() && props.level === 0 ? '0.08em' : 'normal',
        }}
        onMouseEnter={(e) => {
          if (isStory() && !isSelected()) {
            e.currentTarget.style.background = 'var(--sk-bg-tertiary)'
          }
        }}
        onMouseLeave={(e) => {
          if (isStory() && !isSelected()) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        {'name' in props.node ? props.node.name : props.node.title}
      </div>
      <Show when={isGroup()}>
        <For each={(props.node as StoryGroup).children}>
          {(child) => <TreeNode node={child} level={props.level + 1} />}
        </For>
      </Show>
    </div>
  )
}

export function StoryTree() {
  const { state } = useExplorer()

  const filteredStories = createMemo(() => {
    const query = state.searchQuery.toLowerCase().trim()
    if (!query) return state.stories

    return state.stories.filter(
      (story) =>
        story.title.toLowerCase().includes(query) ||
        story.category.toLowerCase().includes(query)
    )
  })

  const groupedStories = createMemo(() => groupByCategory(filteredStories()))

  return (
    <div
      style={{
        'overflow-y': 'auto',
        flex: '1',
        padding: '8px 0',
      }}
    >
      <Show
        when={groupedStories().length > 0}
        fallback={
          <div
            style={{
              padding: 'var(--sk-space-lg)',
              'text-align': 'center',
              'font-family': 'var(--sk-font-mono)',
              'font-size': 'var(--sk-font-size-sm)',
              color: 'var(--sk-text-secondary)',
            }}
          >
            No stories found
          </div>
        }
      >
        <For each={groupedStories()}>{(group) => <TreeNode node={group} level={0} />}</For>
      </Show>
    </div>
  )
}
