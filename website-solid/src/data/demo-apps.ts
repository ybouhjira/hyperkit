/**
 * Registry of the full demo applications. The gallery at /demos renders from
 * this list; each entry has a dedicated route at /demos/<slug> rendering a
 * complete HyperKit application (see src/components/demo-apps/<slug>/).
 */
export interface DemoAppMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Components the app showcases, shown as chips on the gallery card. */
  built: string[];
}

export const DEMO_APPS: DemoAppMeta[] = [
  {
    slug: 'issue-tracker',
    name: 'Issue Tracker',
    tagline: 'GitHub-style project tracker',
    description:
      'Menu bar, filterable repo sidebar, board/list/table views, an issue detail drawer, a command palette (⌘K), and a live status bar — the surface a real dev tool ships.',
    built: ['MenuBar', 'Sidebar', 'IssueBoard', 'Drawer', 'CommandPalette', 'StatusBar'],
  },
  {
    slug: 'ai-workspace',
    name: 'AI Workspace',
    tagline: 'Multi-session agent chat',
    description:
      'Session sidebar, streaming chat with tool approvals, model selector, cost tracking, and a subagent tracker — a complete AI product surface.',
    built: [
      'ChatWindow',
      'SessionManager',
      'ToolApproval',
      'ModelSelector',
      'CostTracker',
      'SubagentTracker',
    ],
  },
  {
    slug: 'dashboard',
    name: 'Ops Dashboard',
    tagline: 'Live metrics & reporting',
    description:
      'KPI cards with trends, charts, an activity timeline, and a sortable data table behind tabbed sections — the classic analytics product, end to end.',
    built: ['MetricCard', 'WaterfallChart', 'Sparkline', 'Table', 'Timeline', 'Tabs'],
  },
  {
    slug: 'files',
    name: 'File Manager',
    tagline: 'Two-pane file browser',
    description:
      'Directory tree, list/icons/gallery views, breadcrumb navigation, preview pane, right-click context menu, and toasts — a desktop-grade file manager.',
    built: ['FileExplorer', 'PathBreadcrumb', 'FilePreview', 'ContextMenu', 'Toast'],
  },
  {
    slug: 'kanban',
    name: 'Sprint Board',
    tagline: 'Drag-and-drop planning',
    description:
      'A kanban board with card editing in a dialog, tag inputs, filter chips, and a sprint progress header — project planning as a working app.',
    built: ['KanbanBoard', 'Dialog', 'TagInput', 'FilterChip', 'ProgressBar'],
  },
];
