import { createMemo, For, Show, type JSX } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Card } from '../../primitives/Card';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { Flex } from '../../primitives/Flex';
import { Stack } from '../../primitives/Stack';
import { Grid } from '../../primitives/Grid';
import { ProgressBar } from '../../primitives/ProgressBar';
import './ProjectDashboard.css';

export interface LabelData {
  readonly name: string;
  readonly color: string;
}

export interface IssueData {
  readonly number: number;
  readonly title: string;
  readonly state: 'open' | 'closed';
  readonly labels: readonly LabelData[];
  readonly milestone?: string;
  readonly createdAt: string;
}

export interface MilestoneData {
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly openIssues: number;
  readonly closedIssues: number;
  readonly state: 'open' | 'closed';
}

export interface ProjectDashboardProps {
  readonly projectName: string;
  readonly milestones: readonly MilestoneData[];
  readonly issues: readonly IssueData[];
  readonly onRefresh?: () => void;
  readonly onIssueClick?: (issue: IssueData) => void;
  readonly onMilestoneClick?: (milestone: MilestoneData) => void;
  readonly filter?: 'open' | 'closed' | 'all';
  readonly onFilterChange?: (filter: 'open' | 'closed' | 'all') => void;
  readonly style?: JSX.CSSProperties;
  readonly class?: string;
}

const getMilestoneProgress = (milestone: MilestoneData): number => {
  const total = milestone.openIssues + milestone.closedIssues;
  return total > 0 ? (milestone.closedIssues / total) * 100 : 0;
};

const getProgressColor = (progress: number): string => {
  if (progress > 80) return 'var(--sk-project-dashboard-progress-high, #22c55e)';
  if (progress >= 40) return 'var(--sk-project-dashboard-progress-medium, #eab308)';
  return 'var(--sk-project-dashboard-progress-low, #ef4444)';
};

const labelVariantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  feature: 'info',
  enhancement: 'success',
  bug: 'danger',
  'help wanted': 'warning',
  documentation: 'default',
  refactor: 'warning',
  fix: 'danger',
  test: 'success',
};

const getLabelVariant = (name: string): 'default' | 'success' | 'warning' | 'danger' | 'info' =>
  labelVariantMap[name.toLowerCase()] ?? 'default';

export function ProjectDashboard(props: ProjectDashboardProps): JSX.Element {
  const activeFilter = () => props.filter || 'open';

  const filteredIssues = createMemo(() => {
    if (activeFilter() === 'all') return props.issues;
    return props.issues.filter((issue) => issue.state === activeFilter());
  });

  const issuesByMilestone = createMemo(() => {
    const groups: { [key: string]: IssueData[] } = {};

    filteredIssues().forEach((issue) => {
      const key = issue.milestone ?? 'No Milestone';
      if (!groups[key]) {
        groups[key] = [];
      }
      const arr = groups[key];
      if (arr !== undefined) {
        arr.push(issue);
      }
    });

    return groups;
  });

  const handleFilterChange = (filter: 'open' | 'closed' | 'all') => {
    if (props.onFilterChange) {
      props.onFilterChange(filter);
    }
  };

  return (
    <Stack gap="lg" class={props.class} style={props.style}>
      {/* Header */}
      <Flex align="center" justify="between" wrap="wrap" gap="md">
        <Text as="h1" size="2xl" weight="bold" color="primary">
          Project Dashboard: {props.projectName}
        </Text>
        <Show when={props.onRefresh !== undefined}>
          <Button variant="outline" size="md" onClick={() => props.onRefresh?.()}>
            Refresh
          </Button>
        </Show>
      </Flex>

      {/* Milestones Grid */}
      <Show when={props.milestones.length > 0}>
        <Box as="section">
          <Text as="h2" size="xl" weight="semibold" color="primary" mb="md">
            Milestones
          </Text>
          <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="md">
            <For each={props.milestones}>
              {(milestone) => {
                const progress = getMilestoneProgress(milestone);
                return (
                  <Card
                    variant="outlined"
                    padding="md"
                    hoverable={props.onMilestoneClick !== undefined}
                    onClick={() => props.onMilestoneClick?.(milestone)}
                    style={props.onMilestoneClick !== undefined ? { cursor: 'pointer' } : undefined}
                  >
                    <Stack gap="sm">
                      <Text as="h3" size="lg" weight="semibold" color="primary">
                        {milestone.title}
                      </Text>
                      <Text size="sm" color="secondary" truncate>
                        {milestone.description}
                      </Text>
                      <ProgressBar value={progress} size="sm" color={getProgressColor(progress)} />
                      <Flex align="center" justify="between" gap="sm">
                        <Text size="xs" color="secondary">
                          {Math.round(progress)}% complete
                        </Text>
                        <Text size="xs" color="secondary">
                          {milestone.openIssues} open / {milestone.closedIssues} closed
                        </Text>
                      </Flex>
                    </Stack>
                  </Card>
                );
              }}
            </For>
          </Grid>
        </Box>
      </Show>

      {/* Issues Section */}
      <Box as="section">
        <Text as="h2" size="xl" weight="semibold" color="primary" mb="md">
          Issues
        </Text>

        {/* Filter Bar */}
        <Flex align="center" gap="sm" pb="md" borderBottom>
          <Button
            variant={activeFilter() === 'open' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('open')}
          >
            Open
          </Button>
          <Button
            variant={activeFilter() === 'closed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('closed')}
          >
            Closed
          </Button>
          <Button
            variant={activeFilter() === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
          >
            All
          </Button>
        </Flex>

        {/* Issues by Milestone */}
        <Stack gap="lg" mt="lg">
          <For each={Object.entries(issuesByMilestone())}>
            {([milestoneName, issues]) => (
              <Stack gap="sm">
                <Text
                  as="h3"
                  size="sm"
                  weight="semibold"
                  color="secondary"
                  letterSpacing="0.05em"
                  style={{ 'text-transform': 'uppercase' }}
                >
                  {milestoneName}
                </Text>
                <Stack gap="sm">
                  <For each={issues}>
                    {(issue) => (
                      <Card
                        variant="outlined"
                        padding="md"
                        hoverable
                        onClick={() => props.onIssueClick?.(issue)}
                      >
                        <Flex align="center" gap="md">
                          <Badge type="dot" variant={issue.state === 'open' ? 'success' : 'info'} />
                          <Text size="sm" color="secondary" whiteSpace="nowrap">
                            #{issue.number}
                          </Text>
                          <Box style={{ flex: '1' }}>
                            <Text size="sm" weight="medium" color="primary">
                              {issue.title}
                            </Text>
                          </Box>
                          <Flex gap="xs" wrap="wrap">
                            <For each={issue.labels}>
                              {(label) => (
                                <Badge variant={getLabelVariant(label.name)}>{label.name}</Badge>
                              )}
                            </For>
                          </Flex>
                        </Flex>
                      </Card>
                    )}
                  </For>
                </Stack>
              </Stack>
            )}
          </For>
        </Stack>
      </Box>
    </Stack>
  );
}
