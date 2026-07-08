import type { Meta, StoryObj } from 'storybook-solidjs';
import { MasonryGrid } from './MasonryGrid';
import { Box } from '../Box';
import { For } from 'solid-js';

const meta: Meta<typeof MasonryGrid> = {
  title: 'Layout/MasonryGrid',
  component: MasonryGrid,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'number' },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof MasonryGrid>;

const SampleCard = (props: { height: number; index: number }) => (
  <Box
    h={props.height}
    bg="secondary"
    border
    borderRadius="md"
    p="sm"
    color="secondary"
    style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}
  >
    Card {props.index + 1}
  </Box>
);

const heights = [150, 200, 120, 250, 180, 220, 160, 190, 140, 210, 170, 230];

export const Default: Story = {
  render: () => (
    <MasonryGrid columns={3} gap="md">
      <For each={heights}>{(h, i) => <SampleCard height={h} index={i()} />}</For>
    </MasonryGrid>
  ),
};

export const TwoColumns: Story = {
  render: () => (
    <MasonryGrid columns={2} gap="md">
      <For each={heights}>{(h, i) => <SampleCard height={h} index={i()} />}</For>
    </MasonryGrid>
  ),
};

export const Responsive: Story = {
  render: () => (
    <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap="md">
      <For each={heights}>{(h, i) => <SampleCard height={h} index={i()} />}</For>
    </MasonryGrid>
  ),
};

export const SmallGap: Story = {
  render: () => (
    <MasonryGrid columns={3} gap="sm">
      <For each={heights.slice(0, 6)}>{(h, i) => <SampleCard height={h} index={i()} />}</For>
    </MasonryGrid>
  ),
};

export const LargeGap: Story = {
  render: () => (
    <MasonryGrid columns={3} gap="lg">
      <For each={heights.slice(0, 6)}>{(h, i) => <SampleCard height={h} index={i()} />}</For>
    </MasonryGrid>
  ),
};
