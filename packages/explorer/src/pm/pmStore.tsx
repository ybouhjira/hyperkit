import { createContext, useContext, type JSX } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'
import type { PMIssue, PMMilestone, PMProject, PMFilters, PMViewType } from './types'
import type { PMProvider } from './providers/types'

interface PMState {
  projects: readonly PMProject[]
  issues: readonly PMIssue[]
  milestones: readonly PMMilestone[]
  activeView: PMViewType
  filters: PMFilters
  selectedIssueUid: string | null
  activeProjectId: string | null
  loading: boolean
  error: string | null
}

interface PMActions {
  loadProjects: () => Promise<void>
  loadIssues: (projectId?: string) => Promise<void>
  loadMilestones: (projectId: string) => Promise<void>
  refresh: () => Promise<void>
  setView: (view: PMViewType) => void
  setFilters: (filters: Partial<PMFilters>) => void
  selectIssue: (uid: string | null) => void
  selectProject: (projectId: string | null) => void
}

interface PMContext {
  state: PMState
  setState: SetStoreFunction<PMState>
  actions: PMActions
}

const PMStoreContext = createContext<PMContext>()

export function PMStoreProvider(props: { provider: PMProvider; children: JSX.Element }) {
  const [state, setState] = createStore<PMState>({
    projects: [],
    issues: [],
    milestones: [],
    activeView: 'graph',
    filters: {},
    selectedIssueUid: null,
    activeProjectId: null,
    loading: false,
    error: null,
  })

  const actions: PMActions = {
    loadProjects: async () => {
      setState('loading', true)
      setState('error', null)
      try {
        const projects = await props.provider.fetchProjects()
        setState('projects', projects)
      } catch (err) {
        setState('error', err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setState('loading', false)
      }
    },

    loadIssues: async (projectId?: string) => {
      setState('loading', true)
      setState('error', null)
      try {
        const targetProjectId = projectId || state.projects[0]?.id
        if (!targetProjectId) {
          setState('issues', [])
          return
        }
        const issues = await props.provider.fetchIssues(targetProjectId, state.filters)
        setState('issues', issues)
      } catch (err) {
        setState('error', err instanceof Error ? err.message : 'Failed to load issues')
      } finally {
        setState('loading', false)
      }
    },

    loadMilestones: async (projectId: string) => {
      try {
        const milestones = await props.provider.fetchMilestones(projectId)
        setState('milestones', milestones)
      } catch (err) {
        setState('error', err instanceof Error ? err.message : 'Failed to load milestones')
      }
    },

    refresh: async () => {
      await actions.loadProjects()
      const projectId = state.activeProjectId || state.projects[0]?.id
      if (projectId) {
        await Promise.all([actions.loadIssues(projectId), actions.loadMilestones(projectId)])
      }
    },

    setView: (view: PMViewType) => {
      setState('activeView', view)
    },

    setFilters: (filters: Partial<PMFilters>) => {
      setState('filters', { ...state.filters, ...filters })
    },

    selectIssue: (uid: string | null) => {
      setState('selectedIssueUid', uid)
    },

    selectProject: async (projectId: string | null) => {
      setState('activeProjectId', projectId)
      if (projectId) {
        await Promise.all([actions.loadIssues(projectId), actions.loadMilestones(projectId)])
      }
    },
  }

  const context: PMContext = { state, setState, actions }

  return (
    <PMStoreContext.Provider value={context}>{props.children}</PMStoreContext.Provider>
  )
}

export function usePM(): PMContext {
  const context = useContext(PMStoreContext)
  if (!context) {
    throw new Error('usePM must be used within PMStoreProvider')
  }
  return context
}
