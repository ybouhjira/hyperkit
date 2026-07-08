import type { Meta, StoryObj } from 'storybook-solidjs';
import { ToolExecution } from './ToolExecution';

const meta: Meta<typeof ToolExecution> = {
  title: 'Data Display/ToolExecution',
  component: ToolExecution,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ToolExecution>;

export const Running: Story = {
  args: { toolName: 'Bash', status: 'running', input: 'npm run build' },
};
export const Success: Story = {
  args: {
    toolName: 'Read',
    status: 'success',
    input: '/src/index.ts',
    output: 'export { Button } from "./Button";',
    duration: 12,
    defaultOpen: true,
  },
};
export const Error: Story = {
  args: {
    toolName: 'Write',
    status: 'error',
    input: '/protected/file',
    output: 'Permission denied',
    duration: 3,
    defaultOpen: true,
  },
};
