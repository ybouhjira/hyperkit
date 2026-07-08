import { createContext, useContext, type JSX } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'
import type { ExplorerState, LogEntry, StoryEntry } from '../api/types'

interface ExplorerActions {
  selectStory: (id: string) => void
  setSearchQuery: (query: string) => void
  setControlValue: (key: string, value: unknown) => void
  addLog: (entry: LogEntry) => void
  clearLogs: () => void
  setActiveOutputTab: (tab: ExplorerState['activeOutputTab']) => void
  setSidebarWidth: (width: number) => void
  setBottomPanelHeight: (height: number) => void
  setStories: (stories: readonly StoryEntry[]) => void
}

interface ExplorerContext {
  state: ExplorerState
  setState: SetStoreFunction<ExplorerState>
  actions: ExplorerActions
}

const ExplorerStoreContext = createContext<ExplorerContext>()

export function ExplorerProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<ExplorerState>({
    stories: [],
    selectedId: null,
    searchQuery: '',
    controlValues: {},
    outputLogs: [],
    activeOutputTab: 'console',
    sidebarWidth: 250,
    bottomPanelHeight: 200,
  })

  const actions: ExplorerActions = {
    selectStory: (id: string) => {
      setState('selectedId', id)
    },
    setSearchQuery: (query: string) => {
      setState('searchQuery', query)
    },
    setControlValue: (key: string, value: unknown) => {
      setState('controlValues', key, value)
    },
    addLog: (entry: LogEntry) => {
      setState('outputLogs', (logs) => [...logs, entry])
    },
    clearLogs: () => {
      setState('outputLogs', [])
    },
    setActiveOutputTab: (tab: ExplorerState['activeOutputTab']) => {
      setState('activeOutputTab', tab)
    },
    setSidebarWidth: (width: number) => {
      setState('sidebarWidth', width)
    },
    setBottomPanelHeight: (height: number) => {
      setState('bottomPanelHeight', height)
    },
    setStories: (stories: readonly StoryEntry[]) => {
      setState('stories', stories)
    },
  }

  const context: ExplorerContext = { state, setState, actions }

  return (
    <ExplorerStoreContext.Provider value={context}>
      {props.children}
    </ExplorerStoreContext.Provider>
  )
}

export function useExplorer(): ExplorerContext {
  const context = useContext(ExplorerStoreContext)
  if (!context) {
    throw new Error('useExplorer must be used within ExplorerProvider')
  }
  return context
}
