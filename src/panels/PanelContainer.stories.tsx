import { For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { PanelContainer } from './PanelContainer';
import type { PanelConfig } from './types';

const meta = {
  title: 'Layout/PanelContainer',
  component: PanelContainer,
  tags: ['autodocs'],
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

// Helper to create panel content
const createPanelContent = (name: string) => () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'var(--sk-bg-secondary)',
      padding: '16px',
      color: 'var(--sk-text-primary)',
      'font-family': 'var(--sk-font-family)',
    }}
  >
    <h3 style={{ margin: '0 0 8px 0', 'font-size': '14px', 'font-weight': '600' }}>{name}</h3>
    <p style={{ margin: '0', 'font-size': '12px', color: 'var(--sk-text-secondary)' }}>
      This is the {name.toLowerCase()} panel. You can resize, collapse, and drag it.
    </p>
  </div>
);

// Base panel configs
const explorerPanel: PanelConfig = {
  id: 'explorer',
  title: 'Explorer',
  icon: '📁',
  defaultPosition: 'left',
  defaultSize: 250,
  minSize: 150,
  maxSize: 500,
  collapsible: true,
  closable: true,
  draggable: true,
  render: createPanelContent('Explorer'),
};

const editorPanel: PanelConfig = {
  id: 'editor',
  title: 'Editor',
  icon: '📝',
  defaultPosition: 'center',
  collapsible: true,
  closable: true,
  draggable: true,
  render: createPanelContent('Editor'),
};

const propertiesPanel: PanelConfig = {
  id: 'properties',
  title: 'Properties',
  icon: '⚙️',
  defaultPosition: 'right',
  defaultSize: 300,
  minSize: 200,
  maxSize: 600,
  collapsible: true,
  closable: true,
  draggable: true,
  render: createPanelContent('Properties'),
};

const terminalPanel: PanelConfig = {
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
  render: createPanelContent('Terminal'),
};

export const Default: Story = {
  args: {
    panels: [explorerPanel, editorPanel, propertiesPanel, terminalPanel],
  },
};

export const DragAndDrop: Story = {
  args: {
    panels: [explorerPanel, editorPanel, propertiesPanel, terminalPanel],
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'font-weight': '500',
            'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          🎯 Drag panel headers to reposition them
        </div>
        <Story />
      </div>
    ),
  ],
};

export const TwoPanels: Story = {
  args: {
    panels: [explorerPanel, editorPanel],
  },
};

export const AllPositions: Story = {
  args: {
    panels: [
      {
        id: 'left-panel',
        title: 'Left',
        icon: '⬅️',
        defaultPosition: 'left',
        defaultSize: 200,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Left Panel'),
      },
      {
        id: 'center-panel',
        title: 'Center',
        icon: '📄',
        defaultPosition: 'center',
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Center Panel'),
      },
      {
        id: 'right-panel',
        title: 'Right',
        icon: '➡️',
        defaultPosition: 'right',
        defaultSize: 200,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Right Panel'),
      },
      {
        id: 'bottom-panel',
        title: 'Bottom',
        icon: '⬇️',
        defaultPosition: 'bottom',
        defaultSize: 150,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Bottom Panel'),
      },
    ],
  },
};

export const CollapsiblePanels: Story = {
  args: {
    panels: [
      { ...explorerPanel, collapsible: true },
      { ...editorPanel, collapsible: true },
      { ...propertiesPanel, collapsible: true },
      { ...terminalPanel, collapsible: true },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          🔽 Click collapse buttons — panels collapse to direction-aware bars
        </div>
        <Story />
      </div>
    ),
  ],
};

export const NonDraggable: Story = {
  args: {
    panels: [
      { ...explorerPanel, draggable: false },
      { ...editorPanel, draggable: false },
      { ...propertiesPanel, draggable: false },
      { ...terminalPanel, draggable: false },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          🔒 Panels cannot be dragged (draggable: false)
        </div>
        <Story />
      </div>
    ),
  ],
};

