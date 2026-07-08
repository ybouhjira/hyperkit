import { createMemo, Show } from 'solid-js'
import type { PMIssue } from '../types'
import { toTimelineSteps } from '../mappers'
import { Timeline, Spinner } from '@ybouhjira/hyperkit'

export interface TimelineViewProps {
  issues: readonly PMIssue[]
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md' | 'lg'
}

export function TimelineView(props: TimelineViewProps) {
  const steps = createMemo(() => toTimelineSteps(props.issues))

  return (
    <Show when={props.issues.length > 0} fallback={
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '400px', gap: '12px' }}>
        <Spinner size="lg" color="primary" />
        <span style={{ color: 'var(--sk-text-secondary)', 'font-size': '14px' }}>Loading timeline...</span>
      </div>
    }>
      <Timeline
        steps={steps()}
        orientation={props.orientation ?? 'vertical'}
        size={props.size ?? 'md'}
      />
    </Show>
  )
}
