import type { Meta, StoryObj } from 'storybook-solidjs';
import { Sparkline } from './Sparkline';

const meta: Meta<typeof Sparkline> = {
  title: 'Primitives/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  argTypes: {
    filled: { control: 'boolean' },
    animate: { control: 'boolean' },
    width: { control: 'number' },
    height: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

const fpsData = [60, 58, 55, 59, 60, 57, 45, 50, 60, 60, 58, 62, 60];
const memData = [200, 210, 215, 220, 218, 230, 240, 235, 225, 220, 215, 212, 210];
const cpuData = [10, 12, 8, 15, 22, 30, 28, 20, 18, 14, 10, 9, 11];

export const Default: Story = {
  args: { data: fpsData },
};

export const Filled: Story = {
  args: { data: fpsData, filled: true },
};

export const Animated: Story = {
  args: { data: fpsData, animate: true },
};

export const FilledAndAnimated: Story = {
  args: { data: fpsData, filled: true, animate: true },
};

export const MemoryUsage: Story = {
  args: { data: memData, color: 'var(--sk-warning)', filled: true, width: 100, height: 32 },
};

export const CpuUsage: Story = {
  args: { data: cpuData, color: 'var(--sk-error)', filled: true },
};

export const SinglePoint: Story = {
  args: { data: [42] },
};

export const EmptyData: Story = {
  args: { data: [] },
};
