import { createSignal, onMount } from 'solid-js'
import { defineStory, control } from '../../src/api'
import { MockProvider } from '../../src/pm/providers/mock'
import { TimelineView } from '../../src/pm/views/TimelineView'
import type { PMIssue } from '../../src/pm/types'

const provider = new MockProvider()

export const PMTimelineViewStory = defineStory({
  title: 'PM Timeline View',
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
      <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
        <TimelineView
          issues={issues()}
          orientation={(props.orientation as 'vertical' | 'horizontal') ?? 'vertical'}
          size={(props.size as 'sm' | 'md' | 'lg') ?? 'md'}
        />
      </div>
    )
  },
  controls: {
    orientation: control.select(['vertical', 'horizontal'], 'vertical', 'Orientation'),
    size: control.select(['sm', 'md', 'lg'], 'md', 'Size'),
  },
})
