import { For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { ChatLayout } from './ChatLayout';
import { ChatWindow } from '../composites/ChatWindow';
import { OnboardingLayout } from './OnboardingLayout';
import {
  mockModels,
  mockTabs,
  mockMessages,
  mockStreamingMessages,
  mockEmptyMessages,
  mockDirectoryItems,
} from '../__fixtures__';

const meta: Meta = {
  title: 'Pages/Full Application',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const Onboarding: Story = {
  render: () => (
    <OnboardingLayout
      items={mockDirectoryItems}
      currentPath="/home/user"
      description="Welcome to Claude! Select a working directory to get started."
    />
  ),
};

export const SingleSession: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen
      tabs={[mockTabs[0]]}
      activeTabId="s1"
      sidebarContent={
        <div class="p-2">
          <div class="px-3 py-2 rounded bg-surface-700 text-sm text-surface-200">hyperkit dev</div>
        </div>
      }
    >
      <ChatWindow
        messages={mockMessages}
        connectionState="connected"
        models={mockModels}
        selectedModel="claude-opus-4"
        title="hyperkit dev"
      />
    </ChatLayout>
  ),
};

export const MultiSession: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen
      tabs={mockTabs}
      activeTabId="s2"
      onTabClose={() => {}}
      onNewTab={() => {}}
      sidebarContent={
        <div class="p-2 space-y-1">
          <For each={mockTabs}>
            {(t) => (
              <div
                class={`px-3 py-2 rounded text-sm cursor-pointer ${t.id === 's2' ? 'bg-surface-700 text-surface-200' : 'text-surface-400 hover:bg-surface-700/50'}`}
              >
                {t.name}
              </div>
            )}
          </For>
        </div>
      }
    >
      <ChatWindow
        messages={mockStreamingMessages}
        connectionState="connected"
        streamingMessageId="6"
        models={mockModels}
        selectedModel="claude-sonnet-4"
        title="API debugging"
      />
    </ChatLayout>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen
      tabs={[{ id: 'new', name: 'New Session', status: 'idle' as const }]}
      activeTabId="new"
      onNewTab={() => {}}
    >
      <ChatWindow
        messages={mockEmptyMessages}
        connectionState="connected"
        models={mockModels}
        title="New Session"
      />
    </ChatLayout>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <ChatLayout
      sidebarOpen={false}
      tabs={[{ id: 'err', name: 'Failed Session', status: 'error' as const }]}
      activeTabId="err"
    >
      <ChatWindow
        messages={[
          { id: '1', role: 'user' as const, content: 'Run the tests' },
          {
            id: '2',
            role: 'system' as const,
            content: 'Error: WebSocket connection lost. Please check your connection.',
          },
        ]}
        connectionState="disconnected"
        title="Failed Session"
      />
    </ChatLayout>
  ),
};
