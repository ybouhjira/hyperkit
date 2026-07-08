import type { Meta, StoryObj } from 'storybook-solidjs';
import { Badge } from './Badge';
import { Flex } from '../Flex';
import { Grid } from '../Grid';

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'outline', 'soft'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    type: { control: 'select', options: ['label', 'dot', 'count'] },
    count: { control: 'number' },
    maxCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: 'Default' },
};

export const Success: Story = {
  args: { children: 'Active', variant: 'success' },
};

export const Warning: Story = {
  args: { children: 'Pending', variant: 'warning' },
};

export const Danger: Story = {
  args: { children: 'Error', variant: 'danger' },
};

export const Info: Story = {
  args: { children: 'Info', variant: 'info' },
};

export const Dot: Story = {
  args: { type: 'dot', variant: 'success' },
};

export const DotDanger: Story = {
  args: { type: 'dot', variant: 'danger' },
};

export const DotWarning: Story = {
  args: { type: 'dot', variant: 'warning' },
};

export const DotInfo: Story = {
  args: { type: 'dot', variant: 'info' },
};

export const DotDefault: Story = {
  args: { type: 'dot', variant: 'default' },
};

export const Count: Story = {
  args: { type: 'count', count: 5, variant: 'danger' },
};

export const CountSuccess: Story = {
  args: { type: 'count', count: 12, variant: 'success' },
};

export const CountOverflow: Story = {
  args: { type: 'count', count: 150, maxCount: 99, variant: 'danger' },
};

export const CountCustomMax: Story = {
  args: { type: 'count', count: 250, maxCount: 199, variant: 'info' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Soft: Story = {
  args: { variant: 'soft', children: 'Soft' },
};

export const Sizes: Story = {
  render: () => (
    <Flex align="center" gap="sm">
      <Badge size="xs">xs</Badge>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
    </Flex>
  ),
};

export const SizeVariantGrid: Story = {
  render: () => {
    const variants = [
      'default',
      'success',
      'warning',
      'danger',
      'info',
      'outline',
      'soft',
    ] as const;
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;
    return (
      <Grid columns="repeat(4, max-content)" gap="sm">
        {variants.flatMap((v) =>
          sizes.map((s) => (
            <Badge variant={v} size={s}>
              {v}/{s}
            </Badge>
          ))
        )}
      </Grid>
    );
  },
};
