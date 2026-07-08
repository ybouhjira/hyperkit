import { createSignal, onMount } from 'solid-js'
import { defineStory } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { KanbanView } from '../../src/pm/views/KanbanView'
import type { PMIssue } from '../../src/pm/types'

const provider = new MockProvider()

export const PMKanbanViewStory = defineStory({
  title: 'PM Kanban View',
  category: 'PM',
  render: () => {
    const [issues, setIssues] = createSignal<PMIssue[]>([])

    onMount(async () => {
      const allIssues = [
        ...await provider.fetchIssues('ybouhjira/hyperkit'),
        ...await provider.fetchIssues('ybouhjira/phoenix-erp'),
      ]
      setIssues(allIssues as PMIssue[])
    })

    return (
      <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <KanbanView issues={issues()} />
      </div>
    )
  },
  controls: {},
})
