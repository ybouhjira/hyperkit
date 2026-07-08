import type { Meta, StoryObj } from 'storybook-solidjs';
import { WaterfallChart } from './WaterfallChart';

const meta: Meta<typeof WaterfallChart> = {
  title: 'Primitives/WaterfallChart',
  component: WaterfallChart,
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'number' },
    labelWidth: { control: 'number' },
    tickCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof WaterfallChart>;

export const Default: Story = {
  args: {
    items: [
      {
        id: 'dns',
        label: 'DNS Lookup',
        start: 0,
        end: 20,
        color: 'var(--sk-accent)',
        category: 'network',
      },
      {
        id: 'connect',
        label: 'TCP Connect',
        start: 20,
        end: 50,
        color: 'var(--sk-success)',
        category: 'network',
      },
      {
        id: 'ttfb',
        label: 'TTFB',
        start: 50,
        end: 150,
        color: 'var(--sk-warning)',
        category: 'server',
      },
      {
        id: 'download',
        label: 'Download',
        start: 150,
        end: 320,
        color: 'var(--sk-info)',
        category: 'network',
      },
      {
        id: 'parse',
        label: 'Parse HTML',
        start: 320,
        end: 380,
        color: 'var(--sk-accent)',
        category: 'browser',
      },
      {
        id: 'js',
        label: 'Execute JS',
        start: 380,
        end: 520,
        color: 'var(--sk-error)',
        category: 'browser',
      },
    ],
  },
};

export const Overlapping: Story = {
  args: {
    items: [
      { id: 'req1', label: 'Image 1', start: 0, end: 200, color: 'var(--sk-accent)' },
      { id: 'req2', label: 'Image 2', start: 50, end: 180, color: 'var(--sk-success)' },
      { id: 'req3', label: 'Font', start: 100, end: 300, color: 'var(--sk-warning)' },
      { id: 'req4', label: 'Script', start: 200, end: 450, color: 'var(--sk-error)' },
    ],
  },
};

export const Empty: Story = {
  args: { items: [] },
};
