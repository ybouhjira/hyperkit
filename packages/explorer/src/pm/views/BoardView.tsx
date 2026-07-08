import { createMemo, Show } from 'solid-js'
import type { PMIssue } from '../types'
import { toIssueBoardIssue } from '../mappers'
import { IssueBoard, Spinner } from '@ybouhjira/hyperkit'

export interface BoardViewProps {
  issues: readonly PMIssue[]
  groupBy?: 'repo' | 'label' | 'priority' | 'milestone' | 'none'
  view?: 'list' | 'board' | 'table'
  onIssueClick?: (uid: string) => void
}

export function BoardView(props: BoardViewProps) {
  const boardIssues = createMemo(() => props.issues.map(toIssueBoardIssue))
  const repos = createMemo(() => [...new Set(props.issues.map(i => i.project))])

  return (
    <Show when={props.issues.length > 0} fallback={
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '400px', gap: '12px' }}>
        <Spinner size="lg" color="primary" />
        <span style={{ color: 'var(--sk-text-secondary)', 'font-size': '14px' }}>Loading issue board...</span>
      </div>
    }>
      <IssueBoard
        issues={boardIssues()}
        repos={repos()}
        groupBy={props.groupBy ?? 'repo'}
        view={props.view ?? 'list'}
        onIssueClick={(issue) => props.onIssueClick?.(issue.id)}
      />
    </Show>
  )
}
