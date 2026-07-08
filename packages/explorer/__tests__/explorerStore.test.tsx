import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ExplorerProvider, useExplorer } from '../src/stores/explorerStore'
import type { ExplorerContext } from '../src/stores/explorerStore'
import type { LogEntry, StoryEntry } from '../src/api/types'

function TestHarness(props: { onContext: (ctx: ExplorerContext) => void }) {
  const ctx = useExplorer()
  props.onContext(ctx)
  return <div data-testid="state">{JSON.stringify(ctx.state)}</div>
}

describe('ExplorerStore', () => {
  it('useExplorer throws without provider', () => {
    expect(() => {
      render(() => {
        const ctx = useExplorer()
        return <div>{ctx.state.searchQuery}</div>
      })
    }).toThrow('useExplorer must be used within ExplorerProvider')
  })

  it('initial state has correct defaults', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext).not.toBeNull()
    expect(capturedContext!.state).toEqual({
      stories: [],
      selectedId: null,
      searchQuery: '',
      controlValues: {},
      outputLogs: [],
      activeOutputTab: 'console',
      sidebarWidth: 250,
      bottomPanelHeight: 200,
    })
  })

  it('selectStory updates selectedId', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.selectedId).toBeNull()

    capturedContext!.actions.selectStory('story-123')

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.selectedId).toBe('story-123')
  })

  it('setSearchQuery updates searchQuery', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.searchQuery).toBe('')

    capturedContext!.actions.setSearchQuery('button')

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.searchQuery).toBe('button')
  })

  it('setControlValue sets nested control values', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.controlValues).toEqual({})

    capturedContext!.actions.setControlValue('variant', 'primary')
    capturedContext!.actions.setControlValue('size', 'lg')

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.controlValues).toEqual({
      variant: 'primary',
      size: 'lg',
    })
  })

  it('addLog appends to outputLogs', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.outputLogs).toEqual([])

    const log1: LogEntry = {
      id: '1',
      timestamp: Date.now(),
      level: 'info',
      message: 'First log',
    }

    const log2: LogEntry = {
      id: '2',
      timestamp: Date.now(),
      level: 'error',
      message: 'Second log',
    }

    capturedContext!.actions.addLog(log1)
    capturedContext!.actions.addLog(log2)

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.outputLogs).toHaveLength(2)
    expect(parsedState.outputLogs[0]).toMatchObject({ message: 'First log', level: 'info' })
    expect(parsedState.outputLogs[1]).toMatchObject({ message: 'Second log', level: 'error' })
  })

  it('clearLogs empties outputLogs', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    const log: LogEntry = {
      id: '1',
      timestamp: Date.now(),
      level: 'info',
      message: 'Test log',
    }

    capturedContext!.actions.addLog(log)
    capturedContext!.actions.addLog(log)

    let stateElement = screen.getByTestId('state')
    let parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.outputLogs).toHaveLength(2)

    capturedContext!.actions.clearLogs()

    stateElement = screen.getByTestId('state')
    parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.outputLogs).toEqual([])
  })

  it('setActiveOutputTab switches tab', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.activeOutputTab).toBe('console')

    capturedContext!.actions.setActiveOutputTab('actions')

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.activeOutputTab).toBe('actions')
  })

  it('setSidebarWidth updates width', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.sidebarWidth).toBe(250)

    capturedContext!.actions.setSidebarWidth(350)

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.sidebarWidth).toBe(350)
  })

  it('setBottomPanelHeight updates height', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.bottomPanelHeight).toBe(200)

    capturedContext!.actions.setBottomPanelHeight(300)

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.bottomPanelHeight).toBe(300)
  })

  it('setStories replaces stories array', () => {
    let capturedContext: ExplorerContext | null = null

    render(() => (
      <ExplorerProvider>
        <TestHarness onContext={(ctx) => { capturedContext = ctx }} />
      </ExplorerProvider>
    ))

    expect(capturedContext!.state.stories).toEqual([])

    const stories: readonly StoryEntry[] = [
      {
        id: 'story-1',
        name: 'Button Primary',
        group: 'Primitives',
        component: () => null,
      },
      {
        id: 'story-2',
        name: 'Card Basic',
        group: 'Primitives',
        component: () => null,
      },
    ]

    capturedContext!.actions.setStories(stories)

    const stateElement = screen.getByTestId('state')
    const parsedState = JSON.parse(stateElement.textContent || '{}')
    expect(parsedState.stories).toHaveLength(2)
    expect(parsedState.stories[0]).toMatchObject({ id: 'story-1', name: 'Button Primary' })
    expect(parsedState.stories[1]).toMatchObject({ id: 'story-2', name: 'Card Basic' })
  })
})
