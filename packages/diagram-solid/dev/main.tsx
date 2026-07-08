import { render } from 'solid-js/web';
import { createSignal, For, onMount, Show, type JSX } from 'solid-js';
import { ThemeProvider, useTheme } from '@ybouhjira/hyperkit';
import '../../../src/styles.css';

// Showcase stories from file 1
import {
  BusinessProcessFlowchart,
  MultiTierArchitecture,
  NetworkTopology,
  OrganizationChart,
  OrderStateMachine,
  BlogERDiagram,
  PackageDependencies,
  PlatformMindmap,
} from '../src/ShowcaseDiagrams.stories';

// Showcase stories from file 2
import {
  NodeEditorPipeline,
  UmlClassDiagram,
  AuthenticationMessageFlow,
  SolidKitComponentCatalog,
} from '../src/ShowcaseDiagrams2.stories';

interface Story {
  name?: string;
  render: () => JSX.Element;
}

const stories: Array<{ key: string; story: Story }> = [
  { key: 'BusinessProcessFlowchart', story: BusinessProcessFlowchart as Story },
  { key: 'MultiTierArchitecture', story: MultiTierArchitecture as Story },
  { key: 'NetworkTopology', story: NetworkTopology as Story },
  { key: 'OrganizationChart', story: OrganizationChart as Story },
  { key: 'OrderStateMachine', story: OrderStateMachine as Story },
  { key: 'BlogERDiagram', story: BlogERDiagram as Story },
  { key: 'PackageDependencies', story: PackageDependencies as Story },
  { key: 'PlatformMindmap', story: PlatformMindmap as Story },
  { key: 'NodeEditorPipeline', story: NodeEditorPipeline as Story },
  { key: 'UmlClassDiagram', story: UmlClassDiagram as Story },
  { key: 'AuthenticationMessageFlow', story: AuthenticationMessageFlow as Story },
  { key: 'SolidKitComponentCatalog', story: SolidKitComponentCatalog as Story },
];

const THEME_KEY = 'sk-diagram-theme';

