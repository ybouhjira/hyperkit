import type { Meta, StoryObj } from 'storybook-solidjs';
import { Separator } from './Separator';
import { Stack } from '../Stack';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
      defaultValue: { summary: 'horizontal' },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (props) => (
    <Stack gap="md">
      <Text as="p">Content above separator</Text>
      <Separator {...props} />
      <Text as="p">Content below separator</Text>
    </Stack>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (props) => (
    <Flex align="center" h={100}>
      <Text>Left content</Text>
      <Separator {...props} />
      <Text>Right content</Text>
    </Flex>
  ),
};

export const InStack: Story = {
  render: () => (
    <Stack gap="lg">
      <Text>Section 1</Text>
      <Separator />
      <Text>Section 2</Text>
      <Separator />
      <Text>Section 3</Text>
    </Stack>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <Stack gap="md">
      <Text as="p">Default separator</Text>
      <Separator />
      <Text as="p">Custom color separator</Text>
      <Separator style={{ '--sk-separator-color': 'var(--sk-accent)' }} />
      <Text as="p">Thicker separator</Text>
      <Separator style={{ '--sk-separator-size': '3px' }} />
    </Stack>
  ),
};
