import type { PMViewType } from '../types'

export interface ViewConfig {
  readonly id: PMViewType
  readonly label: string
  readonly icon: string
}

export const PM_VIEWS: readonly ViewConfig[] = [
  { id: 'graph', label: 'Graph', icon: '🔗' },
  { id: 'board', label: 'Board', icon: '📋' },
  { id: 'kanban', label: 'Kanban', icon: '📊' },
  { id: 'dashboard', label: 'Dashboard', icon: '📈' },
  { id: 'timeline', label: 'Timeline', icon: '⏱' },
]
