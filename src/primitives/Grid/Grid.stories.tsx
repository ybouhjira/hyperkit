import type { Meta, StoryObj } from 'storybook-solidjs';
import type { JSX } from 'solid-js';
import { Grid } from './Grid';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Token-styled demo cell used to visualize grid placement. */
function DemoCell(props: { bg: string; children: JSX.Element; span?: number }): JSX.Element {
  return (
    <Box
      p="md"
      color="on-accent"
      borderRadius="md"
      style={{
        background: props.bg,
        'text-align': 'center',
        ...(props.span ? { 'grid-column': `span ${props.span}` } : {}),
      }}
    >
      {props.children}
    </Box>
  );
}

export const Default: Story = {
  render: () => (
    <Grid columns={3}>
      <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
      <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
      <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
      <DemoCell bg="var(--sk-error)">Item 4</DemoCell>
      <DemoCell bg="var(--sk-warning)">Item 5</DemoCell>
      <DemoCell bg="var(--sk-info)">Item 6</DemoCell>
    </Grid>
  ),
};

export const CustomColumns: Story = {
  render: () => (
    <Grid columns="1fr 2fr 1fr">
      <DemoCell bg="var(--sk-accent)">1fr</DemoCell>
      <DemoCell bg="var(--sk-info)">2fr</DemoCell>
      <DemoCell bg="var(--sk-success)">1fr</DemoCell>
    </Grid>
  ),
};

export const WithGap: Story = {
  render: () => (
    <Stack gap="xl">
      <Stack gap="sm">
        <Text weight="semibold">Gap: sm</Text>
        <Grid columns={3} gap="sm">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="sm">
        <Text weight="semibold">Gap: md</Text>
        <Grid columns={3} gap="md">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="sm">
        <Text weight="semibold">Gap: lg</Text>
        <Grid columns={3} gap="lg">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="sm">
        <Text weight="semibold">Gap: xl</Text>
        <Grid columns={3} gap="xl">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>
    </Stack>
  ),
};

export const AutoFlow: Story = {
  render: () => (
    <Grid columns={3} gap="md" autoFlow="dense">
      <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
      <DemoCell bg="var(--sk-info)" span={2}>
        Item 2 (spans 2 columns)
      </DemoCell>
      <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
      <DemoCell bg="var(--sk-error)">Item 4</DemoCell>
      <DemoCell bg="var(--sk-warning)">Item 5</DemoCell>
    </Grid>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="2xl">
      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Default (3 columns)
        </Text>
        <Grid columns={3}>
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Custom Columns (1fr 2fr 1fr)
        </Text>
        <Grid columns="1fr 2fr 1fr">
          <DemoCell bg="var(--sk-accent)">1fr</DemoCell>
          <DemoCell bg="var(--sk-info)">2fr</DemoCell>
          <DemoCell bg="var(--sk-success)">1fr</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          With Gap (lg)
        </Text>
        <Grid columns={3} gap="lg">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)">Item 2</DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Auto Flow Dense
        </Text>
        <Grid columns={3} gap="md" autoFlow="dense">
          <DemoCell bg="var(--sk-accent)">Item 1</DemoCell>
          <DemoCell bg="var(--sk-info)" span={2}>
            Item 2 (spans 2)
          </DemoCell>
          <DemoCell bg="var(--sk-success)">Item 3</DemoCell>
        </Grid>
      </Stack>
    </Stack>
  ),
};
