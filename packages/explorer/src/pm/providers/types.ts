import type { PMIssue, PMIssueCreate, PMIssueUpdate, PMMilestone, PMProject, PMFilters } from '../types'

export interface PMProvider {
  readonly type: string
  fetchProjects(): Promise<readonly PMProject[]>
  fetchIssues(project: string, filters?: PMFilters): Promise<readonly PMIssue[]>
  fetchMilestones(project: string): Promise<readonly PMMilestone[]>
  createIssue(project: string, data: PMIssueCreate): Promise<PMIssue>
  updateIssue(project: string, id: string, data: PMIssueUpdate): Promise<PMIssue>
  closeIssue(project: string, id: string): Promise<void>
}
