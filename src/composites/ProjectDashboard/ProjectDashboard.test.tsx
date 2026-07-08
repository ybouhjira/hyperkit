import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ProjectDashboard, type MilestoneData, type IssueData } from './ProjectDashboard';

const mockMilestones: MilestoneData[] = [
  {
    number: 1,
    title: 'v1.0',
    description: 'First release',
    openIssues: 3,
    closedIssues: 7,
    state: 'open',
  },
  {
    number: 2,
    title: 'v2.0',
    description: 'Second release',
    openIssues: 0,
    closedIssues: 5,
    state: 'closed',
  },
  {
    number: 3,
    title: 'v3.0',
    description: 'Future release',
    openIssues: 8,
    closedIssues: 2,
    state: 'open',
  },
];

const mockIssues: IssueData[] = [
  {
    number: 1,
    title: 'Fix bug in theme system',
    state: 'open',
    labels: [{ name: 'bug', color: 'd73a4a' }],
    milestone: 'v1.0',
    createdAt: '2026-03-08T10:00:00Z',
  },
  {
    number: 2,
    title: 'Add feature X',
    state: 'closed',
    labels: [
      { name: 'feature', color: 'a2eeef' },
      { name: 'enhancement', color: '84b6eb' },
    ],
    milestone: 'v1.0',
    createdAt: '2026-03-07T09:00:00Z',
  },
  {
    number: 3,
    title: 'Update documentation',
    state: 'open',
    labels: [{ name: 'docs', color: '0075ca' }],
    milestone: 'v2.0',
    createdAt: '2026-03-06T08:00:00Z',
  },
  {
    number: 4,
    title: 'Refactor component',
    state: 'closed',
    labels: [],
    milestone: 'v2.0',
    createdAt: '2026-03-05T07:00:00Z',
  },
  {
    number: 5,
    title: 'New feature Y',
    state: 'open',
    labels: [{ name: 'feature', color: 'a2eeef' }],
    createdAt: '2026-03-04T06:00:00Z',
  },
];

