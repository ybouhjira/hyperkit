import type { Meta, StoryObj } from 'storybook-solidjs';
import { Flex } from './Flex';
import { Box } from '../Box';

const meta = {
  title: 'Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    gap: { control: 'text' },
    wrap: { control: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
    inline: { control: 'boolean' },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = (props: { children?: import('solid-js').JSX.Element; flex?: string | number }) => (
  <Box p="md" bg="accent" color="on-accent" borderRadius="sm" flex={props.flex}>
    {props.children || 'Item'}
  </Box>
);

export const Default: Story = {
  render: () => (
    <Flex gap="md">
      <DemoBox>Item 1</DemoBox>
      <DemoBox>Item 2</DemoBox>
      <DemoBox>Item 3</DemoBox>
    </Flex>
  ),
};

export const Column: Story = {
  render: () => (
    <Flex direction="column" gap="md">
      <DemoBox>Item 1</DemoBox>
      <DemoBox>Item 2</DemoBox>
      <DemoBox>Item 3</DemoBox>
    </Flex>
  ),
};

export const CenterAlign: Story = {
  render: () => (
    <Flex align="center" justify="center" h={200} bg="secondary" borderRadius="md">
      <DemoBox>Centered Content</DemoBox>
    </Flex>
  ),
};

export const SpaceBetween: Story = {
  render: () => (
    <Flex justify="between" p="md" bg="secondary" borderRadius="md">
      <DemoBox>Left</DemoBox>
      <DemoBox>Right</DemoBox>
    </Flex>
  ),
};

export const Wrap: Story = {
  render: () => (
    <Flex wrap="wrap" gap="md" maxW={400}>
      <DemoBox>Item 1</DemoBox>
      <DemoBox>Item 2</DemoBox>
      <DemoBox>Item 3</DemoBox>
      <DemoBox>Item 4</DemoBox>
      <DemoBox>Item 5</DemoBox>
      <DemoBox>Item 6</DemoBox>
    </Flex>
  ),
};

export const FlexGrow: Story = {
  render: () => (
    <Flex gap="md">
      <DemoBox>Fixed</DemoBox>
      <DemoBox flex={1}>Grows to fill space</DemoBox>
      <DemoBox>Fixed</DemoBox>
    </Flex>
  ),
};

export const NestedFlex: Story = {
  render: () => (
    <Flex direction="column" gap="md" p="md" bg="secondary" borderRadius="md">
      <Flex gap="md">
        <DemoBox flex={1}>Header Left</DemoBox>
        <DemoBox>Header Right</DemoBox>
      </Flex>
      <Flex gap="md">
        <DemoBox w={200}>Sidebar</DemoBox>
        <DemoBox flex={1}>Main Content</DemoBox>
      </Flex>
    </Flex>
  ),
};
