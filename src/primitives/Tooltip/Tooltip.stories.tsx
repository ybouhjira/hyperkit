import type { Meta, StoryObj } from 'storybook-solidjs';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

const meta = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <Button>Hover me</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Bottom tooltip',
    placement: 'bottom',
    children: <Button>Hover me</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Left tooltip',
    placement: 'left',
    children: <Button>Hover me</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Right tooltip',
    placement: 'right',
    children: <Button>Hover me</Button>,
  },
};

export const WithJSXContent: Story = {
  args: {
    content: (
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>JSX content supported</span>
      </div>
    ),
    placement: 'top',
    children: <Button>Rich content</Button>,
  },
};

export const CustomDelay: Story = {
  args: {
    content: 'This tooltip has a 1 second delay',
    placement: 'top',
    delay: 1000,
    children: <Button>Delayed tooltip</Button>,
  },
};

export const OnTextElement: Story = {
  render: () => (
    <div class="p-4">
      <p class="text-surface-700 dark:text-surface-300">
        This is a paragraph with{' '}
        <Tooltip content="Inline tooltip on text" placement="top">
          <span class="underline decoration-dotted cursor-help">helpful text</span>
        </Tooltip>{' '}
        that has a tooltip.
      </p>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div class="flex gap-4 p-4">
      <Tooltip content="First tooltip" placement="top">
        <Button>First</Button>
      </Tooltip>
      <Tooltip content="Second tooltip" placement="bottom">
        <Button variant="secondary">Second</Button>
      </Tooltip>
      <Tooltip content="Third tooltip" placement="left">
        <Button variant="ghost">Third</Button>
      </Tooltip>
      <Tooltip content="Fourth tooltip" placement="right">
        <Button variant="danger">Fourth</Button>
      </Tooltip>
    </div>
  ),
};
