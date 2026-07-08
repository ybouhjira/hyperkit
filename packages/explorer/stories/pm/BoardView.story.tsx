import { createSignal, onMount, createMemo } from 'solid-js'
import { defineStory, control } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { BoardView } from '../../src/pm/views/BoardView'
import type { PMIssue } from '../../src/pm/types'

const provider = new MockProvider()

export const PMBoardViewStory = defineStory({
  title: 'PM Board View',
  category: 'PM',
  render: (props) => {
    const [issues, setIssues] = createSignal<PMIssue[]>([])

    onMount(async () => {
      const allIssues = [
        ...await provider.fetchIssues('ybouhjira/hyperkit'),
        ...await provider.fetchIssues('ybouhjira/phoenix-erp'),
      ]
      setIssues(allIssues as PMIssue[])
    })

    return (
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <BoardView
          issues={issues()}
          groupBy={(props.groupBy as 'repo' | 'label' | 'priority' | 'milestone' | 'none') ?? 'repo'}
          view={(props.view as 'list' | 'board' | 'table') ?? 'list'}
        />
      </div>
    )
  },
  controls: {
    groupBy: control.select(['repo', 'label', 'priority', 'milestone', 'none'], 'repo', 'Group By'),
    view: control.select(['list', 'board', 'table'], 'list', 'View Mode'),
  },
})
