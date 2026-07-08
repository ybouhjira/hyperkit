import type { Meta, StoryObj } from 'storybook-solidjs';
import { TerminalOutput, type TerminalLine } from './TerminalOutput';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Data Display/TerminalOutput',
  component: TerminalOutput,
  tags: ['autodocs'],
} satisfies Meta<typeof TerminalOutput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const lines: TerminalLine[] = [
      { type: 'system', text: 'Starting build process...' },
      { type: 'tool_call', text: 'npm run build' },
      { type: 'info', text: 'Compiling TypeScript...' },
      { type: 'tool_result', text: 'Build completed in 3.2s' },
      { type: 'info', text: 'Output: dist/index.js (142kb)' },
      { type: 'system', text: 'Build successful!' },
    ];

    return <TerminalOutput lines={lines} />;
  },
};

export const WithTimestamps: Story = {
  render: () => {
    const now = Date.now();
    const lines: TerminalLine[] = [
      { type: 'system', text: 'Starting deployment...', timestamp: now },
      { type: 'tool_call', text: 'git push origin main', timestamp: now + 1000 },
      { type: 'info', text: 'Uploading files...', timestamp: now + 2000 },
      { type: 'tool_result', text: 'Deploy successful', timestamp: now + 5000 },
      { type: 'system', text: 'Deployment completed', timestamp: now + 5500 },
    ];

    return <TerminalOutput lines={lines} showTimestamps={true} />;
  },
};

export const ErrorLines: Story = {
  render: () => {
    const lines: TerminalLine[] = [
      { type: 'system', text: 'Running tests...' },
      { type: 'tool_call', text: 'npm test' },
      { type: 'info', text: 'Test suite started' },
      { type: 'error', text: 'Test failed: expected 5 to equal 10' },
      { type: 'error', text: 'TypeError: Cannot read property "name" of undefined' },
      { type: 'error', text: 'Warning: unused variable "x" at line 42' },
      { type: 'info', text: '3 tests passed, 3 failed' },
      { type: 'system', text: 'Test run completed with errors' },
    ];

    return <TerminalOutput lines={lines} />;
  },
};

export const MaxLines: Story = {
  render: () => {
    const lines: TerminalLine[] = [
      { type: 'info', text: 'Line 1 (will be truncated)' },
      { type: 'info', text: 'Line 2 (will be truncated)' },
      { type: 'info', text: 'Line 3 (will be truncated)' },
      { type: 'info', text: 'Line 4 (will be truncated)' },
      { type: 'info', text: 'Line 5 (will be truncated)' },
      { type: 'info', text: 'Line 6 (will be truncated)' },
      { type: 'info', text: 'Line 7 (will be truncated)' },
      { type: 'system', text: 'Line 8 (visible)' },
      { type: 'tool_call', text: 'Line 9 (visible)' },
      { type: 'tool_result', text: 'Line 10 (visible)' },
    ];

    return <TerminalOutput lines={lines} maxLines={3} />;
  },
};

export const AllLineTypes: Story = {
  render: () => {
    const lines: TerminalLine[] = [
      { type: 'system', text: 'System message with › prefix' },
      { type: 'tool_call', text: 'Tool call with → prefix' },
      { type: 'tool_result', text: 'Tool result with ← prefix' },
      { type: 'error', text: 'Error message with ✗ prefix' },
      { type: 'info', text: 'Info message with ℹ prefix' },
    ];

    return <TerminalOutput lines={lines} />;
  },
};

export const AllVariants: Story = {
  render: () => {
    const basicLines: TerminalLine[] = [
      { type: 'system', text: 'Starting process...' },
      { type: 'tool_call', text: 'npm run dev' },
      { type: 'tool_result', text: 'Server running on port 3000' },
    ];

    const errorLines: TerminalLine[] = [
      { type: 'error', text: 'Build failed' },
      { type: 'error', text: 'Module not found' },
      { type: 'info', text: 'Run npm install to fix' },
    ];

    const now = Date.now();
    const timestampedLines: TerminalLine[] = [
      { type: 'system', text: 'Task started', timestamp: now },
      { type: 'info', text: 'Processing...', timestamp: now + 1000 },
      { type: 'system', text: 'Task completed', timestamp: now + 2000 },
    ];

    return (
      <Stack gap="xl">
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Default
          </Text>
          <TerminalOutput lines={basicLines} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            With Errors
          </Text>
          <TerminalOutput lines={errorLines} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            With Timestamps
          </Text>
          <TerminalOutput lines={timestampedLines} showTimestamps={true} />
        </Stack>
        <Stack gap="sm">
          <Text as="h3" size="lg" weight="semibold">
            Max Lines (3)
          </Text>
          <TerminalOutput
            lines={[...basicLines, ...errorLines, ...timestampedLines]}
            maxLines={3}
          />
        </Stack>
      </Stack>
    );
  },
};
