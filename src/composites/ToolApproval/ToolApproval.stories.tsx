import type { Meta, StoryObj } from 'storybook-solidjs';
import { ToolApproval } from './ToolApproval';
import { ToolApprovalQueue } from './ToolApprovalQueue';
import { createSignal } from 'solid-js';
import { KeyboardProvider } from '../../keyboard';
import { Center } from '../../primitives/Center';
import { Text } from '../../primitives/Text';
import type { ToolApprovalItem } from './ToolApproval';

const meta = {
  title: 'Composites/ToolApproval',
  component: ToolApproval,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <KeyboardProvider>
        <Story />
      </KeyboardProvider>
    ),
  ],
} satisfies Meta<typeof ToolApproval>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleApproval: Story = {
  render: () => (
    <ToolApproval
      tool="Read"
      input={{ file_path: '/src/index.ts' }}
      onApprove={(alwaysAllow) => console.log('Approved', { alwaysAllow })}
      onDeny={() => console.log('Denied')}
    />
  ),
};

export const DangerousCommand: Story = {
  render: () => (
    <ToolApproval
      tool="Bash"
      input={{ command: 'rm -rf /tmp/build' }}
      onApprove={(alwaysAllow) => console.log('Approved', { alwaysAllow })}
      onDeny={() => console.log('Denied')}
    />
  ),
};

export const WithAlwaysAllow: Story = {
  render: () => (
    <ToolApproval
      tool="Read"
      input={{ file_path: '/src/index.ts' }}
      onApprove={(alwaysAllow) => console.log('Approved', { alwaysAllow })}
      onDeny={() => console.log('Denied')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Check the "Always allow this tool" checkbox to see how it works.',
      },
    },
  },
};

export const MultipleQueued: Story = {
  render: () => {
    const queueItems: ToolApprovalItem[] = [
      { id: '1', tool: 'Read', input: { file_path: '/src/index.ts' } },
      { id: '2', tool: 'Bash', input: { command: 'npm install' } },
      {
        id: '3',
        tool: 'Write',
        input: { file_path: '/src/new-file.ts', content: 'console.log("hello");' },
      },
    ];

    return (
      <ToolApprovalQueue
        queue={queueItems}
        onApprove={(id, alwaysAllow) => console.log('Approved', { id, alwaysAllow })}
        onDeny={(id) => console.log('Denied', { id })}
      />
    );
  },
};

export const LargeInput: Story = {
  render: () => (
    <ToolApproval
      tool="Write"
      input={{
        file_path: '/src/config/database.json',
        content: {
          database: {
            connections: {
              primary: {
                host: 'localhost',
                port: 5432,
                credentials: {
                  username: 'admin',
                  password: 'secret',
                  roles: ['read', 'write', 'admin'],
                },
                pool: {
                  min: 2,
                  max: 10,
                  idle: 30000,
                },
              },
              replica: {
                host: 'replica.example.com',
                port: 5432,
                credentials: {
                  username: 'readonly',
                  password: 'secret',
                  roles: ['read'],
                },
              },
            },
          },
        },
      }}
      onApprove={(alwaysAllow) => console.log('Approved', { alwaysAllow })}
      onDeny={() => console.log('Denied')}
    />
  ),
};

export const Interactive: Story = {
  render: () => {
    const initialQueue: ToolApprovalItem[] = [
      { id: '1', tool: 'Read', input: { file_path: '/src/index.ts' } },
      { id: '2', tool: 'Bash', input: { command: 'npm install' } },
      {
        id: '3',
        tool: 'Write',
        input: { file_path: '/src/new-file.ts', content: 'console.log("hello");' },
      },
    ];

    const [queue, setQueue] = createSignal<ToolApprovalItem[]>(initialQueue);

    const handleApprove = (id: string, alwaysAllow: boolean) => {
      console.log('Approved', { id, alwaysAllow });
      setQueue((q) => q.filter((item) => item.id !== id));
    };

    const handleDeny = (id: string) => {
      console.log('Denied', { id });
      setQueue((q) => q.filter((item) => item.id !== id));
    };

    return (
      <>
        {queue().length === 0 ? (
          <Center style={{ height: '400px' }}>
            <Text size="lg" color="muted">
              No pending approvals
            </Text>
          </Center>
        ) : (
          <ToolApprovalQueue queue={queue()} onApprove={handleApprove} onDeny={handleDeny} />
        )}
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing the full lifecycle. Approve or deny items to see them removed from the queue.',
      },
    },
  },
};
