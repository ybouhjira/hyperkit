import type { PMProvider } from './types'
import type { PMIssue, PMIssueCreate, PMIssueUpdate, PMMilestone, PMProject, PMFilters, PMLabel } from '../types'

// Mock data storage
let mockProjects: PMProject[] = [
  {
    id: 'mock:ybouhjira/hyperkit',
    provider: 'mock',
    name: 'ybouhjira/hyperkit',
    displayName: 'hyperkit',
    description: 'SolidJS component library and design system',
    url: 'https://github.com/ybouhjira/hyperkit',
  },
  {
    id: 'mock:ybouhjira/phoenix-erp',
    provider: 'mock',
    name: 'ybouhjira/phoenix-erp',
    displayName: 'phoenix-erp',
    description: 'Modern ERP system for small businesses',
    url: 'https://github.com/ybouhjira/phoenix-erp',
  },
]

let mockMilestones: PMMilestone[] = [
  {
    id: 'ms-1',
    project: 'ybouhjira/hyperkit',
    title: 'v1.0 Release',
    description: 'Core features and stability for first production release',
    state: 'open',
    dueDate: '2026-02-15',
    openIssues: 6,
    closedIssues: 12,
  },
  {
    id: 'ms-2',
    project: 'ybouhjira/hyperkit',
    title: 'v1.1 Polish',
    description: 'Refinements and developer experience improvements',
    state: 'open',
    dueDate: '2026-03-01',
    openIssues: 7,
    closedIssues: 3,
  },
  {
    id: 'ms-3',
    project: 'ybouhjira/hyperkit',
    title: 'v2.0 Features',
    description: 'Next generation features and capabilities',
    state: 'open',
    dueDate: '2026-03-31',
    openIssues: 15,
    closedIssues: 0,
  },
  {
    id: 'ms-4',
    project: 'ybouhjira/phoenix-erp',
    title: 'Phase 1 Core',
    description: 'Foundation and core business logic',
    state: 'open',
    dueDate: '2026-02-28',
    openIssues: 4,
    closedIssues: 8,
  },
  {
    id: 'ms-5',
    project: 'ybouhjira/phoenix-erp',
    title: 'Phase 2 Modules',
    description: 'Extended business modules and integrations',
    state: 'open',
    dueDate: '2026-03-30',
    openIssues: 18,
    closedIssues: 2,
  },
]

