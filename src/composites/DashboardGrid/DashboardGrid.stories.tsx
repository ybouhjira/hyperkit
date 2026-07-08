import type { Meta, StoryObj } from 'storybook-solidjs';
import { Card as SKCard } from '../../primitives/Card';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { DashboardGrid } from './DashboardGrid';

const meta: Meta<typeof DashboardGrid> = {
  title: 'Layout/DashboardGrid',
  component: DashboardGrid,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DashboardGrid>;

// Sample card component for demo
const Card = (props: { title: string; description: string }) => (
  <SKCard variant="outlined" padding="md" style={{ 'min-height': '120px' }}>
    <Stack gap="sm">
      <Text as="h3" size="lg" weight="semibold" color="primary">
        {props.title}
      </Text>
      <Text size="sm" color="secondary">
        {props.description}
      </Text>
    </Stack>
  </SKCard>
);

export const ThreeItems: Story = {
  render: () => (
    <DashboardGrid>
      <Card title="Revenue" description="Total revenue this month" />
      <Card title="Users" description="Active users this week" />
      <Card title="Orders" description="Completed orders today" />
    </DashboardGrid>
  ),
};

export const SixItems: Story = {
  render: () => (
    <DashboardGrid>
      <Card title="Revenue" description="$125,430 this month" />
      <Card title="Users" description="2,543 active users" />
      <Card title="Orders" description="842 orders today" />
      <Card title="Conversion" description="3.2% conversion rate" />
      <Card title="Traffic" description="12.5K visitors today" />
      <Card title="Bounce Rate" description="42% bounce rate" />
    </DashboardGrid>
  ),
};

export const NineItems: Story = {
  render: () => (
    <DashboardGrid>
      <Card title="Revenue" description="$125,430" />
      <Card title="Users" description="2,543" />
      <Card title="Orders" description="842" />
      <Card title="Conversion" description="3.2%" />
      <Card title="Traffic" description="12.5K" />
      <Card title="Bounce Rate" description="42%" />
      <Card title="Avg Order" description="$148.50" />
      <Card title="Sessions" description="18.3K" />
      <Card title="Page Views" description="52.7K" />
    </DashboardGrid>
  ),
};

export const SmallGap: Story = {
  render: () => (
    <DashboardGrid gap="sm">
      <Card title="Revenue" description="Total revenue" />
      <Card title="Users" description="Active users" />
      <Card title="Orders" description="Orders today" />
      <Card title="Traffic" description="Visitors" />
    </DashboardGrid>
  ),
};

export const LargeGap: Story = {
  render: () => (
    <DashboardGrid gap="lg">
      <Card title="Revenue" description="Total revenue" />
      <Card title="Users" description="Active users" />
      <Card title="Orders" description="Orders today" />
      <Card title="Traffic" description="Visitors" />
    </DashboardGrid>
  ),
};

export const ExtraLargeGap: Story = {
  render: () => (
    <DashboardGrid gap="xl">
      <Card title="Revenue" description="Total revenue" />
      <Card title="Users" description="Active users" />
      <Card title="Orders" description="Orders today" />
    </DashboardGrid>
  ),
};

export const CustomMinWidth: Story = {
  render: () => (
    <DashboardGrid minItemWidth="250px">
      <Card title="Revenue" description="$125,430" />
      <Card title="Users" description="2,543" />
      <Card title="Orders" description="842" />
      <Card title="Conversion" description="3.2%" />
      <Card title="Traffic" description="12.5K" />
      <Card title="Bounce Rate" description="42%" />
    </DashboardGrid>
  ),
};

export const MaxTwoColumns: Story = {
  render: () => (
    <DashboardGrid maxColumns={2}>
      <Card title="Revenue" description="$125,430 this month" />
      <Card title="Users" description="2,543 active users" />
      <Card title="Orders" description="842 orders today" />
      <Card title="Conversion" description="3.2% conversion rate" />
      <Card title="Traffic" description="12.5K visitors today" />
      <Card title="Bounce Rate" description="42% bounce rate" />
    </DashboardGrid>
  ),
};

export const MaxThreeColumns: Story = {
  render: () => (
    <DashboardGrid maxColumns={3}>
      <Card title="Revenue" description="$125,430" />
      <Card title="Users" description="2,543" />
      <Card title="Orders" description="842" />
      <Card title="Conversion" description="3.2%" />
      <Card title="Traffic" description="12.5K" />
      <Card title="Bounce Rate" description="42%" />
      <Card title="Avg Order" description="$148.50" />
      <Card title="Sessions" description="18.3K" />
      <Card title="Page Views" description="52.7K" />
    </DashboardGrid>
  ),
};

export const VariedContent: Story = {
  render: () => (
    <DashboardGrid>
      <Card title="Quick Stat" description="Short" />
      <Card
        title="Medium Content"
        description="This card has a bit more content to demonstrate how the grid handles different heights."
      />
      <Card title="Another Stat" description="Compact" />
      <Card
        title="Long Description"
        description="This card contains a longer description that might wrap to multiple lines depending on the viewport width and grid column size."
      />
      <Card title="Simple" description="Data" />
      <Card title="Compact" description="Info" />
    </DashboardGrid>
  ),
};
