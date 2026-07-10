import type { Meta, StoryObj } from 'storybook-solidjs';
import { ThemePicker } from './ThemePicker';

const meta = {
  title: 'Theme/ThemePicker',
  component: ThemePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ThemePicker />,
};
