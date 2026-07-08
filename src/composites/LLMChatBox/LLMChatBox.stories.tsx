import type { Meta, StoryObj } from 'storybook-solidjs';
import { LLMChatBox } from './LLMChatBox';
import { createLLMUIController } from '../../hooks/createLLMUIController';
import { createMockLLMAdapter } from '../../__fixtures__/mockLLMAdapter';
import { createSignal } from 'solid-js';

const meta: Meta<typeof LLMChatBox> = {
  title: 'Composites/LLMChatBox',
  component: LLMChatBox,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof LLMChatBox>;

// Interactive demo with mock LLM + live UI feedback
export const InteractiveDemo: Story = {
  render: () => {
    const adapter = createMockLLMAdapter(600);
    const controller = createLLMUIController({
      adapter,
      systemPrompt:
        'You are an AI assistant controlling an IDE interface. Help users navigate, customize themes, switch views, and manage sessions.',
    });

    // Register demo actions with visual feedback
    const [lastAction, setLastAction] = createSignal<string>('');
    const [currentTheme, setCurrentTheme] = createSignal('cursor');
    const [currentView, setCurrentView] = createSignal('card-grid');
    const [panels, setPanels] = createSignal({ left: true, right: true, bottom: false });
    const [searchQuery, setSearchQuery] = createSignal('');

    controller.registerAction({
      name: 'switchTheme',
      description: 'Switch the UI theme',
      parameters: { themeId: { type: 'string', description: 'Theme ID to switch to' } },
      handler: (params) => {
        setCurrentTheme(params.themeId as string);
        setLastAction(`Theme → ${params.themeId}`);
      },
    });

    controller.registerAction({
      name: 'changeView',
      description: 'Change the session list view mode',
      parameters: {
        viewMode: { type: 'string', description: 'View mode: card-grid, table, timeline, kanban' },
      },
      handler: (params) => {
        setCurrentView(params.viewMode as string);
        setLastAction(`View → ${params.viewMode}`);
      },
    });

    controller.registerAction({
      name: 'togglePanel',
      description: 'Toggle a panel',
      parameters: {
        panelId: { type: 'string', description: 'Panel: left, right, bottom' },
        collapsed: { type: 'boolean', description: 'Whether to collapse' },
      },
      handler: (params) => {
        const id = params.panelId as string;
        const collapsed = params.collapsed as boolean;
        setPanels((prev) => ({ ...prev, [id]: !collapsed }));
        setLastAction(`Panel ${id} → ${collapsed ? 'collapsed' : 'expanded'}`);
      },
    });

    controller.registerAction({
      name: 'filterSessions',
      description: 'Filter sessions by project',
      parameters: { projectFilter: { type: 'string', description: 'Project name' } },
      handler: (params) => {
        setLastAction(`Filter → ${params.projectFilter}`);
      },
    });

    controller.registerAction({
      name: 'searchSessions',
      description: 'Search sessions',
      parameters: { query: { type: 'string', description: 'Search query' } },
      handler: (params) => {
        setSearchQuery(params.query as string);
        setLastAction(`Search → "${params.query}"`);
      },
    });

    controller.registerAction({
      name: 'createSession',
      description: 'Open create session dialog',
      parameters: {},
      handler: () => {
        setLastAction('Create Session dialog opened');
      },
    });

    controller.registerAction({
      name: 'changeFont',
      description: 'Change the code font',
      parameters: { font: { type: 'string', description: 'Font name' } },
      handler: (params) => {
        setLastAction(`Font → ${params.font}`);
      },
    });

    return (
      <div class="flex gap-4 h-[600px] bg-zinc-950 p-4 rounded-xl">
        {/* IDE State Panel - shows current state */}
        <div class="flex-1 flex flex-col gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            IDE State (Live)
          </h3>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center p-2 bg-zinc-800 rounded">
              <span class="text-zinc-400">Theme</span>
              <span class="text-blue-400 font-mono">{currentTheme()}</span>
            </div>
            <div class="flex justify-between items-center p-2 bg-zinc-800 rounded">
              <span class="text-zinc-400">View Mode</span>
              <span class="text-green-400 font-mono">{currentView()}</span>
            </div>
            <div class="flex justify-between items-center p-2 bg-zinc-800 rounded">
              <span class="text-zinc-400">Left Panel</span>
              <span class={panels().left ? 'text-green-400' : 'text-red-400'}>
                {panels().left ? 'Open' : 'Closed'}
              </span>
            </div>
            <div class="flex justify-between items-center p-2 bg-zinc-800 rounded">
              <span class="text-zinc-400">Right Panel</span>
              <span class={panels().right ? 'text-green-400' : 'text-red-400'}>
                {panels().right ? 'Open' : 'Closed'}
              </span>
            </div>
            <div class="flex justify-between items-center p-2 bg-zinc-800 rounded">
              <span class="text-zinc-400">Search</span>
              <span class="text-yellow-400 font-mono">{searchQuery() || '—'}</span>
            </div>
          </div>

          {lastAction() && (
            <div class="mt-auto p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div class="text-xs text-blue-400 font-semibold mb-1">Last Action</div>
              <div class="text-sm text-blue-300 font-mono">{lastAction()}</div>
            </div>
          )}

          <div class="mt-2 text-xs text-zinc-600">
            Try: "Switch theme to warp" or "Show as kanban view"
          </div>
        </div>

        {/* Chat Box */}
        <div class="w-[380px]">
          <LLMChatBox
            controller={controller}
            title="IDE Assistant"
            placeholder="Ask me to change the UI..."
          />
        </div>
      </div>
    );
  },
};

// Simple chat only
export const ChatOnly: Story = {
  render: () => {
    const adapter = createMockLLMAdapter(400);
    const controller = createLLMUIController({ adapter });

    return (
      <div class="h-[500px] w-[380px] bg-zinc-950 p-4">
        <LLMChatBox controller={controller} />
      </div>
    );
  },
};

// With custom styling
export const CustomStyling: Story = {
  render: () => {
    const adapter = createMockLLMAdapter(400);
    const controller = createLLMUIController({
      adapter,
      systemPrompt: 'You are a helpful assistant.',
    });

    // Register a simple action
    controller.registerAction({
      name: 'greet',
      description: 'Greet the user',
      parameters: { name: { type: 'string', description: 'User name' } },
      handler: (params) => {
        console.log(`Greeting ${params.name}`);
      },
    });

    return (
      <div class="h-[600px] w-[450px] bg-gradient-to-br from-purple-950 to-zinc-950 p-6 rounded-2xl">
        <LLMChatBox
          controller={controller}
          title="Custom Assistant"
          placeholder="Type your message here..."
          class="shadow-2xl"
        />
      </div>
    );
  },
};

// Error state demonstration
export const WithError: Story = {
  render: () => {
    const adapter = createMockLLMAdapter(400);
    const controller = createLLMUIController({ adapter });

    // Trigger an error after mount
    setTimeout(() => {
      controller.sendMessage('test').catch(() => {
        // Error handled in controller
      });
    }, 500);

    return (
      <div class="h-[500px] w-[380px] bg-zinc-950 p-4">
        <LLMChatBox controller={controller} />
      </div>
    );
  },
};
