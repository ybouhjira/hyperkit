import type { Meta, StoryObj } from 'storybook-solidjs';
import { Wrap } from './Wrap';
import { Box } from '../Box';

const meta = {
  title: 'Layout/Wrap',
  component: Wrap,
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
} satisfies Meta<typeof Wrap>;

export default meta;
type Story = StoryObj<typeof meta>;

const Tag = (props: { children?: import('solid-js').JSX.Element }) => (
  <Box px="md" py="xs" bg="accent" color="on-accent" borderRadius="full">
    {props.children || 'Tag'}
  </Box>
);

export const Default: Story = {
  render: () => (
    <Wrap>
      <Tag>React</Tag>
      <Tag>SolidJS</Tag>
      <Tag>Vue</Tag>
      <Tag>Svelte</Tag>
      <Tag>Angular</Tag>
      <Tag>Lit</Tag>
      <Tag>Preact</Tag>
      <Tag>Qwik</Tag>
    </Wrap>
  ),
};

export const LargeSpacing: Story = {
  render: () => (
    <Wrap spacing="xl">
      <Tag>Item 1</Tag>
      <Tag>Item 2</Tag>
      <Tag>Item 3</Tag>
      <Tag>Item 4</Tag>
      <Tag>Item 5</Tag>
    </Wrap>
  ),
};

export const Centered: Story = {
  render: () => (
    <Wrap spacing="md" justify="center">
      <Tag>Centered</Tag>
      <Tag>Wrapped</Tag>
      <Tag>Items</Tag>
      <Tag>Here</Tag>
    </Wrap>
  ),
};
