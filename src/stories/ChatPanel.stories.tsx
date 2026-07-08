import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal, onCleanup, For, Show } from 'solid-js';
import { ChatWindow } from '../composites/ChatWindow/ChatWindow';
import { MessageBubble } from '../composites/MessageBubble/MessageBubble';
import { MessageInput } from '../composites/MessageInput/MessageInput';
import { MessageList } from '../composites/MessageList/MessageList';
import { ToolExecution } from '../composites/ToolExecution/ToolExecution';
import { ConnectionStatus } from '../composites/ConnectionStatus/ConnectionStatus';
import { StreamingIndicator } from '../primitives/StreamingIndicator/StreamingIndicator';
import { ChatLayout } from '../layouts/ChatLayout/ChatLayout';
import { ModelSelector } from '../composites/ModelSelector/ModelSelector';
import { Badge } from '../primitives/Badge/Badge';
import { Button } from '../primitives/Button/Button';
import { EmptyState as EmptyStateComponent } from '../primitives/EmptyState/EmptyState';
import { StatusDot } from '../primitives/StatusDot/StatusDot';

import type { Message } from '../composites/MessageList/MessageList';
import type { MessageRole } from '../composites/MessageBubble/MessageBubble';
import type { ModelOption } from '../composites/ModelSelector/ModelSelector';
import type { SessionTab, TabSessionStatus } from '../composites/SessionTabs/SessionTabs';
import type { ToolStatus } from '../composites/ToolExecution/ToolExecution';
import type { SlashCommand } from '../composites/MessageInput/MessageInput';

// ─── Mock Data ──────────────────────────────────────────────

const mockModels: ModelOption[] = [
  { id: 'opus', name: 'Claude Opus 4.6', description: 'Most capable model for complex tasks' },
  { id: 'sonnet', name: 'Claude Sonnet 4.5', description: 'Fast and smart for everyday use' },
  { id: 'haiku', name: 'Claude Haiku 4.0', description: 'Fastest model for simple tasks' },
];

const mockSlashCommands: SlashCommand[] = [
  { id: 'commit', name: '/commit', description: 'Create a git commit' },
  { id: 'test', name: '/test', description: 'Run test suite' },
  { id: 'deploy', name: '/deploy', description: 'Deploy to production' },
  { id: 'clear', name: '/clear', description: 'Clear conversation' },
  { id: 'help', name: '/help', description: 'Show available commands' },
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user' as MessageRole,
    content: 'Can you help me refactor the authentication module?',
    timestamp: new Date('2026-02-24T10:00:00'),
  },
  {
    id: '2',
    role: 'assistant' as MessageRole,
    content:
      "I'll analyze the authentication module and suggest improvements.\n\nLet me start by reading the current implementation:",
    timestamp: new Date('2026-02-24T10:00:05'),
  },
  {
    id: '3',
    role: 'assistant' as MessageRole,
    content: `Based on my analysis, here are the key issues:

1. **Token refresh logic** is duplicated across 3 files
2. **Session management** uses localStorage directly instead of an abstraction
3. **Error handling** is inconsistent

Here's the refactored approach:

\`\`\`typescript
interface AuthConfig {
  tokenEndpoint: string;
  refreshThreshold: number;
  storage: StorageAdapter;
}

export class AuthManager {
  private config: AuthConfig;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.getRefreshToken() }),
    });
    if (!response.ok) throw new AuthError('Token refresh failed');
    const { access_token } = await response.json();
    this.config.storage.set('access_token', access_token);
    return access_token;
  }
}
\`\`\`

Shall I proceed with implementing this refactor?`,
    timestamp: new Date('2026-02-24T10:00:30'),
  },
  {
    id: '4',
    role: 'user' as MessageRole,
    content:
      'Yes, go ahead. Also make sure to add proper TypeScript types for all the auth states.',
    timestamp: new Date('2026-02-24T10:01:00'),
  },
  {
    id: '5',
    role: 'assistant' as MessageRole,
    content: `I'll implement the refactored auth module with full type safety. Let me start by creating the type definitions and then the implementation.

\`\`\`typescript
export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'authenticating' }
  | { status: 'authenticated'; user: User; token: string }
  | { status: 'error'; error: AuthError };
\`\`\`

I've updated 3 files:
- \`src/auth/types.ts\` — New type definitions
- \`src/auth/AuthManager.ts\` — Refactored manager class
- \`src/auth/useAuth.ts\` — Updated hook with proper types`,
    timestamp: new Date('2026-02-24T10:01:30'),
  },
  {
    id: '6',
    role: 'user' as MessageRole,
    content: 'Looks great! Can you run the tests to make sure nothing broke?',
    timestamp: new Date('2026-02-24T10:02:00'),
  },
  {
    id: '7',
    role: 'assistant' as MessageRole,
    content: `All 24 tests pass. Here's the summary:

\`\`\`
✓ auth/AuthManager.test.ts (8 tests)
✓ auth/useAuth.test.ts (6 tests)
✓ auth/types.test.ts (4 tests)
✓ auth/integration.test.ts (6 tests)

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Time:        1.84s
\`\`\`

All existing tests pass with the refactored code, and I added 4 new tests for the type guards.`,
    timestamp: new Date('2026-02-24T10:02:15'),
  },
];

