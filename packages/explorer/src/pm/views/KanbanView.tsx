import { createMemo, Show } from 'solid-js'
import type { PMIssue } from '../types'
import { toKanbanColumns } from '../mappers'
import { KanbanBoard, Spinner } from '@ybouhjira/hyperkit'

export interface KanbanViewProps {
  issues: readonly PMIssue[]
  onCardClick?: (uid: string) => void
}

export function KanbanView(props: KanbanViewProps) {
  const columns = createMemo(() => toKanbanColumns(props.issues))

  return (
    <Show when={props.issues.length > 0} fallback={
      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '400px', gap: '12px' }}>
        <Spinner size="lg" color="primary" />
        <span style={{ color: 'var(--sk-text-secondary)', 'font-size': '14px' }}>Loading kanban board...</span>
      </div>
    }>
      <KanbanBoard
        columns={columns()}
        onCardClick={(card) => props.onCardClick?.(card.id)}
      />
    </Show>
  )
}
