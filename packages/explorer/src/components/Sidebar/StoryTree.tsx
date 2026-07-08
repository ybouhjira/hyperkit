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
          'font-family': 'var(--sk-font-ui)',
          'font-size': '13px',
          color: isSelected()
            ? 'var(--sk-accent)'
            : 'var(--sk-text-primary)',
          background: isSelected() ? 'var(--sk-bg-tertiary)' : 'transparent',
          cursor: isStory() ? 'pointer' : 'default',
          transition: 'background 0.15s',
          'border-radius': 'var(--sk-radius-sm)',
          margin: '2px 8px',
          'font-weight': isGroup() ? '500' : '400',
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
              padding: '20px',
              'text-align': 'center',
              'font-family': 'var(--sk-font-ui)',
              'font-size': '13px',
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