const mockTools = [
  {
    toolName: 'Read',
    status: 'success' as ToolStatus,
    input: 'src/auth/AuthManager.ts',
    output: '// File contents (247 lines)...',
    duration: 120,
    defaultOpen: false,
  },
  {
    toolName: 'Bash',
    status: 'success' as ToolStatus,
    input: 'npx vitest run src/auth/',
    output: '✓ 4 test suites passed\n✓ 24 tests passed\nTime: 1.84s',
    duration: 1840,
    defaultOpen: true,
  },
  {
    toolName: 'Edit',
    status: 'error' as ToolStatus,
    input: 'src/auth/legacy.ts',
    output: 'Error: File not found',
    duration: 45,
    defaultOpen: false,
  },
];

const mockSessions: SessionTab[] = [
  { id: 'session-1', name: 'Auth Refactor', status: 'idle' as TabSessionStatus },
  {
    id: 'session-2',
    name: 'Bug Fix #142',
    status: 'streaming' as TabSessionStatus,
    unreadCount: 3,
  },
  { id: 'session-3', name: 'Deploy Script', status: 'error' as TabSessionStatus },
];

const streamingText = `I'll help you implement the database migration system. Here's my approach:

## Migration Strategy

First, let's create the migration runner that handles versioning:

\`\`\`typescript
import { Pool } from 'pg';

interface Migration {
  version: number;
  name: string;
  up: (pool: Pool) => Promise<void>;
  down: (pool: Pool) => Promise<void>;
}

export class MigrationRunner {
  private pool: Pool;
  private migrations: Migration[] = [];

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getCurrentVersion(): Promise<number> {
    const result = await this.pool.query(
      'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1'
    );
    return result.rows[0]?.version ?? 0;
  }

  async migrate(): Promise<void> {
    const current = await this.getCurrentVersion();
    const pending = this.migrations.filter(m => m.version > current);

    for (const migration of pending) {
      await this.pool.query('BEGIN');
      try {
        await migration.up(this.pool);
        await this.pool.query(
          'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
          [migration.version, migration.name]
        );
        await this.pool.query('COMMIT');
        console.log(\`✓ Applied migration: \${migration.name}\`);
      } catch (error) {
        await this.pool.query('ROLLBACK');
        throw error;
      }
    }
  }
}
\`\`\`

This handles:
- **Version tracking** via a \`schema_migrations\` table
- **Transactional migrations** — each migration runs in a transaction
- **Rollback support** — the \`down\` method on each migration
- **Ordered execution** — migrations run in version order

Shall I also set up the CLI commands for creating and running migrations?`;

function createStreamingSimulator(
  text: string,
  onUpdate: (partial: string) => void,
  charDelay = 15
) {
  let index = 0;
  const interval = setInterval(() => {
    const chunkSize = Math.floor(Math.random() * 3) + 1;
    index = Math.min(index + chunkSize, text.length);
    onUpdate(text.slice(0, index));
    if (index >= text.length) {
      clearInterval(interval);
    }
  }, charDelay);
  return () => clearInterval(interval);
}

