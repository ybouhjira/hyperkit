import { For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { ChatLayout } from './ChatLayout';
import { ChatWindow } from '../../composites/ChatWindow';

const meta: Meta<typeof ChatLayout> = {
  title: 'Layout/ChatLayout',
  component: ChatLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof ChatLayout>;

const tabs = [
  { id: '1', name: 'My Project', status: 'idle' as const },
  { id: '2', name: 'Debugging', status: 'streaming' as const },
  { id: '3', name: 'Tests', status: 'error' as const, unreadCount: 2 },
];

const messages = [
  { id: 'm1', role: 'user' as const, content: 'How do I sort an array in TypeScript?' },
  {
    id: 'm2',
    role: 'assistant' as const,
    content:
      'Use `Array.sort()`:\n\n```ts\nconst sorted = arr.sort((a, b) => a - b);\n```\n\nThis sorts numbers in ascending order.',
  },
  { id: 'm3', role: 'user' as const, content: 'What about sorting objects by a property?' },
  {
    id: 'm4',
    role: 'assistant' as const,
    content:
      'For objects, access the property in the comparator:\n\n```ts\nusers.sort((a, b) => a.name.localeCompare(b.name));\n```',
  },
];

const models = [
  { id: 'opus', name: 'Claude Opus' },
  { id: 'sonnet', name: 'Claude Sonnet' },
];

export const FullApp: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen
      tabs={tabs}
      activeTabId="1"
      onTabClose={() => {}}
      onNewTab={() => {}}
      sidebarContent={
        <div class="p-2 space-y-2">
          <For each={tabs}>
            {(t) => (
              <div class="px-3 py-2 rounded text-sm text-surface-300 hover:bg-surface-700 cursor-pointer">
                {t.name}
              </div>
            )}
          </For>
        </div>
      }
    >
      <ChatWindow
        messages={messages}
        connectionState="connected"
        models={models}
        selectedModel="opus"
        title="My Project"
      />
    </ChatLayout>
  ),
};

export const SidebarClosed: Story = {
  render: () => (
    <ChatLayout sidebarOpen={false} tabs={tabs} activeTabId="2">
      <ChatWindow messages={messages} connectionState="connected" title="Debugging" />
    </ChatLayout>
  ),
};

export const Disconnected: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen
      tabs={[{ id: '1', name: 'Offline Session', status: 'error' as const }]}
      activeTabId="1"
    >
      <ChatWindow messages={[]} connectionState="disconnected" title="Offline" />
    </ChatLayout>
  ),
};
