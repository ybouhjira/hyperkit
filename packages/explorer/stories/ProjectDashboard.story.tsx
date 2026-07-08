import { ProjectDashboard, type MilestoneData, type IssueData } from '@ybouhjira/hyperkit';
import { defineStory, control } from '../src/api';
import { createSignal } from 'solid-js';

const mockMilestones: MilestoneData[] = [
  {
    number: 9,
    title: 'SolidKit Studio v0.1',
    description: 'Foundation for SolidKit Studio',
    openIssues: 11,
    closedIssues: 0,
    state: 'open',
  },
  {
    number: 1,
    title: 'Design System v3.0',
    description: 'Complete design system overhaul',
    openIssues: 0,
    closedIssues: 9,
    state: 'open',
  },
  {
    number: 4,
    title: 'Chat UI Feature Parity',
    description: 'Bridge claude-headless chat UI and SolidKit',
    openIssues: 0,
    closedIssues: 15,
    state: 'open',
  },
  {
    number: 5,
    title: 'Code Quality & DX',
    description: 'Code quality tools and CI pipeline',
    openIssues: 0,
    closedIssues: 9,
    state: 'open',
  },
  {
    number: 6,
    title: 'Rich Form Inputs',
    description: 'Feature-rich form input components',
    openIssues: 0,
    closedIssues: 8,
    state: 'open',
  },
  {
    number: 7,
    title: 'AI Agent Documentation',
    description: 'AI-agent-friendly docs',
    openIssues: 0,
    closedIssues: 7,
    state: 'open',
  },
  {
    number: 8,
    title: 'Faceswap Integration',
    description: 'Components for faceswap app',
    openIssues: 0,
    closedIssues: 10,
    state: 'open',
  },
];

const mockIssues: IssueData[] = [
  {
    number: 207,
    title: 'ProjectDashboard - Unified Multi-Project View',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 206,
    title: 'WorkflowLauncher - Start Work on Issue',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 205,
    title: 'CodeEditor Component - Monaco-based',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 204,
    title: 'SessionManager Component',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 203,
    title: 'RepoCard Component',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 202,
    title: 'IssueBoard Component',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 201,
    title: 'Explorer - Service Testing Mode',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 200,
    title: 'Explorer - Component Testing Mode',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 199,
    title: 'Explorer - Core Runtime & Shell',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 196,
    title: 'SolidKit Studio - Unified Platform',
    state: 'open',
    labels: [{ name: 'vision', color: 'd4c5f9' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 194,
    title: 'ComfyUI Clone',
    state: 'open',
    labels: [{ name: 'product', color: 'fbca04' }],
    milestone: 'SolidKit Studio v0.1',
    createdAt: '2026-03-08',
  },
  {
    number: 150,
    title: 'Add dark mode support',
    state: 'open',
    labels: [
      { name: 'enhancement', color: 'a2eeef' },
      { name: 'design', color: 'c5def5' },
    ],
    milestone: 'Design System v3.0',
    createdAt: '2026-02-15',
  },
  {
    number: 148,
    title: 'Refactor theme tokens',
    state: 'open',
    labels: [{ name: 'refactor', color: 'fbca04' }],
    milestone: 'Design System v3.0',
    createdAt: '2026-02-10',
  },
  {
    number: 120,
    title: 'Fix MessageBubble alignment',
    state: 'closed',
    labels: [{ name: 'bug', color: 'd73a4a' }],
    milestone: 'Chat UI Feature Parity',
    createdAt: '2026-01-20',
  },
  {
    number: 95,
    title: 'Add ESLint config',
    state: 'closed',
    labels: [{ name: 'tooling', color: 'e99695' }],
    milestone: 'Code Quality & DX',
    createdAt: '2026-01-05',
  },
];

export default defineStory({
  title: 'Composites/ProjectDashboard',
  component: ProjectDashboard,
  controls: {
    filter: control.select(['open', 'closed', 'all'], 'open', 'Issue Filter'),
    projectName: control.text('SolidKit', 'Project Name'),
  },
  render: (controls) => {
    const [filter, setFilter] = createSignal<'open' | 'closed' | 'all'>(controls.filter);
    const [selectedIssue, setSelectedIssue] = createSignal<IssueData | null>(null);

    return (
      <div style={{ height: '100vh', display: 'flex', 'flex-direction': 'column' }}>
        {selectedIssue() && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--sk-bg-secondary)',
              border: '1px solid var(--sk-border)',
              'font-size': '14px',
            }}
          >
            <strong>Selected:</strong> #{selectedIssue()!.number} - {selectedIssue()!.title}
            <button
              onClick={() => setSelectedIssue(null)}
              style={{
                'margin-left': '12px',
                padding: '4px 8px',
                cursor: 'pointer',
                background: 'var(--sk-bg-primary)',
                border: '1px solid var(--sk-border)',
                'border-radius': '4px',
              }}
            >
              Clear
            </button>
          </div>
        )}
        <div style={{ flex: '1', 'overflow-y': 'auto' }}>
          <ProjectDashboard
            projectName={controls.projectName}
            milestones={mockMilestones}
            issues={mockIssues}
            filter={filter()}
            onFilterChange={(newFilter) => {
              console.log('Filter changed:', newFilter);
              setFilter(newFilter);
            }}
            onIssueClick={(issue) => {
              console.log('Issue clicked:', issue);
              setSelectedIssue(issue);
            }}
            onRefresh={() => console.log('Refresh clicked')}
          />
        </div>
      </div>
    );
  },
});
