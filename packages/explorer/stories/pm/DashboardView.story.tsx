import { createSignal, onMount } from 'solid-js'
import { defineStory, control } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { DashboardView } from '../../src/pm/views/DashboardView'
import type { PMIssue, PMMilestone } from '../../src/pm/types'

const provider = new MockProvider()

export const PMDashboardViewStory = defineStory({
  title: 'PM Dashboard View',
  category: 'PM',
  render: (props) => {
    const [issues, setIssues] = createSignal<PMIssue[]>([])
    const [milestones, setMilestones] = createSignal<PMMilestone[]>([])
    const [filter, setFilter] = createSignal<'open' | 'closed' | 'all'>('open')

    onMount(async () => {
      const project = (props.project as string) || 'ybouhjira/hyperkit'
      const [i, m] = await Promise.all([
        provider.fetchIssues(project),
        provider.fetchMilestones(project),
      ])
      setIssues(i as PMIssue[])
      setMilestones(m as PMMilestone[])
    })

    return (
      <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
        <DashboardView
          issues={issues()}
          milestones={milestones()}
          projectName={(props.project as string) || 'ybouhjira/hyperkit'}
          filter={filter()}
          onFilterChange={setFilter}
        />
      </div>
    )
  },
  controls: {
    project: control.select(['ybouhjira/hyperkit', 'ybouhjira/phoenix-erp'], 'ybouhjira/hyperkit', 'Project'),
  },
})
