import type { Meta, StoryObj } from 'storybook-solidjs';
import { ColorDot } from './ColorDot';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta: Meta<typeof ColorDot> = {
  title: 'Data Display/ColorDot',
  component: ColorDot,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorDot>;

export const Red: Story = {
  args: { color: '#ef4444' },
};

export const Blue: Story = {
  args: { color: '#3b82f6' },
};

export const Green: Story = {
  args: { color: '#22c55e' },
};

export const Yellow: Story = {
  args: { color: '#eab308' },
};

export const Purple: Story = {
  args: { color: '#a855f7' },
};

export const Small: Story = {
  args: { color: '#3b82f6', size: 'sm' },
};

export const Medium: Story = {
  args: { color: '#3b82f6', size: 'md' },
};

export const Large: Story = {
  args: { color: '#3b82f6', size: 'lg' },
};

export const ProjectColors: Story = {
  render: () => (
    <Flex gap="md" align="center">
      <Flex align="center" gap="sm">
        <ColorDot color="#ef4444" />
        <Text>Work</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#3b82f6" />
        <Text>Personal</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#22c55e" />
        <Text>Health</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#eab308" />
        <Text>Finance</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#a855f7" />
        <Text>Learning</Text>
      </Flex>
    </Flex>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Flex gap="md" align="center">
      <Flex align="center" gap="sm">
        <ColorDot color="#3b82f6" size="sm" />
        <Text>Small</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#3b82f6" size="md" />
        <Text>Medium</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <ColorDot color="#3b82f6" size="lg" />
        <Text>Large</Text>
      </Flex>
    </Flex>
  ),
};
