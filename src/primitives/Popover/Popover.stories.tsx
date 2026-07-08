import type { Meta, StoryObj } from 'storybook-solidjs';
import { Popover } from './Popover';
import { Button } from '../Button';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Checkbox } from '../Checkbox';

const meta: Meta<typeof Popover> = {
  title: 'Primitives/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    open: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Popover</Button>,
    content: (
      <Stack gap="sm">
        <Text weight="semibold">Popover Title</Text>
        <Text>This is popover content with some details.</Text>
      </Stack>
    ),
  },
};

export const TopPlacement: Story = {
  args: {
    trigger: <Button>Open (Top)</Button>,
    content: <Text>Content above the trigger</Text>,
    placement: 'top',
  },
};

export const RightPlacement: Story = {
  args: {
    trigger: <Button>Open (Right)</Button>,
    content: <Text>Content to the right</Text>,
    placement: 'right',
  },
};

export const WithForm: Story = {
  args: {
    trigger: <Button>Filter Options</Button>,
    content: (
      <Stack gap="sm">
        <Checkbox label="Errors only" />
        <Checkbox label="Warnings only" />
      </Stack>
    ),
  },
};
