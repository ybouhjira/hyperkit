import type { Meta, StoryObj } from 'storybook-solidjs';
import { FontSelect } from './FontSelect';

const meta = {
  title: 'Theme/FontSelect',
  component: FontSelect,
  tags: ['autodocs'],
} satisfies Meta<typeof FontSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <FontSelect />,
};
