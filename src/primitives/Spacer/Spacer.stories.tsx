import type { Meta, StoryObj } from 'storybook-solidjs';
import { Spacer } from './Spacer';
import { Box } from '../Box';
import { Flex } from '../Flex';

const meta = {
  title: 'Layout/Spacer',
  component: Spacer,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'text' },
    axis: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoItem = (props: { children?: import('solid-js').JSX.Element }) => (
  <Box p="md" bg="accent" color="on-accent" borderRadius="sm">
    {props.children || 'Item'}
  </Box>
);

export const FlexFill: Story = {
  render: () => (
    <Flex style={{ width: '100%' }}>
      <DemoItem>Left</DemoItem>
      <Spacer />
      <DemoItem>Right</DemoItem>
    </Flex>
  ),
};

export const FixedHorizontal: Story = {
  render: () => (
    <Flex>
      <DemoItem>A</DemoItem>
      <Spacer size="xl" />
      <DemoItem>B</DemoItem>
    </Flex>
  ),
};

export const FixedVertical: Story = {
  render: () => (
    <Flex direction="column">
      <DemoItem>Top</DemoItem>
      <Spacer size="xl" axis="vertical" />
      <DemoItem>Bottom</DemoItem>
    </Flex>
  ),
};
