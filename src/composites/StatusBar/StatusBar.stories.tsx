import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { StatusDot } from '../../primitives/StatusDot';
import { StatusBar } from './StatusBar';
import type { StatusBarItem } from './StatusBar';

const meta = {
  title: 'Navigation/StatusBar',
  component: StatusBar,
  tags: ['autodocs'],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (props: { children: JSX.Element }) => (
  <Flex direction="column" justify="end" bg="primary" minH="200px">
    {props.children}
  </Flex>
);

export const Default: Story = {
  args: {
    items: [
      {
        id: 'branch',
        icon: '⎇',
        text: 'main',
        tooltip: 'Current Git branch',
        align: 'left',
        priority: 0,
        onClick: () => console.log('Branch clicked'),
      },
      {
        id: 'position',
        text: 'Ln 42, Col 18',
        tooltip: 'Cursor position',
        align: 'left',
        priority: 1,
      },
      {
        id: 'encoding',
        text: 'UTF-8',
        tooltip: 'File encoding',
        align: 'right',
        priority: 0,
        onClick: () => console.log('Encoding clicked'),
      },
      {
        id: 'language',
        text: 'TypeScript',
        tooltip: 'Language mode',
        align: 'right',
        priority: 1,
        onClick: () => console.log('Language clicked'),
      },
      {
        id: 'indent',
        text: 'Spaces: 2',
        tooltip: 'Indentation settings',
        align: 'right',
        priority: 2,
        onClick: () => console.log('Indent clicked'),
      },
    ] as StatusBarItem[],
  },
  render: (args) => (
    <Wrapper>
      <StatusBar {...args} />
    </Wrapper>
  ),
};

export const LeftOnly: Story = {
  args: {
    items: [
      {
        id: 'branch',
        icon: '⎇',
        text: 'main',
        tooltip: 'Current Git branch',
        align: 'left',
        priority: 0,
      },
      {
        id: 'status',
        icon: '✓',
        text: 'No issues',
        align: 'left',
        priority: 1,
      },
      {
        id: 'position',
        text: 'Ln 42, Col 18',
        align: 'left',
        priority: 2,
      },
    ] as StatusBarItem[],
  },
  render: (args) => (
    <Wrapper>
      <StatusBar {...args} />
    </Wrapper>
  ),
};

export const RightOnly: Story = {
  args: {
    items: [
      {
        id: 'encoding',
        text: 'UTF-8',
        tooltip: 'File encoding',
        align: 'right',
        priority: 0,
      },
      {
        id: 'language',
        text: 'TypeScript',
        tooltip: 'Language mode',
        align: 'right',
        priority: 1,
      },
      {
        id: 'indent',
        text: 'Spaces: 2',
        align: 'right',
        priority: 2,
      },
    ] as StatusBarItem[],
  },
  render: (args) => (
    <Wrapper>
      <StatusBar {...args} />
    </Wrapper>
  ),
};

export const WithCustomRender: Story = {
  args: {
    items: [
      {
        id: 'status',
        align: 'left',
        priority: 0,
        render: () => <StatusDot status="success" label="Connected" />,
      },
      {
        id: 'position',
        text: 'Ln 42, Col 18',
        align: 'left',
        priority: 1,
      },
      {
        id: 'server',
        align: 'right',
        priority: 0,
        render: () => (
          <Flex align="center" gap="xs">
            <Text color="accent">⚡</Text>
            <Text>Live Server: 3000</Text>
          </Flex>
        ),
        tooltip: 'Development server running',
      },
    ] as StatusBarItem[],
  },
  render: (args) => (
    <Wrapper>
      <StatusBar {...args} />
    </Wrapper>
  ),
};
