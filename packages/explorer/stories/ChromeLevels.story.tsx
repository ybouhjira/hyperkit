import { defineStory, control } from '../src/api'
import { PanelContainer } from '@ybouhjira/hyperkit'
import type { PanelConfig, ChromeLevel } from '@ybouhjira/hyperkit'

// Helper component for colored placeholder panels
function PanelContent(props: { name: string; color: string; children?: any }) {
  return (
    <div
      style={{
        height: '100%',
        padding: '16px',
        'background-color': props.color,
        color: 'var(--sk-text-primary, #cdd6f4)',
        'font-family': 'system-ui',
      }}
    >
      <h3 style={{ margin: '0 0 8px', 'font-size': '14px', 'font-weight': '600' }}>
        {props.name}
      </h3>
      {props.children}
    </div>
  )
}

// Helper: IDE-like panel configuration (reused across stories)
function createIDEPanels(): PanelConfig[] {
  return [
    {
      id: 'files',
      title: 'Files',
      defaultPosition: 'left',
      defaultSize: 250,
      minSize: 200,
      maxSize: 400,
      collapsible: true,
      closable: true,
      draggable: true,
      render: () => (
        <PanelContent name="Files" color="#1e1e2e">
          <div style={{ 'font-size': '12px', opacity: 0.8 }}>
            📁 src/<br />
            📁 components/<br />
            📁 styles/<br />
            📄 index.tsx
          </div>
        </PanelContent>
      ),
    },
    {
      id: 'editor',
      title: 'Editor',
      defaultPosition: 'center',
      collapsible: true,
      closable: true,
      draggable: true,
      render: () => (
        <PanelContent name="Editor" color="#11111b">
          <div style={{ 'font-size': '12px', 'font-family': 'monospace', opacity: 0.8 }}>
            <div>1 | import {'{'} Component {'}'} from 'solid-js'</div>
            <div>2 | </div>
            <div>3 | export function App() {'{'}</div>
            <div>4 |   return &lt;div&gt;Hello World&lt;/div&gt;</div>
            <div>5 | {'}'}</div>
          </div>
        </PanelContent>
      ),
    },
    {
      id: 'properties',
      title: 'Properties',
      defaultPosition: 'right',
      defaultSize: 250,
      minSize: 200,
      maxSize: 400,
      collapsible: true,
      closable: true,
      draggable: true,
      render: () => (
        <PanelContent name="Properties" color="#1e1e2e">
          <div style={{ 'font-size': '12px', opacity: 0.8 }}>
            <strong>Type:</strong> Component<br />
            <strong>Size:</strong> 2.4 KB<br />
            <strong>Lines:</strong> 45<br />
            <strong>Modified:</strong> 2 mins ago
          </div>
        </PanelContent>
      ),
    },
    {
      id: 'terminal',
      title: 'Terminal',
      defaultPosition: 'bottom',
      defaultSize: 200,
      minSize: 150,
      maxSize: 400,
      collapsible: true,
      closable: true,
      draggable: true,
      render: () => (
        <PanelContent name="Terminal" color="#181825">
          <div style={{ 'font-size': '12px', 'font-family': 'monospace', opacity: 0.8 }}>
            $ npm run dev<br />
            <span style={{ color: '#a6e3a1' }}>✓ Server running on http://localhost:3000</span>
          </div>
        </PanelContent>
      ),
    },
  ]
}

// Story 1: Full Chrome - Developer Mode
export const ChromeFull = defineStory({
  title: 'Chrome: Full (Developer)',
  category: 'Layout/Chrome Levels',
  controls: {
    chromeLevel: control.select(['full', 'minimal', 'none'], 'full', 'Chrome Level'),
  },
  render: () => {
    const panels = createIDEPanels()

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <PanelContainer panels={panels} chrome="full" />
      </div>
    )
  },
})