let mockIssues: PMIssue[] = [
  // SolidKit issues - 4-tier hierarchy
  // Tier 0 (roots)
  {
    uid: 'mock:ybouhjira/hyperkit:1',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 1,
    title: 'Redesign theme system architecture',
    body: 'Rebuild the theme system with improved type safety and better CSS variable scoping.',
    state: 'closed',
    priority: 'P0',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'breaking', color: '#FF5630' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'v1.0 Release',
    layer: 'Core',
    url: 'https://github.com/ybouhjira/hyperkit/issues/1',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-20',
    dependsOn: [] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:3',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 3,
    title: 'Fix Button ripple effect on Safari',
    body: 'Safari-specific rendering issue with button ripple animations.',
    state: 'closed',
    priority: 'P1',
    labels: [
      { name: 'bug', color: '#FF5630' },
      { name: 'safari', color: '#FFC400' },
    ] as readonly PMLabel[],
    assignee: 'claude-agent',
    milestone: 'v1.0 Release',
    layer: 'Core',
    url: 'https://github.com/ybouhjira/hyperkit/issues/3',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-28',
    dependsOn: [] as readonly string[],
    progress: { done: 0, total: 0 },
  },

  // Tier 1 (depends on tier 0)
  {
    uid: 'mock:ybouhjira/hyperkit:2',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 2,
    title: 'Add dark mode support to all components',
    body: 'Implement dark mode variants for all components using the new theme system.',
    state: 'in_progress',
    priority: 'P0',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'theme', color: '#00B8D9' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'v1.0 Release',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/hyperkit/issues/2',
    createdAt: '2026-01-21',
    updatedAt: '2026-02-10',
    dependsOn: ['mock:ybouhjira/hyperkit:1'] as readonly string[],
    progress: { done: 18, total: 25 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:5',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 5,
    title: 'Optimize bundle size for tree-shaking',
    body: 'Refactor exports to improve tree-shaking and reduce bundle size.',
    state: 'in_progress',
    priority: 'P2',
    labels: [
      { name: 'enhancement', color: '#0052CC' },
      { name: 'perf', color: '#FF991F' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'v1.1 Polish',
    layer: 'Infrastructure',
    url: 'https://github.com/ybouhjira/hyperkit/issues/5',
    createdAt: '2026-01-25',
    updatedAt: '2026-02-08',
    dependsOn: ['mock:ybouhjira/hyperkit:1'] as readonly string[],
    progress: { done: 5, total: 8 },
  },

  // Tier 2 (depends on tier 1)
  {
    uid: 'mock:ybouhjira/hyperkit:4',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 4,
    title: 'Create comprehensive accessibility testing suite',
    body: 'Automated a11y testing for all components using axe-core and manual keyboard navigation tests.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'testing', color: '#36B37E' },
      { name: 'a11y', color: '#6554C0' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'v1.1 Polish',
    layer: 'Infrastructure',
    url: 'https://github.com/ybouhjira/hyperkit/issues/4',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
    dependsOn: ['mock:ybouhjira/hyperkit:2', 'mock:ybouhjira/hyperkit:5'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:6',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 6,
    title: 'Add animation presets library',
    body: 'Collection of pre-built animation configurations for common UI patterns.',
    state: 'open',
    priority: 'P2',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'animation', color: '#00B8D9' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'v2.0 Features',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/hyperkit/issues/6',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
    dependsOn: ['mock:ybouhjira/hyperkit:2'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:7',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 7,
    title: 'Document CSS variable customization patterns',
    body: 'Comprehensive guide for customizing components via CSS variables.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'docs', color: '#36B37E' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'v1.0 Release',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/hyperkit/issues/7',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-09',
    dependsOn: ['mock:ybouhjira/hyperkit:2'] as readonly string[],
    progress: { done: 0, total: 0 },
  },

  // Tier 3 (depends on tier 2)
  {
    uid: 'mock:ybouhjira/hyperkit:8',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 8,
    title: 'Build interactive component playground',
    body: 'Live code editor with instant preview for exploring component APIs.',
    state: 'open',
    priority: 'P3',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'docs', color: '#36B37E' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'v2.0 Features',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/hyperkit/issues/8',
    createdAt: '2026-02-12',
    updatedAt: '2026-02-12',
    dependsOn: ['mock:ybouhjira/hyperkit:6', 'mock:ybouhjira/hyperkit:7'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:9',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 9,
    title: 'Refactor Box component to use CSS Grid',
    body: 'Replace flexbox implementation with CSS Grid for better layout control.',
    state: 'open',
    priority: null,
    labels: [
      { name: 'refactor', color: '#6554C0' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: null,
    layer: 'Core',
    url: 'https://github.com/ybouhjira/hyperkit/issues/9',
    createdAt: '2026-02-03',
    updatedAt: '2026-02-03',
    dependsOn: ['mock:ybouhjira/hyperkit:4'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/hyperkit:10',
    provider: 'mock',
    project: 'ybouhjira/hyperkit',
    number: 10,
    title: 'Add keyboard navigation to Dialog component',
    body: 'Implement full keyboard navigation support with focus trapping.',
    state: 'open',
    priority: 'P0',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'a11y', color: '#6554C0' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'v1.0 Release',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/hyperkit/issues/10',
    createdAt: '2026-01-08',
    updatedAt: '2026-01-30',
    dependsOn: ['mock:ybouhjira/hyperkit:8'] as readonly string[],
    progress: { done: 0, total: 0 },
  },

  // Phoenix ERP issues - 4-tier hierarchy
  // Tier 0 (roots)
  {
    uid: 'mock:ybouhjira/phoenix-erp:11',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 11,
    title: 'Define ERP data models',
    body: 'Entity-relationship design for customers, products, orders, and invoices.',
    state: 'closed',
    priority: 'P0',
    labels: [
      { name: 'architecture', color: '#0052CC' },
      { name: 'database', color: '#00B8D9' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'Phase 1 Core',
    layer: 'Core',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/11',
    createdAt: '2026-01-03',
    updatedAt: '2026-01-18',
    dependsOn: [] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:13',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 13,
    title: 'Setup CI/CD pipeline',
    body: 'Automated testing, build, and deployment pipeline with GitHub Actions.',
    state: 'closed',
    priority: 'P0',
    labels: [
      { name: 'infrastructure', color: '#6554C0' },
      { name: 'devops', color: '#00B8D9' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'Phase 1 Core',
    layer: 'Infrastructure',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/13',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-22',
    dependsOn: [] as readonly string[],
    progress: { done: 0, total: 0 },
  },

  // Tier 1 (depends on tier 0)
  {
    uid: 'mock:ybouhjira/phoenix-erp:12',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 12,
    title: 'Implement auth module',
    body: 'JWT-based auth with role-based access control for different user types.',
    state: 'in_progress',
    priority: 'P0',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'security', color: '#FF5630' },
    ] as readonly PMLabel[],
    assignee: 'ybouhjira',
    milestone: 'Phase 1 Core',
    layer: 'Core',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/12',
    createdAt: '2026-01-19',
    updatedAt: '2026-02-11',
    dependsOn: ['mock:ybouhjira/phoenix-erp:11'] as readonly string[],
    progress: { done: 7, total: 10 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:14',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 14,
    title: 'Create API gateway',
    body: 'Centralized API gateway with rate limiting and authentication middleware.',
    state: 'in_progress',
    priority: 'P1',
    labels: [
      { name: 'infrastructure', color: '#6554C0' },
      { name: 'api', color: '#0052CC' },
    ] as readonly PMLabel[],
    assignee: 'claude-agent',
    milestone: 'Phase 1 Core',
    layer: 'Infrastructure',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/14',
    createdAt: '2026-01-23',
    updatedAt: '2026-02-12',
    dependsOn: ['mock:ybouhjira/phoenix-erp:11', 'mock:ybouhjira/phoenix-erp:13'] as readonly string[],
    progress: { done: 6, total: 12 },
  },

  // Tier 2 (depends on tier 1)
  {
    uid: 'mock:ybouhjira/phoenix-erp:15',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 15,
    title: 'Build invoice module',
    body: 'Invoice creation, PDF generation, and payment tracking.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'invoice', color: '#36B37E' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/15',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
    dependsOn: ['mock:ybouhjira/phoenix-erp:12', 'mock:ybouhjira/phoenix-erp:14'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:16',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 16,
    title: 'Build inventory module',
    body: 'Stock tracking, warehouse management, and reorder point automation.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'inventory', color: '#36B37E' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/16',
    createdAt: '2026-02-02',
    updatedAt: '2026-02-02',
    dependsOn: ['mock:ybouhjira/phoenix-erp:12', 'mock:ybouhjira/phoenix-erp:14'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:17',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 17,
    title: 'Build user management',
    body: 'User CRUD, role assignment, and permission management UI.',
    state: 'open',
    priority: 'P2',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'admin', color: '#FFC400' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/17',
    createdAt: '2026-02-03',
    updatedAt: '2026-02-03',
    dependsOn: ['mock:ybouhjira/phoenix-erp:12'] as readonly string[],
    progress: { done: 0, total: 0 },
  },

  // Tier 3 (depends on tier 2)
  {
    uid: 'mock:ybouhjira/phoenix-erp:18',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 18,
    title: 'Dashboard analytics',
    body: 'Revenue charts, inventory status, pending orders, and sales analytics.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'analytics', color: '#6554C0' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Dashboard',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/18',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
    dependsOn: ['mock:ybouhjira/phoenix-erp:15', 'mock:ybouhjira/phoenix-erp:16'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:19',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 19,
    title: 'Report generation',
    body: 'Customizable business reports with PDF and Excel export.',
    state: 'open',
    priority: 'P2',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'reports', color: '#00B8D9' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Features',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/19',
    createdAt: '2026-02-06',
    updatedAt: '2026-02-06',
    dependsOn: ['mock:ybouhjira/phoenix-erp:15'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
  {
    uid: 'mock:ybouhjira/phoenix-erp:20',
    provider: 'mock',
    project: 'ybouhjira/phoenix-erp',
    number: 20,
    title: 'Mobile responsive UI',
    body: 'Fully responsive design with mobile-first approach for all modules.',
    state: 'open',
    priority: 'P1',
    labels: [
      { name: 'feature', color: '#0052CC' },
      { name: 'mobile', color: '#FF5630' },
    ] as readonly PMLabel[],
    assignee: null,
    milestone: 'Phase 2 Modules',
    layer: 'Products',
    url: 'https://github.com/ybouhjira/phoenix-erp/issues/20',
    createdAt: '2026-02-07',
    updatedAt: '2026-02-07',
    dependsOn: ['mock:ybouhjira/phoenix-erp:17', 'mock:ybouhjira/phoenix-erp:18'] as readonly string[],
    progress: { done: 0, total: 0 },
  },
]

// Helper to simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to extract project name from project ID
const extractProjectName = (projectIdOrName: string): string => {
  // If it's in format 'mock:ybouhjira/hyperkit', extract 'ybouhjira/hyperkit'
  if (projectIdOrName.includes('mock:')) {
    return projectIdOrName.replace('mock:', '')
  }
  // Otherwise assume it's already the project name
  return projectIdOrName
}

export class MockProvider implements PMProvider {
  readonly type = 'mock'

  async fetchProjects(): Promise<readonly PMProject[]> {
    await delay(50)
    return mockProjects as readonly PMProject[]
  }

  async fetchIssues(project: string, filters?: PMFilters): Promise<readonly PMIssue[]> {
    await delay(50)

    const projectName = extractProjectName(project)
    let results = mockIssues.filter(issue => issue.project === projectName)

    if (filters) {
      // Filter by state
      if (filters.state && filters.state !== 'all') {
        results = results.filter(issue => issue.state === filters.state)
      }

      // Filter by label
      if (filters.label) {
        results = results.filter(issue =>
          issue.labels.some(l => l.name === filters.label)
        )
      }

      // Filter by priority
      if (filters.priority) {
        results = results.filter(issue => issue.priority === filters.priority)
      }

      // Filter by assignee
      if (filters.assignee) {
        results = results.filter(issue => issue.assignee === filters.assignee)
      }

      // Filter by milestone
      if (filters.milestone) {
        results = results.filter(issue => issue.milestone === filters.milestone)
      }

      // Search text (in title and body)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        results = results.filter(issue =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.body.toLowerCase().includes(searchLower)
        )
      }
    }

    return results as readonly PMIssue[]
  }

  async fetchMilestones(project: string): Promise<readonly PMMilestone[]> {
    await delay(50)
    const projectName = extractProjectName(project)
    return mockMilestones.filter(ms => ms.project === projectName) as readonly PMMilestone[]
  }

  async createIssue(project: string, data: PMIssueCreate): Promise<PMIssue> {
    await delay(50)

    const projectName = extractProjectName(project)
    const projectShortName = projectName.split('/')[1]
    const nextNumber = mockIssues.filter(i => i.project === projectName).length + 1

    // Convert string labels to PMLabel objects
    const labels: PMLabel[] = (data.labels ?? []).map(labelName => ({
      name: labelName,
      color: '#999999', // Default color for new labels
    }))

    const newIssue: PMIssue = {
      uid: `mock:${projectName}:${nextNumber}`,
      provider: 'mock',
      project: projectName,
      number: nextNumber,
      title: data.title,
      body: data.body,
      state: 'open' as const,
      priority: data.priority ?? null,
      labels: labels as readonly PMLabel[],
      assignee: data.assignee ?? null,
      milestone: data.milestone ?? null,
      url: `https://github.com/${projectName}/issues/${nextNumber}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      dependsOn: [] as readonly string[],
      progress: { done: 0, total: 0 },
    }

    mockIssues.push(newIssue)
    return newIssue
  }

  async updateIssue(project: string, uid: string, data: PMIssueUpdate): Promise<PMIssue> {
    await delay(50)

    const existing = mockIssues.find(issue => issue.uid === uid)
    if (!existing) {
      throw new Error(`Issue ${uid} not found`)
    }

    // Convert string labels to PMLabel objects if labels are being updated
    let updatedLabels: readonly PMLabel[] | undefined
    if (data.labels) {
      updatedLabels = data.labels.map(labelName => ({
        name: labelName,
        color: '#999999',
      })) as readonly PMLabel[]
    }

    const updated: PMIssue = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.state !== undefined && { state: data.state }),
      ...(updatedLabels !== undefined && { labels: updatedLabels }),
      ...(data.assignee !== undefined && { assignee: data.assignee }),
      ...(data.milestone !== undefined && { milestone: data.milestone }),
      ...(data.priority !== undefined && { priority: data.priority }),
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    const idx = mockIssues.indexOf(existing)
    mockIssues[idx] = updated
    return updated
  }

  async closeIssue(project: string, uid: string): Promise<void> {
    await delay(50)

    const existing = mockIssues.find(issue => issue.uid === uid)
    if (!existing) {
      throw new Error(`Issue ${uid} not found`)
    }

    const idx = mockIssues.indexOf(existing)
    mockIssues[idx] = {
      ...existing,
      state: 'closed' as const,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
  }
}
