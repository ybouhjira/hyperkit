/** Project Management data model - unified types across all providers */

export interface PMLabel {
  readonly name: string
  readonly color: string
}

export interface PMIssue {
  readonly uid: string              // 'github:ybouhjira/hyperkit:123'
  readonly provider: string         // 'github' | 'trello' | 'jira' | 'sql'
  readonly project: string          // 'ybouhjira/hyperkit'
  readonly number: number
  readonly title: string
  readonly body: string
  readonly state: 'open' | 'closed' | 'in_progress'
  readonly labels: readonly PMLabel[]
  readonly assignee: string | null
  readonly milestone: string | null
  readonly priority: 'P0' | 'P1' | 'P2' | 'P3' | null
  readonly url: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly dependsOn: readonly string[]   // UIDs of dependencies
  readonly progress: { readonly done: number; readonly total: number }
  readonly layer?: string           // for graph grouping
}

export interface PMMilestone {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly state: 'open' | 'closed'
  readonly dueDate: string | null
  readonly openIssues: number
  readonly closedIssues: number
  readonly project: string
}

export interface PMProject {
  readonly id: string               // 'github:ybouhjira/hyperkit'
  readonly provider: string
  readonly name: string             // 'ybouhjira/hyperkit'
  readonly displayName: string      // 'hyperkit'
  readonly description: string
  readonly url: string
}

export interface PMFilters {
  readonly search?: string
  readonly state?: 'open' | 'closed' | 'in_progress' | 'all'
  readonly project?: string
  readonly label?: string
  readonly priority?: 'P0' | 'P1' | 'P2' | 'P3'
  readonly assignee?: string
  readonly milestone?: string
}

export type PMViewType = 'graph' | 'board' | 'kanban' | 'dashboard' | 'timeline'

export interface PMIssueCreate {
  readonly title: string
  readonly body: string
  readonly labels?: readonly string[]
  readonly assignee?: string
  readonly milestone?: string
  readonly priority?: 'P0' | 'P1' | 'P2' | 'P3'
}

export interface PMIssueUpdate {
  readonly title?: string
  readonly body?: string
  readonly state?: 'open' | 'closed' | 'in_progress'
  readonly labels?: readonly string[]
  readonly assignee?: string | null
  readonly milestone?: string | null
  readonly priority?: 'P0' | 'P1' | 'P2' | 'P3' | null
}
