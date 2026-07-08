import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { TabBar } from './TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Navigation/TabBar',
  component: TabBar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TabBar>;

export const Default: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('tab1');
    const [tabs, setTabs] = createSignal([
      { id: 'tab1', label: 'Main.tsx', icon: 'file' },
      { id: 'tab2', label: 'App.tsx', icon: 'file' },
      { id: 'tab3', label: 'Components', icon: 'folder' },
    ]);

    return (
      <TabBar
        tabs={tabs()}
        activeId={activeId()}
        onSelect={setActiveId}
        onClose={(id) => setTabs(tabs().filter((t) => t.id !== id))}
        onAdd={() => {
          const newId = `tab${tabs().length + 1}`;
          setTabs([...tabs(), { id: newId, label: `New ${tabs().length + 1}`, icon: 'file' }]);
        }}
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('home');
    return (
      <TabBar
        tabs={[
          { id: 'home', label: 'Home', icon: 'home' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
          { id: 'terminal', label: 'Terminal', icon: 'terminal' },
          { id: 'code', label: 'Code', icon: 'code' },
        ]}
        activeId={activeId()}
        onSelect={setActiveId}
      />
    );
  },
};

export const WithColorDots: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('main');
    return (
      <TabBar
        tabs={[
          { id: 'main', label: 'main.ts', icon: 'git-branch', color: '#22c55e' },
          { id: 'feature', label: 'feature/new-ui', icon: 'git-branch', color: '#3b82f6' },
          { id: 'hotfix', label: 'hotfix/bug-123', icon: 'git-branch', color: '#ef4444' },
        ]}
        activeId={activeId()}
        onSelect={setActiveId}
      />
    );
  },
};

export const WithDirtyState: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('file1');
    const [tabs, setTabs] = createSignal([
      { id: 'file1', label: 'App.tsx', icon: 'file', dirty: true },
      { id: 'file2', label: 'index.css', icon: 'file', dirty: false },
      { id: 'file3', label: 'utils.ts', icon: 'file', dirty: true },
    ]);

    return (
      <TabBar
        tabs={tabs()}
        activeId={activeId()}
        onSelect={setActiveId}
        onClose={(id) => setTabs(tabs().filter((t) => t.id !== id))}
      />
    );
  },
};

export const ManyTabs: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('tab5');
    const tabs = Array.from({ length: 15 }, (_, i) => ({
      id: `tab${i + 1}`,
      label: `File-${i + 1}.tsx`,
      icon: 'file',
      dirty: i % 3 === 0,
    }));

    return (
      <TabBar
        tabs={tabs}
        activeId={activeId()}
        onSelect={setActiveId}
        onClose={() => {}}
        onAdd={() => {}}
      />
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const [activeId, setActiveId] = createSignal('tab1');
    return (
      <TabBar
        tabs={[
          { id: 'tab1', label: 'Viewer', icon: 'eye' },
          { id: 'tab2', label: 'Preview', icon: 'play' },
          { id: 'tab3', label: 'History', icon: 'git-commit' },
        ]}
        activeId={activeId()}
        onSelect={setActiveId}
      />
    );
  },
};