// ─── Meta ───────────────────────────────────────────────────

const meta: Meta = {
  title: 'Composites/ChatPanel',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// ─── Story 1: Empty State ───────────────────────────────────

function EmptyStateStory() {
  const [messages, setMessages] = createSignal<Message[]>([]);

  const suggestions = [
    'Help me refactor my authentication module',
    'Write unit tests for the user service',
    'Explain how React Server Components work',
    'Create a REST API for managing tasks',
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    setMessages([...messages(), newMessage]);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with that. Let me start by understanding the current implementation...`,
        timestamp: new Date(),
      };
      setMessages([...messages(), assistantMessage]);
    }, 1000);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <Show
        when={messages().length > 0}
        fallback={
          <div
            style={{
              display: 'flex',
              'flex-direction': 'column',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                flex: 1,
                padding: '2rem',
                gap: '2rem',
              }}
            >
              <EmptyStateComponent
                title="Start a new conversation"
                description="Choose a suggestion below or type your own message to begin."
              />
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  'flex-wrap': 'wrap',
                  'max-width': '600px',
                }}
              >
                <For each={suggestions}>
                  {(suggestion) => (
                    <Button variant="secondary" onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </Button>
                  )}
                </For>
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', 'border-top': '1px solid var(--sk-border)' }}>
              <MessageInput
                placeholder="Type a message..."
                onSend={(content) => {
                  const newMessage: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content,
                    timestamp: new Date(),
                  };
                  setMessages([...messages(), newMessage]);
                }}
              />
            </div>
          </div>
        }
      >
        <ChatWindow
          messages={messages()}
          connectionState="connected"
          models={mockModels}
          selectedModel="sonnet"
          onSend={(content) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content,
              timestamp: new Date(),
            };
            setMessages([...messages(), newMessage]);
          }}
        />
      </Show>
    </div>
  );
}

export const EmptyState: StoryObj = {
  render: () => <EmptyStateStory />,
};

// ─── Story 2: Active Conversation ──────────────────────────

function ActiveConversationStory() {
  const [messages, setMessages] = createSignal<Message[]>(mockMessages);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          padding: '0.75rem 1rem',
          'border-bottom': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', 'align-items': 'center', gap: '0.75rem' }}>
          <span style={{ 'font-weight': '600', color: 'var(--sk-text-primary)' }}>
            Auth Refactor
          </span>
          <ConnectionStatus state="connected" />
        </div>
        <ModelSelector models={mockModels} value="opus" />
      </div>

      <div class="sk-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0' }}>
        <For each={messages()}>
          {(msg, index) => (
            <>
              <MessageBubble
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                onCopy={() => console.log('Copied:', msg.id)}
              />
              <Show when={index() === 1}>
                <div style={{ padding: '0.25rem 1rem' }}>
                  <ToolExecution
                    toolName={mockTools[0].toolName}
                    status={mockTools[0].status}
                    input={mockTools[0].input}
                    output={mockTools[0].output}
                    duration={mockTools[0].duration}
                    defaultOpen={false}
                  />
                </div>
              </Show>
              <Show when={index() === 5}>
                <div
                  style={{
                    padding: '0.25rem 1rem',
                    display: 'flex',
                    'flex-direction': 'column',
                    gap: '0.25rem',
                  }}
                >
                  <ToolExecution
                    toolName={mockTools[1].toolName}
                    status={mockTools[1].status}
                    input={mockTools[1].input}
                    output={mockTools[1].output}
                    duration={mockTools[1].duration}
                    defaultOpen={true}
                  />
                  <ToolExecution
                    toolName={mockTools[2].toolName}
                    status={mockTools[2].status}
                    input={mockTools[2].input}
                    output={mockTools[2].output}
                    duration={mockTools[2].duration}
                    defaultOpen={false}
                  />
                </div>
              </Show>
            </>
          )}
        </For>
      </div>

      <div style={{ padding: '0.75rem 1rem', 'border-top': '1px solid var(--sk-border)' }}>
        <MessageInput
          placeholder="Type a message..."
          onSend={(content) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content,
              timestamp: new Date(),
            };
            setMessages([...messages(), newMessage]);
          }}
        />
      </div>
    </div>
  );
}

export const ActiveConversation: StoryObj = {
  render: () => <ActiveConversationStory />,
};

// ─── Story 3: Streaming Response ───────────────────────────

function StreamingResponseStory() {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Can you help me set up a database migration system?',
      timestamp: new Date(),
    },
  ]);
  const [_streamingContent, setStreamingContent] = createSignal('');
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [streamingId, setStreamingId] = createSignal<string | undefined>(undefined);

  const startStreaming = () => {
    setIsStreaming(true);
    const assistantId = Date.now().toString();
    setStreamingId(assistantId);

    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages([...messages(), assistantMessage]);

    const cleanup = createStreamingSimulator(streamingText, (partial) => {
      setStreamingContent(partial);
      setMessages((msgs) =>
        msgs.map((msg) => (msg.id === assistantId ? { ...msg, content: partial } : msg))
      );
    });

    onCleanup(cleanup);

    setTimeout(
      () => {
        setIsStreaming(false);
        setStreamingId(undefined);
        cleanup();
      },
      streamingText.length * 15 + 500
    );
  };

  setTimeout(() => startStreaming(), 1000);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <ChatWindow
        messages={messages()}
        connectionState="connected"
        streamingMessageId={streamingId()}
        models={mockModels}
        selectedModel="opus"
        onSend={(content) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
          };
          setMessages([...messages(), newMessage]);
        }}
        onInterrupt={() => {
          setIsStreaming(false);
          setStreamingId(undefined);
        }}
      />
      <Show when={isStreaming()}>
        <div style={{ padding: '1rem' }}>
          <StreamingIndicator visible={true} message="Generating response..." />
        </div>
      </Show>
    </div>
  );
}

export const StreamingResponse: StoryObj = {
  render: () => <StreamingResponseStory />,
};

// ─── Story 4: Tool Approval ─────────────────────────────────

function ToolApprovalStory() {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Clean up the build artifacts',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I need to run this command to clean the build directory:',
      timestamp: new Date(),
    },
  ]);
  const [showApproval, setShowApproval] = createSignal(true);
  const [inputDisabled, setInputDisabled] = createSignal(true);

  const handleApprove = () => {
    setShowApproval(false);
    setInputDisabled(false);
    const successMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Command executed successfully. Build artifacts removed.',
      timestamp: new Date(),
    };
    setMessages([...messages(), successMessage]);
  };

  const handleDeny = () => {
    setShowApproval(false);
    setInputDisabled(false);
    const denialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Understood. I will not execute that command. What would you like me to do instead?',
      timestamp: new Date(),
    };
    setMessages([...messages(), denialMessage]);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <div class="sk-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <MessageList messages={messages()} />

        <Show when={showApproval()}>
          <div
            style={{
              'margin-top': '1rem',
              padding: '1rem',
              border: '1px solid var(--sk-border)',
              'border-radius': '0.5rem',
              'background-color': 'var(--sk-bg-elevated)',
            }}
          >
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '0.5rem',
                'margin-bottom': '0.75rem',
              }}
            >
              <Badge variant="danger">Dangerous Command</Badge>
              <span style={{ 'font-weight': '600', color: 'var(--sk-text-primary)' }}>
                Approval Required
              </span>
            </div>
            <div
              style={{
                'font-family': 'monospace',
                'background-color': 'var(--sk-bg-primary)',
                color: 'var(--sk-text-primary)',
                padding: '0.75rem',
                'border-radius': '0.375rem',
                'margin-bottom': '0.75rem',
              }}
            >
              rm -rf ./dist
            </div>
            <div
              style={{
                'font-size': '0.875rem',
                color: 'var(--sk-text-secondary)',
                'margin-bottom': '1rem',
              }}
            >
              This command will permanently delete files. Do you want to proceed?
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="primary" onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="secondary" onClick={handleDeny}>
                Deny
              </Button>
            </div>
          </div>
        </Show>
      </div>

      <div
        style={{
          'border-top': '1px solid var(--sk-border)',
          padding: '1rem',
          opacity: inputDisabled() ? '0.5' : '1',
        }}
      >
        <MessageInput
          placeholder="Type a message..."
          disabled={inputDisabled()}
          onSend={(content) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content,
              timestamp: new Date(),
            };
            setMessages([...messages(), newMessage]);
          }}
        />
      </div>
    </div>
  );
}

export const ToolApproval: StoryObj = {
  render: () => <ToolApprovalStory />,
};

// ─── Story 5: Multi Session ─────────────────────────────────

function MultiSessionStory() {
  const [activeTabId, setActiveTabId] = createSignal('session-1');
  const [tabs, setTabs] = createSignal<SessionTab[]>(mockSessions);

  const sessionMessages: Record<string, Message[]> = {
    'session-1': mockMessages,
    'session-2': [
      {
        id: '1',
        role: 'user',
        content: 'Fix the pagination bug in the user list',
        timestamp: new Date(),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'I found the issue. The offset calculation is incorrect when page size changes.',
        timestamp: new Date(),
      },
    ],
    'session-3': [
      {
        id: '1',
        role: 'user',
        content: 'Create a deployment script for staging',
        timestamp: new Date(),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Error: Unable to connect to staging server. Please check VPN connection.',
        timestamp: new Date(),
      },
    ],
  };

  const handleNewTab = () => {
    const newTab: SessionTab = {
      id: `session-${Date.now()}`,
      name: 'New Session',
      status: 'idle',
    };
    setTabs([...tabs(), newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (id: string) => {
    const newTabs = tabs().filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTabId() === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const sidebarContent = (
    <div style={{ padding: '1rem' }}>
      <For each={tabs()}>
        {(tab) => (
          <div
            style={{
              padding: '0.75rem',
              'border-radius': '0.375rem',
              'margin-bottom': '0.5rem',
              cursor: 'pointer',
              'background-color':
                tab.id === activeTabId() ? 'var(--sk-bg-secondary)' : 'transparent',
              border:
                tab.id === activeTabId() ? '1px solid var(--sk-border)' : '1px solid transparent',
            }}
            onClick={() => setActiveTabId(tab.id)}
          >
            <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
              <StatusDot
                status={
                  tab.status === 'idle' ? 'idle' : tab.status === 'streaming' ? 'busy' : 'error'
                }
              />
              <span style={{ flex: 1, 'font-size': '0.875rem' }}>{tab.name}</span>
              <Show when={tab.unreadCount}>
                <Badge variant="info">{tab.unreadCount}</Badge>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );

  return (
    <ChatLayout
      sidebarOpen={true}
      sidebarContent={sidebarContent}
      tabs={tabs()}
      activeTabId={activeTabId()}
      onTabSelect={setActiveTabId}
      onTabClose={handleCloseTab}
      onNewTab={handleNewTab}
    >
      <ChatWindow
        messages={sessionMessages[activeTabId()] || []}
        connectionState="connected"
        models={mockModels}
        selectedModel="sonnet"
        title={tabs().find((t) => t.id === activeTabId())?.name}
        onSend={(content) => {
          console.log('Send message:', content);
        }}
      />
    </ChatLayout>
  );
}

export const MultiSession: StoryObj = {
  render: () => <MultiSessionStory />,
};

// ─── Story 6: With Subagents ────────────────────────────────

function WithSubagentsStory() {
  const [messages, setMessages] = createSignal<Message[]>(mockMessages);
  const [elapsedTime1, setElapsedTime1] = createSignal(0);
  const [elapsedTime2, setElapsedTime2] = createSignal(0);

  const timer1 = setInterval(() => setElapsedTime1((t) => t + 1), 1000);
  const timer2 = setInterval(() => setElapsedTime2((t) => t + 1), 1000);

  onCleanup(() => {
    clearInterval(timer1);
    clearInterval(timer2);
  });

  const subagents = [
    { id: '1', task: 'Analyzing code quality metrics', model: 'Sonnet', elapsed: elapsedTime1 },
    { id: '2', task: 'Running integration tests', model: 'Haiku', elapsed: elapsedTime2 },
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <div class="sk-scrollbar" style={{ flex: 1, overflow: 'auto' }}>
        <ChatWindow
          messages={messages()}
          connectionState="connected"
          models={mockModels}
          selectedModel="opus"
          title="Parallel Analysis"
          onSend={(content) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content,
              timestamp: new Date(),
            };
            setMessages([...messages(), newMessage]);
          }}
        />
      </div>

      <div
        style={{
          'border-top': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-secondary)',
          padding: '1rem',
        }}
      >
        <div
          style={{
            'font-size': '0.875rem',
            'font-weight': '600',
            'margin-bottom': '0.75rem',
            color: 'var(--sk-text-primary)',
          }}
        >
          Running Subagents
        </div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
          <For each={subagents}>
            {(subagent) => (
              <div
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  'background-color': 'var(--sk-bg-primary)',
                  'border-radius': '0.375rem',
                  border: '1px solid var(--sk-border)',
                }}
              >
                <StatusDot status="connected" />
                <span style={{ flex: 1, 'font-size': '0.875rem', color: 'var(--sk-text-primary)' }}>
                  {subagent.task}
                </span>
                <Badge variant="secondary">{subagent.model}</Badge>
                <span style={{ 'font-size': '0.75rem', color: 'var(--sk-text-secondary)' }}>
                  {Math.floor(subagent.elapsed() / 60)}:
                  {(subagent.elapsed() % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export const WithSubagents: StoryObj = {
  render: () => <WithSubagentsStory />,
};

// ─── Story 7: Disconnected State ────────────────────────────

function DisconnectedStateStory() {
  const [messages] = createSignal<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Can you help me debug this issue?',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Of course! Let me take a look at the logs...',
      timestamp: new Date(),
    },
    {
      id: '3',
      role: 'system',
      content: 'Connection lost. Attempting to reconnect...',
      timestamp: new Date(),
    },
  ]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <ChatWindow
        messages={messages()}
        connectionState="disconnected"
        models={mockModels}
        selectedModel="sonnet"
        onSend={(content) => {
          console.log('Cannot send while disconnected:', content);
        }}
      />
    </div>
  );
}

export const DisconnectedState: StoryObj = {
  render: () => <DisconnectedStateStory />,
};

// ─── Story 8: Full Panel (Kitchen Sink) ────────────────────

function FullPanelStory() {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Create a comprehensive testing strategy for the new feature',
      timestamp: new Date(),
    },
  ]);
  const [activeTabId, setActiveTabId] = createSignal('session-main');
  const [tabs, setTabs] = createSignal<SessionTab[]>([
    { id: 'session-main', name: 'Testing Strategy', status: 'streaming' },
    { id: 'session-2', name: 'Code Review', status: 'idle', unreadCount: 2 },
  ]);
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [selectedModel, setSelectedModel] = createSignal('opus');
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [streamingId, setStreamingId] = createSignal<string | undefined>(undefined);

  const handleSend = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages([...messages(), userMessage]);

    setTimeout(() => {
      setIsStreaming(true);
      const assistantId = (Date.now() + 1).toString();
      setStreamingId(assistantId);

      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages([...messages(), assistantMessage]);

      const responseText = `I'll create a comprehensive testing strategy. Here's my approach:

## Testing Pyramid

1. **Unit Tests** (70% of tests)
   - Fast, isolated tests for individual functions
   - Mock external dependencies
   - Target: >90% code coverage

2. **Integration Tests** (20% of tests)
   - Test component interactions
   - Use real dependencies where possible
   - Focus on critical user flows

3. **End-to-End Tests** (10% of tests)
   - Full user journey testing
   - Run in staging environment
   - Cover main business scenarios

I'll set up the test infrastructure now.`;

      const cleanup = createStreamingSimulator(responseText, (partial) => {
        setMessages((msgs) =>
          msgs.map((msg) => (msg.id === assistantId ? { ...msg, content: partial } : msg))
        );
      });

      onCleanup(cleanup);

      setTimeout(
        () => {
          setIsStreaming(false);
          setStreamingId(undefined);
          cleanup();
        },
        responseText.length * 15 + 500
      );
    }, 500);
  };

  const sidebarContent = (
    <div style={{ padding: '1rem' }}>
      <div style={{ 'margin-bottom': '1.5rem' }}>
        <div style={{ 'font-weight': '600', 'margin-bottom': '0.75rem' }}>Model</div>
        <ModelSelector models={mockModels} value={selectedModel()} onChange={setSelectedModel} />
      </div>

      <div style={{ 'margin-bottom': '1.5rem' }}>
        <div style={{ 'font-weight': '600', 'margin-bottom': '0.75rem' }}>Quick Commands</div>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
          <For each={mockSlashCommands}>
            {(cmd) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Command:', cmd.name)}
                style={{ 'justify-content': 'flex-start' }}
              >
                <span style={{ 'font-family': 'monospace', 'font-weight': '600' }}>{cmd.name}</span>
                <span
                  style={{
                    'margin-left': '0.5rem',
                    'font-size': '0.75rem',
                    color: 'var(--sk-text-secondary)',
                  }}
                >
                  {cmd.description}
                </span>
              </Button>
            )}
          </For>
        </div>
      </div>

      <div>
        <div style={{ 'font-weight': '600', 'margin-bottom': '0.75rem' }}>Recent Sessions</div>
        <For each={tabs()}>
          {(tab) => (
            <div
              style={{
                padding: '0.75rem',
                'border-radius': '0.375rem',
                'margin-bottom': '0.5rem',
                cursor: 'pointer',
                'background-color':
                  tab.id === activeTabId() ? 'var(--sk-bg-secondary)' : 'transparent',
                border:
                  tab.id === activeTabId() ? '1px solid var(--sk-border)' : '1px solid transparent',
              }}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
                <StatusDot
                  status={
                    tab.status === 'idle' ? 'idle' : tab.status === 'streaming' ? 'busy' : 'error'
                  }
                />
                <span style={{ flex: 1, 'font-size': '0.875rem' }}>{tab.name}</span>
                <Show when={tab.unreadCount}>
                  <Badge variant="info">{tab.unreadCount}</Badge>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );

  return (
    <ChatLayout
      sidebarOpen={sidebarOpen()}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen())}
      sidebarContent={sidebarContent}
      tabs={tabs()}
      activeTabId={activeTabId()}
      onTabSelect={setActiveTabId}
      onTabClose={(id) => {
        const newTabs = tabs().filter((tab) => tab.id !== id);
        setTabs(newTabs);
        if (activeTabId() === id && newTabs.length > 0) {
          setActiveTabId(newTabs[0].id);
        }
      }}
      onNewTab={() => {
        const newTab: SessionTab = {
          id: `session-${Date.now()}`,
          name: 'New Session',
          status: 'idle',
        };
        setTabs([...tabs(), newTab]);
        setActiveTabId(newTab.id);
      }}
    >
      <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column' }}>
        <ChatWindow
          messages={messages()}
          connectionState="connected"
          streamingMessageId={streamingId()}
          models={mockModels}
          selectedModel={selectedModel()}
          title={tabs().find((t) => t.id === activeTabId())?.name}
          onSend={handleSend}
          onInterrupt={() => {
            setIsStreaming(false);
            setStreamingId(undefined);
          }}
          onModelChange={setSelectedModel}
          onCopyMessage={(message) => {
            console.log('Copied message:', message.content);
          }}
        />

        <Show when={isStreaming()}>
          <div
            style={{
              padding: '1rem',
              'border-top': '1px solid var(--sk-border)',
              'background-color': 'var(--sk-bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
              <StreamingIndicator visible={true} />
              <ToolExecution
                toolName="Read"
                status="running"
                input="src/tests/integration/auth.test.ts"
                defaultOpen={false}
              />
            </div>
          </div>
        </Show>
      </div>
    </ChatLayout>
  );
}

export const FullPanel: StoryObj = {
  render: () => <FullPanelStory />,
};
