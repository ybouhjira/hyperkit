import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { StoryTree } from '../src/components/Sidebar/StoryTree'
import { ExplorerProvider, useExplorer } from '../src/stores/explorerStore'
import { defineStory } from '../src/api'
import type { StoryEntry } from '../src/api/types'

function StoryTreeWithStories(props: { stories: StoryEntry[] }) {
  const { actions } = useExplorer()
  actions.setStories(props.stories)
  return <StoryTree />
}

function StoryTreeWithSearch(props: { stories: StoryEntry[]; query: string }) {
  const { actions } = useExplorer()
  actions.setStories(props.stories)
  actions.setSearchQuery(props.query)
  return <StoryTree />
}

describe('StoryTree', () => {
  it('renders empty state when no stories', () => {
    render(() => (
      <ExplorerProvider>
        <StoryTree />
      </ExplorerProvider>
    ))

    expect(screen.getByText('No stories found')).toBeInTheDocument()
  })

  it('renders group names from categories', () => {
    const stories: StoryEntry[] = [
      {
        id: 'btn',
        title: 'Button',
        category: 'Primitives',
        def: defineStory({ title: 'Button', category: 'Primitives', controls: {} }),
      },
      {
        id: 'card',
        title: 'Card',
        category: 'Primitives',
        def: defineStory({ title: 'Card', category: 'Primitives', controls: {} }),
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        category: 'Composites',
        def: defineStory({ title: 'Dashboard', category: 'Composites', controls: {} }),
      },
    ]

    render(() => (
      <ExplorerProvider>
        <StoryTreeWithStories stories={stories} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Primitives')).toBeInTheDocument()
    expect(screen.getByText('Composites')).toBeInTheDocument()
  })

  it('renders story titles within groups', () => {
    const stories: StoryEntry[] = [
      {
        id: 'btn',
        title: 'Button',
        category: 'Primitives',
        def: defineStory({ title: 'Button', category: 'Primitives', controls: {} }),
      },
      {
        id: 'card',
        title: 'Card',
        category: 'Primitives',
        def: defineStory({ title: 'Card', category: 'Primitives', controls: {} }),
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        category: 'Composites',
        def: defineStory({ title: 'Dashboard', category: 'Composites', controls: {} }),
      },
    ]

    render(() => (
      <ExplorerProvider>
        <StoryTreeWithStories stories={stories} />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('clicking a story selects it', () => {
    const stories: StoryEntry[] = [
      {
        id: 'btn',
        title: 'Button',
        category: 'Primitives',
        def: defineStory({ title: 'Button', category: 'Primitives', controls: {} }),
      },
      {
        id: 'card',
        title: 'Card',
        category: 'Primitives',
        def: defineStory({ title: 'Card', category: 'Primitives', controls: {} }),
      },
    ]

    function StoryTreeWithSelectionCheck(props: { stories: StoryEntry[] }) {
      const { actions, state } = useExplorer()
      actions.setStories(props.stories)

      return (
        <div>
          <StoryTree />
          <div data-testid="selected-id">{state.selectedId}</div>
        </div>
      )
    }

    render(() => (
      <ExplorerProvider>
        <StoryTreeWithSelectionCheck stories={stories} />
      </ExplorerProvider>
    ))

    const buttonStory = screen.getByText('Button')
    fireEvent.click(buttonStory)

    expect(screen.getByTestId('selected-id')).toHaveTextContent('btn')

    const cardStory = screen.getByText('Card')
    fireEvent.click(cardStory)

    expect(screen.getByTestId('selected-id')).toHaveTextContent('card')
  })

  it('filters stories by search query', () => {
    const stories: StoryEntry[] = [
      {
        id: 'btn',
        title: 'Button',
        category: 'Primitives',
        def: defineStory({ title: 'Button', category: 'Primitives', controls: {} }),
      },
      {
        id: 'card',
        title: 'Card',
        category: 'Primitives',
        def: defineStory({ title: 'Card', category: 'Primitives', controls: {} }),
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        category: 'Composites',
        def: defineStory({ title: 'Dashboard', category: 'Composites', controls: {} }),
      },
    ]

    render(() => (
      <ExplorerProvider>
        <StoryTreeWithSearch stories={stories} query="button" />
      </ExplorerProvider>
    ))

    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.queryByText('Card')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('shows empty state when search has no matches', () => {
    const stories: StoryEntry[] = [
      {
        id: 'btn',
        title: 'Button',
        category: 'Primitives',
        def: defineStory({ title: 'Button', category: 'Primitives', controls: {} }),
      },
      {
        id: 'card',
        title: 'Card',
        category: 'Primitives',
        def: defineStory({ title: 'Card', category: 'Primitives', controls: {} }),
      },
    ]

    render(() => (
      <ExplorerProvider>
        <StoryTreeWithSearch stories={stories} query="nonexistent" />
      </ExplorerProvider>
    ))

    expect(screen.getByText('No stories found')).toBeInTheDocument()
    expect(screen.queryByText('Button')).not.toBeInTheDocument()
    expect(screen.queryByText('Card')).not.toBeInTheDocument()
  })
})