describe('ProjectDashboard', () => {
  it('renders project name', () => {
    render(() => (
      <ProjectDashboard projectName="SolidKit" milestones={mockMilestones} issues={mockIssues} />
    ));

    expect(screen.getByText(/Project Dashboard: SolidKit/)).toBeInTheDocument();
  });

  it('renders milestone cards', () => {
    render(() => (
      <ProjectDashboard projectName="SolidKit" milestones={mockMilestones} issues={mockIssues} />
    ));

    // Use getAllByText because milestone names appear in both the milestone card and issue groups
    expect(screen.getAllByText('v1.0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('v2.0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('v3.0').length).toBeGreaterThan(0);
    expect(screen.getByText('First release')).toBeInTheDocument();
  });

  it('calculates progress correctly', () => {
    render(() => (
      <ProjectDashboard projectName="SolidKit" milestones={mockMilestones} issues={mockIssues} />
    ));

    // v1.0: 7 closed / 10 total = 70%
    expect(screen.getByText(/3 open \/ 7 closed/)).toBeInTheDocument();

    // v2.0: 5 closed / 5 total = 100%
    expect(screen.getByText(/0 open \/ 5 closed/)).toBeInTheDocument();

    // v3.0: 2 closed / 10 total = 20%
    expect(screen.getByText(/8 open \/ 2 closed/)).toBeInTheDocument();
  });

  it('renders issue list', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
      />
    ));

    expect(screen.getByText('Fix bug in theme system')).toBeInTheDocument();
    expect(screen.getByText('Add feature X')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.getByText('Refactor component')).toBeInTheDocument();
    expect(screen.getByText('New feature Y')).toBeInTheDocument();
  });

  it('filters issues by state - open', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="open"
      />
    ));

    expect(screen.getByText('Fix bug in theme system')).toBeInTheDocument();
    expect(screen.queryByText('Add feature X')).not.toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.queryByText('Refactor component')).not.toBeInTheDocument();
    expect(screen.getByText('New feature Y')).toBeInTheDocument();
  });

  it('filters issues by state - closed', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="closed"
      />
    ));

    expect(screen.queryByText('Fix bug in theme system')).not.toBeInTheDocument();
    expect(screen.getByText('Add feature X')).toBeInTheDocument();
    expect(screen.queryByText('Update documentation')).not.toBeInTheDocument();
    expect(screen.getByText('Refactor component')).toBeInTheDocument();
    expect(screen.queryByText('New feature Y')).not.toBeInTheDocument();
  });

  it('filters issues by state - all', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
      />
    ));

    expect(screen.getByText('Fix bug in theme system')).toBeInTheDocument();
    expect(screen.getByText('Add feature X')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.getByText('Refactor component')).toBeInTheDocument();
    expect(screen.getByText('New feature Y')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button clicked', () => {
    const onRefresh = vi.fn();
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        onRefresh={onRefresh}
      />
    ));

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onIssueClick when issue card clicked', () => {
    const onIssueClick = vi.fn();
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        onIssueClick={onIssueClick}
      />
    ));

    const issueElement = screen.getByText('Fix bug in theme system').closest('div');
    fireEvent.click(issueElement!);

    expect(onIssueClick).toHaveBeenCalledWith(mockIssues[0]);
  });

  it('calls onFilterChange when filter buttons clicked', () => {
    const onFilterChange = vi.fn();
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
        onFilterChange={onFilterChange}
      />
    ));

    const openButton = screen.getByRole('button', { name: /open/i });
    fireEvent.click(openButton);

    expect(onFilterChange).toHaveBeenCalledWith('open');

    const closedButton = screen.getByRole('button', { name: /closed/i });
    fireEvent.click(closedButton);

    expect(onFilterChange).toHaveBeenCalledWith('closed');
  });

  it('shows empty state when no milestones provided', () => {
    render(() => <ProjectDashboard projectName="SolidKit" milestones={[]} issues={mockIssues} />);

    // When there are no milestones, the Milestones section is not rendered
    expect(screen.queryByText('Milestones')).not.toBeInTheDocument();
    // But Issues section should still be visible
    expect(screen.getByText('Issues')).toBeInTheDocument();
  });

  it('renders labels as badges with correct variants', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
      />
    ));

    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getAllByText('feature').length).toBeGreaterThan(0);
    expect(screen.getByText('enhancement')).toBeInTheDocument();
    expect(screen.getByText('docs')).toBeInTheDocument();

    // Check that badge elements use variant classes
    const bugBadge = screen.getByText('bug');
    expect(bugBadge.className).toContain('sk-badge--danger');
  });

  it('groups issues by milestone', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
      />
    ));

    // Milestone group headings should appear (as h3 elements)
    // Use getAllByText because milestone names appear in both cards and groups
    const v1Elements = screen.getAllByText('v1.0');
    expect(v1Elements.length).toBeGreaterThan(0);

    const v2Elements = screen.getAllByText('v2.0');
    expect(v2Elements.length).toBeGreaterThan(0);

    // Check that issues appear under their milestones
    expect(screen.getByText('Fix bug in theme system')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        class="custom-dashboard"
      />
    ));

    const dashboard = container.querySelector('.custom-dashboard');
    expect(dashboard).toBeInTheDocument();
  });

  it('accepts custom style', () => {
    const { container } = render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        style={{ padding: '20px', 'background-color': 'lightblue' }}
      />
    ));

    const dashboard = container.querySelector('[style*="padding"]');
    expect(dashboard).toBeInTheDocument();
  });

  it('handles issues without milestones', () => {
    render(() => (
      <ProjectDashboard projectName="SolidKit" milestones={mockMilestones} issues={mockIssues} />
    ));

    // Issue #5 has no milestone - it should appear under "No Milestone" group
    expect(screen.getByText('New feature Y')).toBeInTheDocument();
    // Check for the group heading (with text-transform: uppercase it becomes "NO MILESTONE")
    const noMilestoneHeading = screen.getByText((content, element) => {
      return element?.tagName === 'H3' && content === 'No Milestone';
    });
    expect(noMilestoneHeading).toBeInTheDocument();
  });

  it('shows issue numbers', () => {
    render(() => (
      <ProjectDashboard
        projectName="SolidKit"
        milestones={mockMilestones}
        issues={mockIssues}
        filter="all"
      />
    ));

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('handles empty issues array', () => {
    render(() => (
      <ProjectDashboard projectName="SolidKit" milestones={mockMilestones} issues={[]} />
    ));

    expect(screen.queryByText('Fix bug in theme system')).not.toBeInTheDocument();
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });
});