// Story 2: Minimal Chrome - Dashboard
export const ChromeMinimal = defineStory({
  title: 'Chrome: Minimal (Dashboard)',
  category: 'Layout/Chrome Levels',
  controls: {
    chromeLevel: control.select(['full', 'minimal', 'none'], 'minimal', 'Chrome Level'),
  },
  render: () => {
    const panels: PanelConfig[] = [
      {
        id: 'issues',
        title: 'Issues',
        defaultPosition: 'left',
        defaultSize: 250,
        minSize: 200,
        collapsible: false,
        closable: false,
        draggable: false,
        render: () => (
          <PanelContent name="Issues" color="#1e1e2e">
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '12px',
                'margin-top': '8px',
              }}
            >
              <div
                style={{
                  'font-size': '32px',
                  'font-weight': '700',
                  color: '#f38ba8',
                }}
              >
                12
              </div>
              <div style={{ 'font-size': '14px', opacity: 0.8 }}>Open Issues</div>
            </div>
            <div
              style={{
                'margin-top': '16px',
                'font-size': '12px',
                opacity: 0.6,
              }}
            >
              <div>🔴 High Priority: 3</div>
              <div>🟡 Medium: 5</div>
              <div>🟢 Low: 4</div>
            </div>
          </PanelContent>
        ),
      },
      {
        id: 'graph',
        title: 'Graph',
        defaultPosition: 'center',
        collapsible: false,
        closable: false,
        draggable: false,
        render: () => (
          <PanelContent name="Issue Dependency Graph" color="#11111b">
            <div
              style={{
                'font-size': '12px',
                'font-family': 'monospace',
                opacity: 0.7,
                'margin-top': '16px',
                'line-height': '1.6',
              }}
            >
              <div>     [Issue #1]</div>
              <div>      /      \</div>
              <div> [#2]      [#3]</div>
              <div>   |          |</div>
              <div> [#4]      [#5]</div>
              <div>   \        /</div>
              <div>    [Issue #6]</div>
            </div>
          </PanelContent>
        ),
      },
      {
        id: 'details',
        title: 'Details',
        defaultPosition: 'right',
        defaultSize: 250,
        minSize: 200,
        collapsible: false,
        closable: false,
        draggable: false,
        render: () => (
          <PanelContent name="Details" color="#1e1e2e">
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px', 'margin-top': '8px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  'background-color': '#a6e3a1',
                  color: '#11111b',
                  'border-radius': '4px',
                  'font-size': '12px',
                  'font-weight': '600',
                  'text-align': 'center',
                }}
              >
                Done: 24
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  'background-color': '#f9e2af',
                  color: '#11111b',
                  'border-radius': '4px',
                  'font-size': '12px',
                  'font-weight': '600',
                  'text-align': 'center',
                }}
              >
                In Progress: 8
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  'background-color': '#89b4fa',
                  color: '#11111b',
                  'border-radius': '4px',
                  'font-size': '12px',
                  'font-weight': '600',
                  'text-align': 'center',
                }}
              >
                Open: 12
              </div>
            </div>
          </PanelContent>
        ),
      },
      {
        id: 'chat',
        title: 'Chat',
        defaultPosition: 'bottom',
        defaultSize: 200,
        minSize: 150,
        collapsible: false,
        closable: false,
        draggable: false,
        render: () => (
          <PanelContent name="Chat" color="#181825">
            <div
              style={{
                'font-size': '12px',
                opacity: 0.8,
                'margin-top': '8px',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  'background-color': '#313244',
                  'border-radius': '4px',
                }}
              >
                <div style={{ color: '#89b4fa', 'font-weight': '600' }}>🤖 AI Assistant</div>
                <div style={{ 'margin-top': '4px' }}>Ready to help with your project!</div>
              </div>
            </div>
          </PanelContent>
        ),
      },
    ]

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <PanelContainer panels={panels} chrome="minimal" />
      </div>
    )
  },
})

// Story 3: No Chrome - Focus Mode
export const ChromeNone = defineStory({
  title: 'Chrome: None (Focus)',
  category: 'Layout/Chrome Levels',
  controls: {
    chromeLevel: control.select(['full', 'minimal', 'none'], 'none', 'Chrome Level'),
  },
  render: () => {
    const panels: PanelConfig[] = [
      {
        id: 'chat',
        title: 'Chat',
        defaultPosition: 'center',
        collapsible: false,
        closable: false,
        draggable: false,
        render: () => (
          <div
            style={{
              height: '100%',
              display: 'flex',
              'flex-direction': 'column',
              'justify-content': 'center',
              'align-items': 'center',
              'background-color': '#11111b',
              color: 'var(--sk-text-primary, #cdd6f4)',
              'font-family': 'system-ui',
            }}
          >
            <div
              style={{
                width: '100%',
                'max-width': '600px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  'font-size': '24px',
                  'font-weight': '600',
                  'text-align': 'center',
                  'margin-bottom': '16px',
                  color: '#89b4fa',
                }}
              >
                Focus Mode
              </div>
              <div
                style={{
                  padding: '16px',
                  'background-color': '#1e1e2e',
                  'border-radius': '8px',
                  border: '1px solid #45475a',
                }}
              >
                <input
                  type="text"
                  placeholder="Start a conversation..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    'background-color': '#181825',
                    border: 'none',
                    'border-radius': '4px',
                    color: '#cdd6f4',
                    'font-size': '14px',
                    'font-family': 'system-ui',
                    outline: 'none',
                  }}
                />
                <div
                  style={{
                    'margin-top': '12px',
                    'text-align': 'center',
                    'font-size': '12px',
                    opacity: 0.6,
                  }}
                >
                  No distractions. Just you and your thoughts.
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ]

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <PanelContainer panels={panels} chrome="none" />
      </div>
    )
  },
})

// Story 4: Auto-Hide Chrome
export const ChromeAutoHide = defineStory({
  title: 'Chrome: Auto-Hide',
  category: 'Layout/Chrome Levels',
  render: () => {
    const panels = createIDEPanels()

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            'background-color': '#313244',
            color: '#cdd6f4',
            'font-size': '12px',
            'border-bottom': '1px solid #45475a',
          }}
        >
          💡 Move your mouse over panels to reveal headers
        </div>
        <PanelContainer panels={panels} chrome="auto-hide" />
      </div>
    )
  },
})

// Story 5: Edge Peek Chrome
export const ChromeEdgePeek = defineStory({
  title: 'Chrome: Edge Peek',
  category: 'Layout/Chrome Levels',
  render: () => {
    const panels = createIDEPanels()

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            'background-color': '#313244',
            color: '#cdd6f4',
            'font-size': '12px',
            'border-bottom': '1px solid #45475a',
          }}
        >
          💡 Side panels are collapsed to 4px strips — hover to expand
        </div>
        <PanelContainer panels={panels} chrome="edge-peek" />
      </div>
    )
  },
})

// Story 6: Fade on Idle Chrome
export const ChromeFadeOnIdle = defineStory({
  title: 'Chrome: Fade on Idle',
  category: 'Layout/Chrome Levels',
  render: () => {
    const panels = createIDEPanels()

    return (
      <div
        style={{
          height: '600px',
          border: '1px solid var(--sk-border, #45475a)',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            'background-color': '#313244',
            color: '#cdd6f4',
            'font-size': '12px',
            'border-bottom': '1px solid #45475a',
          }}
        >
          💡 Stop moving your mouse — chrome fades after 3 seconds
        </div>
        <PanelContainer panels={panels} chrome="fade-on-idle" />
      </div>
    )
  },
})