function AppContent() {
  const getInitialStory = () => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('story');
    return s ? parseInt(s, 10) : 0;
  };
  const [selected, setSelected] = createSignal(getInitialStory());

  const hideChrome = () =>
    new URLSearchParams(window.location.search).get('hideChrome') === 'true';

  const { setTheme, themes } = useTheme();

  const getInitialTheme = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('theme') ?? localStorage.getItem(THEME_KEY) ?? 'zed-dark';
  };

  const [currentThemeId, setCurrentThemeId] = createSignal(getInitialTheme());

  onMount(() => {
    setTheme(getInitialTheme());
  });

  const handleThemeChange = (id: string) => {
    setCurrentThemeId(id);
    setTheme(id);
    localStorage.setItem(THEME_KEY, id);
  };

  const currentStory = () => stories[selected()];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--sk-bg-primary)',
      'font-family': 'var(--sk-font-ui, system-ui, sans-serif)',
    }}>
      {/* Sidebar */}
      <Show when={!hideChrome()}>
        <nav style={{
          width: '240px',
          'min-width': '240px',
          background: 'var(--sk-bg-secondary)',
          'border-right': '1px solid var(--sk-border)',
          display: 'flex',
          'flex-direction': 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px',
            'border-bottom': '1px solid var(--sk-border)',
            'flex-shrink': '0',
          }}>
            <div style={{
              'font-size': '11px',
              'font-weight': '600',
              'text-transform': 'uppercase',
              'letter-spacing': '0.08em',
              color: 'var(--sk-text-muted)',
            }}>
              Diagram Showcase
            </div>
            <div style={{
              'font-size': '12px',
              color: 'var(--sk-text-secondary)',
              'margin-top': '4px',
            }}>
              {stories.length} diagrams
            </div>
          </div>

          <div style={{
            'overflow-y': 'auto',
            flex: '1',
            padding: '8px 0',
          }}>
            <For each={stories}>
              {(item, index) => {
                const label = item.story.name ?? item.key;
                const isActive = () => selected() === index();

                return (
                  <button
                    onClick={() => setSelected(index())}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '9px 16px',
                      background: isActive()
                        ? 'var(--sk-accent-muted, color-mix(in srgb, var(--sk-accent) 15%, transparent))'
                        : 'transparent',
                      'border-left': isActive() ? '2px solid var(--sk-accent)' : '2px solid transparent',
                      border: 'none',
                      'border-top': 'none',
                      'border-bottom': 'none',
                      'border-right': 'none',
                      'text-align': 'left',
                      cursor: 'pointer',
                      color: isActive() ? 'var(--sk-text-primary)' : 'var(--sk-text-secondary)',
                      'font-size': '13px',
                      'line-height': '1.4',
                      transition: 'all 0.12s ease',
                      'box-sizing': 'border-box',
                    }}
                  >
                    <span style={{
                      display: 'block',
                      'font-size': '11px',
                      color: isActive() ? 'var(--sk-accent)' : 'var(--sk-text-muted)',
                      'margin-bottom': '2px',
                      'font-variant-numeric': 'tabular-nums',
                    }}>
                      {String(index() + 1).padStart(2, '0')}
                    </span>
                    {label}
                  </button>
                );
              }}
            </For>
          </div>

          <div style={{
            padding: '12px 16px',
            'border-top': '1px solid var(--sk-border)',
            'font-size': '11px',
            color: 'var(--sk-text-muted)',
            'flex-shrink': '0',
          }}>
            @ybouhjira/diagram-solid
          </div>
        </nav>
      </Show>

      {/* Main content area */}
      <main style={{
        flex: '1',
        overflow: 'auto',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-bg-primary)',
      }}>
        {/* Header bar */}
        <Show when={!hideChrome()}>
          <div style={{
            padding: '10px 20px',
            'border-bottom': '1px solid var(--sk-border)',
            'flex-shrink': '0',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'space-between',
          }}>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
              <span style={{ color: 'var(--sk-text-muted)', 'font-size': '12px' }}>
                {String(selected() + 1).padStart(2, '0')} /
              </span>
              <span style={{
                color: 'var(--sk-text-primary)',
                'font-size': '14px',
                'font-weight': '500',
              }}>
                {currentStory()!.story.name ?? currentStory()!.key}
              </span>
            </div>

            <select
              value={currentThemeId()}
              onChange={(e) => handleThemeChange(e.currentTarget.value)}
              style={{
                background: 'var(--sk-bg-secondary)',
                color: 'var(--sk-text-primary)',
                border: '1px solid var(--sk-border)',
                'border-radius': 'var(--sk-radius-sm, 4px)',
                padding: '4px 8px',
                'font-size': '12px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <For each={themes}>
                {(t) => <option value={t.id}>{t.name}</option>}
              </For>
            </select>
          </div>
        </Show>

        {/* Diagram render area */}
        <div style={{
          flex: '1',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: '24px',
          overflow: 'auto',
        }}>
          {currentStory()!.story.render()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <style>{`
        :root {
          --sk-diagram-bg: var(--sk-bg-primary);
          --sk-diagram-grid-color: var(--sk-border-subtle, var(--sk-border));
          --sk-diagram-grid-color-major: var(--sk-border);
          --sk-diagram-node-fill: var(--sk-bg-secondary);
          --sk-diagram-node-stroke: var(--sk-border);
          --sk-diagram-node-label-color: var(--sk-text-primary);
          --sk-diagram-select-stroke: var(--sk-accent);
          --sk-diagram-edge-stroke: var(--sk-text-muted);
          --sk-diagram-edge-label-color: var(--sk-text-secondary);
          --sk-diagram-edge-label-border: var(--sk-border);
          --sk-diagram-port-label-color: var(--sk-text-muted);
          --sk-diagram-port-compatible-color: var(--sk-success);
          --sk-diagram-port-incompatible-color: var(--sk-error);
        }
      `}</style>
      <AppContent />
    </ThemeProvider>
  );
}

const root = document.getElementById('app');
if (root) {
  render(() => <App />, root);
}
