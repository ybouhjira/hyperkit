import { createSignal, onMount, Show, createMemo } from 'solid-js'
import { defineStory } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { GraphView } from '../../src/pm/views/GraphView'
import { BoardView } from '../../src/pm/views/BoardView'
import { KanbanView } from '../../src/pm/views/KanbanView'
import { DashboardView } from '../../src/pm/views/DashboardView'
import { TimelineView } from '../../src/pm/views/TimelineView'
import type { PMIssue, PMMilestone, PMViewType } from '../../src/pm/types'

const provider = new MockProvider()

const VIEWS: { id: PMViewType; label: string; icon: string }[] = [
  { id: 'graph', label: 'Graph', icon: '🔗' },
  { id: 'board', label: 'Board', icon: '📋' },
  { id: 'kanban', label: 'Kanban', icon: '📊' },
  { id: 'dashboard', label: 'Dashboard', icon: '📈' },
  { id: 'timeline', label: 'Timeline', icon: '⏱' },
]

export const PMWorkspaceStory = defineStory({
  title: 'PM Workspace',
  category: 'PM',
  render: () => {
    const [activeView, setActiveView] = createSignal<PMViewType>('graph')
    const [issues, setIssues] = createSignal<PMIssue[]>([])
    const [milestones, setMilestones] = createSignal<PMMilestone[]>([])
    const [activeProject, setActiveProject] = createSignal('ybouhjira/hyperkit')

    const loadData = async (project: string) => {
      const [i, m] = await Promise.all([
        provider.fetchIssues(project),
        provider.fetchMilestones(project),
      ])
      setIssues(i as PMIssue[])
      setMilestones(m as PMMilestone[])
    }

    onMount(() => loadData(activeProject()))

    const handleProjectChange = (project: string) => {
      setActiveProject(project)
      loadData(project)
    }

    // Also provide "All Projects" option
    const allIssues = createMemo(() => issues())

    return (
      <div style={{
        display: 'flex',
        'flex-direction': 'column',
        height: 'calc(100vh - 200px)',
        'font-family': 'var(--sk-font-ui)',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}>
        {/* Top bar: project selector + view tabs */}
        <div style={{
          display: 'flex',
          'align-items': 'center',
          gap: '12px',
          padding: '8px 12px',
          background: 'var(--sk-bg-secondary)',
          'border-bottom': '1px solid var(--sk-border)',
        }}>
          <select
            value={activeProject()}
            onChange={(e) => handleProjectChange(e.currentTarget.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--sk-border)',
              'border-radius': '4px',
              background: 'var(--sk-bg-primary)',
              color: 'var(--sk-text-primary)',
              'font-size': '13px',
            }}
          >
            <option value="ybouhjira/hyperkit">hyperkit</option>
            <option value="ybouhjira/phoenix-erp">phoenix-erp</option>
          </select>

          <div style={{ display: 'flex', gap: '2px', 'margin-left': '8px' }}>
            {VIEWS.map((view) => (
              <button
                onClick={() => setActiveView(view.id)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--sk-border)',
                  'border-radius': '4px',
                  background: activeView() === view.id ? 'var(--sk-accent)' : 'var(--sk-bg-primary)',
                  color: activeView() === view.id ? '#fff' : 'var(--sk-text-primary)',
                  'font-size': '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  'align-items': 'center',
                  gap: '4px',
                }}
              >
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>

          <div style={{ 'margin-left': 'auto', 'font-size': '12px', color: 'var(--sk-text-secondary)' }}>
            {issues().length} issues
          </div>
        </div>

        {/* View content */}
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <Show when={activeView() === 'graph'}>
            <GraphView issues={allIssues()} />
          </Show>
          <Show when={activeView() === 'board'}>
            <BoardView issues={allIssues()} groupBy="priority" view="board" />
          </Show>
          <Show when={activeView() === 'kanban'}>
            <KanbanView issues={allIssues()} />
          </Show>
          <Show when={activeView() === 'dashboard'}>
            <DashboardView
              issues={allIssues()}
              milestones={milestones()}
              projectName={activeProject()}
            />
          </Show>
          <Show when={activeView() === 'timeline'}>
            <TimelineView issues={allIssues()} />
          </Show>
        </div>
      </div>
    )
  },
  controls: {},
})