/** Vertical group (left sidebar) with one panel pre-collapsed — shows horizontal bar */
export const CollapsedVertical: Story = {
  args: {
    panels: [
      { ...explorerPanel, collapsible: true },
      {
        id: 'search',
        title: 'Search',
        icon: '🔍',
        defaultPosition: 'left',
        defaultSize: 250,
        minSize: 150,
        maxSize: 500,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Search'),
      },
      editorPanel,
    ],
    initialLayout: {
      panels: {
        search: { collapsed: true } as Partial<PanelState>,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          📐 Vertical group: collapsed panel shows as horizontal bar
        </div>
        <Story />
      </div>
    ),
  ],
};

/** Horizontal group (bottom) with one panel pre-collapsed — shows vertical bar */
export const CollapsedHorizontal: Story = {
  args: {
    panels: [
      editorPanel,
      { ...terminalPanel, collapsible: true },
      {
        id: 'output',
        title: 'Output',
        icon: '📋',
        defaultPosition: 'bottom',
        defaultSize: 200,
        minSize: 100,
        maxSize: 400,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Output'),
      },
    ],
    initialLayout: {
      panels: {
        output: { collapsed: true } as Partial<PanelState>,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          📐 Horizontal group: collapsed panel shows as vertical bar
        </div>
        <Story />
      </div>
    ),
  ],
};

/** All positions with various collapsed states */
export const MixedStates: Story = {
  args: {
    panels: [
      { ...explorerPanel, collapsible: true },
      {
        id: 'search',
        title: 'Search',
        icon: '🔍',
        defaultPosition: 'left',
        defaultSize: 250,
        minSize: 150,
        maxSize: 500,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Search'),
      },
      editorPanel,
      { ...propertiesPanel, collapsible: true },
      { ...terminalPanel, collapsible: true },
      {
        id: 'output',
        title: 'Output',
        icon: '📋',
        defaultPosition: 'bottom',
        defaultSize: 200,
        minSize: 100,
        maxSize: 400,
        collapsible: true,
        closable: true,
        draggable: true,
        render: createPanelContent('Output'),
      },
    ],
    initialLayout: {
      panels: {
        search: { collapsed: true } as Partial<PanelState>,
        properties: { collapsed: true } as Partial<PanelState>,
        output: { collapsed: true } as Partial<PanelState>,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            border: '1px solid var(--sk-border)',
            padding: '12px 24px',
            'border-radius': '8px',
            'z-index': '1000',
            'font-family': 'var(--sk-font-family)',
            'font-size': '14px',
            'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          🎨 Mixed states: Search, Properties, and Output are pre-collapsed
        </div>
        <Story />
      </div>
    ),
  ],
};

/** Islands UI — Fleet-inspired visual separation */
export const Islands: Story = {
  args: {
    panels: [
      {
        id: 'explorer',
        title: 'Explorer',
        icon: '📁',
        defaultPosition: 'left' as const,
        defaultSize: 220,
        collapsible: true,
        closable: true,
        draggable: true,
        render: () => (
          <div style={{ padding: '12px', 'font-size': '13px', color: 'var(--sk-text-secondary)' }}>
            <div
              style={{
                'font-weight': 500,
                'margin-bottom': '8px',
                color: 'var(--sk-text-primary)',
              }}
            >
              Project Files
            </div>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
              <For each={['src/', 'package.json', 'tsconfig.json', 'README.md']}>
                {(f) => (
                  <div style={{ padding: '4px 8px', 'border-radius': '4px', cursor: 'pointer' }}>
                    {f}
                  </div>
                )}
              </For>
            </div>
          </div>
        ),
      },
      {
        id: 'editor',
        title: 'Editor',
        icon: '✏️',
        defaultPosition: 'center' as const,
        defaultSize: 600,
        draggable: true,
        render: () => (
          <div
            style={{
              padding: '16px',
              'font-family': 'monospace',
              'font-size': '13px',
              color: 'var(--sk-text-primary)',
              'line-height': '1.6',
            }}
          >
            <div style={{ color: 'var(--sk-text-muted)' }}>// main.ts</div>
            <div>
              <span style={{ color: '#c678dd' }}>import</span> {'{ createApp }'}{' '}
              <span style={{ color: '#c678dd' }}>from</span>{' '}
              <span style={{ color: '#98c379' }}>'solid-js'</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span style={{ color: '#c678dd' }}>const</span> app ={' '}
              <span style={{ color: '#61afef' }}>createApp</span>()
            </div>
            <div>
              app.<span style={{ color: '#61afef' }}>mount</span>(
              <span style={{ color: '#98c379' }}>'#root'</span>)
            </div>
          </div>
        ),
      },
      {
        id: 'properties',
        title: 'Properties',
        icon: '⚙️',
        defaultPosition: 'right' as const,
        defaultSize: 240,
        collapsible: true,
        closable: true,
        draggable: true,
        render: () => (
          <div style={{ padding: '12px', 'font-size': '12px', color: 'var(--sk-text-secondary)' }}>
            <div
              style={{
                'font-weight': 500,
                'margin-bottom': '8px',
                color: 'var(--sk-text-primary)',
              }}
            >
              File Properties
            </div>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
              <div>Type: TypeScript</div>
              <div>Size: 1.2 KB</div>
              <div>Modified: 2 min ago</div>
              <div>Encoding: UTF-8</div>
            </div>
          </div>
        ),
      },
      {
        id: 'terminal',
        title: 'Terminal',
        icon: '💻',
        defaultPosition: 'bottom' as const,
        defaultSize: 160,
        collapsible: true,
        closable: true,
        draggable: true,
        render: () => (
          <div
            style={{
              padding: '8px 12px',
              'font-family': 'monospace',
              'font-size': '12px',
              color: '#98c379',
            }}
          >
            <div>$ npm run build</div>
            <div style={{ color: 'var(--sk-text-muted)' }}>✓ Built in 2.3s</div>
            <div style={{ color: 'var(--sk-text-muted)' }}>$ █</div>
          </div>
        ),
      },
    ],
    storageKey: 'storybook-islands',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px', width: '100%', 'border-radius': '8px', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};
