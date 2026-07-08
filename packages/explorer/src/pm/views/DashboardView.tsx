import { createMemo, Show } from 'solid-js'
import type { PMIssue, PMMilestone } from '../types'
import { toDashboardIssues, toDashboardMilestones } from '../mappers'
import { ProjectDashboard, Spinner } from '@ybouhjira/hyperkit'

export interface DashboardViewProps {
  issues: readonly PMIssue[]
  milestones: readonly PMMilestone[]
  projectName: string
  filter?: 'open' | 'closed' | 'all'
  onFilterChange?: (filter: 'open' | 'closed' | 'all') => void
  onMilestoneClick?: (milestoneTitle: string) => void
}

export function DashboardView(props: DashboardViewProps) {
  const dashIssues = createMemo(() => toDashboardIssues(props.issues))
  const dashMilestones = createMemo(() => toDashboardMilestones(props.milestones))

  return (
    <Show when={props.issues.length > 0} fallback={
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '400px', gap: '12px' }}>
        <Spinner size="lg" color="primary" />
        <span style={{ color: 'var(--sk-text-secondary)', 'font-size': '14px' }}>Loading dashboard...</span>
      </div>
    }>
      <ProjectDashboard
        projectName={props.projectName}
        issues={dashIssues()}
        milestones={dashMilestones()}
        filter={props.filter}
        onFilterChange={props.onFilterChange}
        onMilestoneClick={
          props.onMilestoneClick
            ? (milestone) => props.onMilestoneClick?.(milestone.title)
            : undefined
        }
      />
    </Show>
  )
}
