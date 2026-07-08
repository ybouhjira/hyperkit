import type { Meta, StoryObj } from 'storybook-solidjs';
import { PanelContainer } from './PanelContainer';
import type { PanelConfig } from './types';
import { FileExplorer } from '../composites/FileExplorer';
import { ChatWindow } from '../composites/ChatWindow';
import { ToolExecution } from '../composites/ToolExecution';
import { mockModels, mockMessages } from '../__fixtures__';
import type { FileItem } from '../composites/FileExplorer';

// Mock project file tree
const projectFiles: FileItem[] = [
  { name: 'src', path: '/project/src', isDirectory: true },
  { name: 'tests', path: '/project/tests', isDirectory: true },
  { name: 'node_modules', path: '/project/node_modules', isDirectory: true },
  { name: 'package.json', path: '/project/package.json', isDirectory: false, size: 1240 },
  { name: 'tsconfig.json', path: '/project/tsconfig.json', isDirectory: false, size: 580 },
  { name: 'README.md', path: '/project/README.md', isDirectory: false, size: 3200 },
  { name: '.gitignore', path: '/project/.gitignore', isDirectory: false, size: 120 },
  { name: 'vite.config.ts', path: '/project/vite.config.ts', isDirectory: false, size: 890 },
];

// Terminal content component
const TerminalContent = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      'background-color': 'rgb(24, 24, 27)',
      padding: '8px 12px',
      'font-family': 'var(--font-mono)',
      'font-size': '12px',
      color: 'rgb(161, 161, 170)',
      'overflow-y': 'auto',
      'white-space': 'pre',
      'line-height': '1.5',
    }}
  >
    <span style={{ color: 'rgb(34, 197, 94)' }}>$</span> npm run build{'\n'}
    <span style={{ color: 'rgb(161, 161, 170)' }}>Building for production...{'\n'}</span>
    <span style={{ color: 'rgb(161, 161, 170)' }}>✓ 42 modules transformed.{'\n'}</span>
    <span style={{ color: 'rgb(161, 161, 170)' }}>dist/index.js 12.4 kB │ gzip: 4.2 kB{'\n'}</span>
    <span style={{ color: 'rgb(161, 161, 170)' }}>dist/index.css 3.1 kB │ gzip: 1.1 kB{'\n'}</span>
    <span style={{ color: 'rgb(34, 197, 94)' }}>✓ built in 1.24s{'\n'}</span>
    <span style={{ color: 'rgb(34, 197, 94)' }}>$</span> npm test{'\n'}
    <span style={{ color: 'rgb(161, 161, 170)' }}>
      {' '}
      ✓ src/auth/middleware.test.ts (4 tests) 23ms{'\n'}
    </span>
    <span style={{ color: 'rgb(161, 161, 170)' }}>
      {' '}
      ✓ src/api/routes.test.ts (8 tests) 45ms{'\n'}
    </span>
    <span style={{ color: 'rgb(161, 161, 170)' }}>
      {' '}
      ✓ src/utils/helpers.test.ts (12 tests) 18ms{'\n'}
    </span>
    <span style={{ color: 'rgb(34, 197, 94)' }}>
      {'\n'} Tests 24 passed{'\n'}
    </span>
    <span style={{ color: 'rgb(34, 197, 94)' }}> Time 0.86s{'\n'}</span>
  </div>
);

// Tools panel content
const ToolsContent = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      'overflow-y': 'auto',
      padding: '8px',
      display: 'flex',
      'flex-direction': 'column',
      gap: '8px',
    }}
  >
    <ToolExecution
      toolName="Read file"
      status="success"
      input="src/auth/middleware.ts"
      output="export const authMiddleware = ..."
      duration={12}
      defaultOpen={true}
    />
    <ToolExecution
      toolName="Bash"
      status="success"
      input="npm run build"
      output="✓ built in 1.24s"
      duration={1240}
    />
    <ToolExecution
      toolName="Edit file"
      status="running"
      input="src/auth/middleware.ts&#10;- Replace JWT validation&#10;+ Use Effect-based validation"
    />
    <ToolExecution
      toolName="Run tests"
      status="error"
      input="npm test"
      output="FAIL src/auth/middleware.test.ts&#10;  × should validate expired tokens"
      duration={860}
    />
  </div>
);

// Panel configurations
const panels: PanelConfig[] = [
  {
    id: 'files',
    title: 'Files',
    icon: '📁',
    defaultPosition: 'left',
    defaultSize: 250,
    minSize: 180,
    maxSize: 400,
    collapsible: true,
    closable: true,
    draggable: true,
    render: () => (
      <FileExplorer
        items={projectFiles}
        currentPath="/project"
        class="h-full border-0 rounded-none"
      />
    ),
  },
  {
    id: 'chat',
    title: 'Chat',
    icon: '💬',
    defaultPosition: 'center',
    collapsible: false,
    closable: false,
    draggable: true,
    render: () => (
      <ChatWindow
        messages={mockMessages}
        connectionState="connected"
        models={mockModels}
        selectedModel="claude-opus-4"
        title="hyperkit dev"
      />
    ),
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: '🔧',
    defaultPosition: 'right',
    defaultSize: 300,
    minSize: 200,
    maxSize: 500,
    collapsible: true,
    closable: true,
    draggable: true,
    render: () => <ToolsContent />,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '💻',
    defaultPosition: 'bottom',
    defaultSize: 200,
    minSize: 100,
    maxSize: 400,
    collapsible: true,
    closable: true,
    draggable: true,
    render: () => <TerminalContent />,
  },
];

const meta = {
  title: 'Pages/IDE Layout',
  component: PanelContainer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IDEMockup: Story = {
  args: {
    panels: panels,
  },
};
