import type { Meta, StoryObj } from 'storybook-solidjs';
import { ModelSelector } from './ModelSelector';

const meta: Meta<typeof ModelSelector> = {
  title: 'Data Entry/ModelSelector',
  component: ModelSelector,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ModelSelector>;

const models = [
  { id: 'opus', name: 'Claude Opus', description: 'Most capable' },
  { id: 'sonnet', name: 'Claude Sonnet', description: 'Balanced' },
  { id: 'haiku', name: 'Claude Haiku', description: 'Fastest' },
];

export const Default: Story = { args: { models } };
export const WithSelection: Story = { args: { models, value: 'sonnet' } };
export const Disabled: Story = { args: { models, disabled: true } };
