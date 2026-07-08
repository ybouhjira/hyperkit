import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { DashboardContainer } from './DashboardContainer';
import type { DashboardCardConfig, DashboardCardProps } from './types';

// ── Sample card components ─────────────────────────────────────────────────

const StatCard = (props: DashboardCardProps) => (
  <Flex direction="column" justify="center" h="100%" gap="xs">
    <Text size="xl" weight="bold" color="primary">
      {(props.config as DashboardCardConfig & { value?: string }).value ?? '—'}
    </Text>
    <Text size="sm" color="secondary">
      {(props.config as DashboardCardConfig & { subtitle?: string }).subtitle ?? ''}
    </Text>
  </Flex>
);

const ChartCard = (_props: DashboardCardProps) => (
  <Flex h="100%" align="center" justify="center" bg="tertiary" borderRadius="sm">
    <Text size="sm" color="muted">
      📊 Chart placeholder
    </Text>
  </Flex>
);

const ActivityRow = (props: { children: string; divider?: boolean }) => (
  <Box
    py="xs"
    style={props.divider === true ? { 'border-bottom': '1px solid var(--sk-border)' } : undefined}
  >
    <Text size="sm" color="secondary">
      {props.children}
    </Text>
  </Box>
);

const ActivityCard = (_props: DashboardCardProps) => (
  <div>
    <ActivityRow divider>User signed up · 2m ago</ActivityRow>
    <ActivityRow divider>New order #4821 · 5m ago</ActivityRow>
    <ActivityRow>Deploy succeeded · 12m ago</ActivityRow>
  </div>
);

// ── Card configs ───────────────────────────────────────────────────────────

const revenueCard: DashboardCardConfig & { value: string; subtitle: string } = {
  id: 'revenue',
  title: 'Revenue',
  icon: '💰',
  component: StatCard,
  defaultSize: { cols: 3, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Metrics',
  value: '$125,430',
  subtitle: '+12% from last month',
};

const usersCard: DashboardCardConfig & { value: string; subtitle: string } = {
  id: 'users',
  title: 'Active Users',
  icon: '👥',
  component: StatCard,
  defaultSize: { cols: 3, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Metrics',
  value: '2,543',
  subtitle: '+5% from last week',
};

const ordersCard: DashboardCardConfig & { value: string; subtitle: string } = {
  id: 'orders',
  title: 'Orders',
  icon: '📦',
  component: StatCard,
  defaultSize: { cols: 3, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Metrics',
  value: '842',
  subtitle: 'Today',
};

const conversionCard: DashboardCardConfig & { value: string; subtitle: string } = {
  id: 'conversion',
  title: 'Conversion',
  icon: '📈',
  component: StatCard,
  defaultSize: { cols: 3, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Metrics',
  value: '3.2%',
  subtitle: 'Avg this quarter',
};

const salesChartCard: DashboardCardConfig = {
  id: 'sales-chart',
  title: 'Sales Chart',
  icon: '📊',
  component: ChartCard,
  defaultSize: { cols: 6, rows: 3 },
  minSize: { cols: 3, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Charts',
};

const activityCard: DashboardCardConfig = {
  id: 'activity',
  title: 'Recent Activity',
  icon: '⚡',
  component: ActivityCard,
  defaultSize: { cols: 6, rows: 3 },
  minSize: { cols: 4, rows: 2 },
  resizable: true,
  removable: true,
  category: 'Activity',
};

const allCards: DashboardCardConfig[] = [
  revenueCard,
  usersCard,
  ordersCard,
  conversionCard,
  salesChartCard,
  activityCard,
];

// ── Stories ────────────────────────────────────────────────────────────────

const meta: Meta<typeof DashboardContainer> = {
  title: 'Composites/DashboardContainer',
  component: DashboardContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof DashboardContainer>;

export const Default: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer cards={allCards} columns={12} rowHeight="md" />
    </Box>
  ),
};

export const Editable: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer cards={allCards} columns={12} rowHeight="md" editable />
    </Box>
  ),
};

export const SixColumns: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer
        cards={[revenueCard, usersCard, ordersCard, conversionCard]}
        columns={6}
        rowHeight="lg"
        editable
      />
    </Box>
  ),
};

export const SmallGap: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer cards={allCards} columns={12} gap="sm" />
    </Box>
  ),
};

export const LargeGap: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer cards={allCards} columns={12} gap="lg" />
    </Box>
  ),
};

export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <Box p="md">
      <DashboardContainer cards={allCards} columns={12} editable />
    </Box>
  ),
};

export const WithCategories: Story = {
  render: () => (
    <Box p="lg">
      <DashboardContainer
        cards={[revenueCard, usersCard, salesChartCard, activityCard]}
        columns={12}
        rowHeight="md"
        editable
      />
    </Box>
  ),
};

export const WithPersistence: Story = {
  render: () => (
    <Box p="lg">
      <Text as="p" size="sm" color="secondary" mb="md">
        Layout is saved to localStorage. Rearrange cards, refresh, and they stay put.
      </Text>
      <DashboardContainer
        cards={allCards}
        columns={12}
        storageKey="storybook-dashboard-demo"
        editable
      />
    </Box>
  ),
};
