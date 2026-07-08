import type { Meta, StoryObj } from 'storybook-solidjs';
import { onMount, For, createSignal } from 'solid-js';
import { themePresets } from '../theme/presets';
import { applyThemeToElement } from '../theme/ThemeProvider';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Input } from '../primitives/Input';
import { REQUIRED_CSS_VARS } from '../theme/auditThemeVars';

/** Theme-scoped container using ref + applyThemeToElement */
const ScopedTheme = (props: { themeId: string; children: import('solid-js').JSX.Element }) => {
  let ref!: HTMLDivElement;
  const theme = themePresets[props.themeId];

  onMount(() => {
    if (ref && theme) {
      applyThemeToElement(theme, ref);
    }
  });

  return (
    <div
      ref={ref}
      style={{
        padding: '20px',
        'border-radius': '8px',
        border: '1px solid #444',
        'background-color': 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
        'font-family': 'var(--sk-font-ui)',
        flex: '1',
        'min-width': '0',
      }}
    >
      <div
        style={{
          'font-size': '14px',
          'font-weight': '600',
          'margin-bottom': '16px',
          'padding-bottom': '8px',
          'border-bottom': '1px solid var(--sk-border)',
        }}
      >
        {theme?.name ?? props.themeId}
      </div>
      {props.children}
    </div>
  );
};

/** Rich component showcase for comparison */
const ComparisonSample = () => (
  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
    {/* Buttons row */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Buttons
      </div>
      <div style={{ display: 'flex', gap: '6px', 'flex-wrap': 'wrap' }}>
        <Button variant="primary" size="sm">
          Primary
        </Button>
        <Button variant="secondary" size="sm">
          Secondary
        </Button>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button variant="danger" size="sm">
          Danger
        </Button>
      </div>
    </div>
    {/* Input */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Input
      </div>
      <Input placeholder="Type something..." />
    </div>
    {/* Badges */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Badges
      </div>
      <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
      </div>
    </div>
    {/* Color swatches */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Colors
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-accent)',
          }}
          title="accent"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-success)',
          }}
          title="success"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-warning)',
          }}
          title="warning"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-error)',
          }}
          title="error"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-info)',
          }}
          title="info"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-bg-secondary)',
          }}
          title="bg-secondary"
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            background: 'var(--sk-bg-tertiary)',
          }}
          title="bg-tertiary"
        />
      </div>
    </div>
    {/* Typography samples */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Typography
      </div>
      <div style={{ 'font-size': 'var(--sk-font-size-xs)', color: 'var(--sk-text-muted)' }}>
        Extra small (muted)
      </div>
      <div style={{ 'font-size': 'var(--sk-font-size-sm)', color: 'var(--sk-text-secondary)' }}>
        Small (secondary)
      </div>
      <div style={{ 'font-size': 'var(--sk-font-size-base)', color: 'var(--sk-text-primary)' }}>
        Base (primary)
      </div>
      <div style={{ 'font-size': 'var(--sk-font-size-lg)', 'font-weight': '600' }}>Large bold</div>
    </div>
    {/* Surfaces */}
    <div>
      <div
        style={{
          'font-size': '11px',
          'text-transform': 'uppercase',
          opacity: '0.5',
          'margin-bottom': '6px',
        }}
      >
        Surfaces
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div
          style={{
            padding: '8px 12px',
            'border-radius': 'var(--sk-radius-md)',
            background: 'var(--sk-surface-base-bg)',
            border: '1px solid var(--sk-border-subtle)',
            'font-size': '11px',
          }}
        >
          Base
        </div>
        <div
          style={{
            padding: '8px 12px',
            'border-radius': 'var(--sk-radius-md)',
            background: 'var(--sk-surface-raised-bg)',
            border: '1px solid var(--sk-border-subtle)',
            'font-size': '11px',
          }}
        >
          Raised
        </div>
        <div
          style={{
            padding: '8px 12px',
            'border-radius': 'var(--sk-radius-md)',
            background: 'var(--sk-surface-sunken-bg)',
            border: '1px solid var(--sk-border-subtle)',
            'font-size': '11px',
          }}
        >
          Sunken
        </div>
      </div>
    </div>
  </div>
);

/** CSS var diff between two themes */
const CSSVarDiff = (props: { leftId: string; rightId: string }) => {
  const leftTheme = themePresets[props.leftId];
  const rightTheme = themePresets[props.rightId];

  if (!leftTheme || !rightTheme) return <div>Invalid themes</div>;

  // Create temp elements to extract CSS vars
  const getVarValues = (theme: typeof leftTheme) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    applyThemeToElement(theme, el);
    const values: Record<string, string> = {};
    for (const varName of REQUIRED_CSS_VARS) {
      values[varName] = el.style.getPropertyValue(varName);
    }
    document.body.removeChild(el);
    return values;
  };

  const leftVars = getVarValues(leftTheme);
  const rightVars = getVarValues(rightTheme);

  // Find differences
  const diffs = REQUIRED_CSS_VARS.filter((v) => leftVars[v] !== rightVars[v]);

  return (
    <div
      style={{
        'max-height': '300px',
        overflow: 'auto',
        'font-family': 'ui-monospace, monospace',
        'font-size': '11px',
        background: '#1a1a2e',
        'border-radius': '6px',
        padding: '12px',
      }}
    >
      <div style={{ color: '#888', 'margin-bottom': '8px' }}>
        {diffs.length} of {REQUIRED_CSS_VARS.length} variables differ
      </div>
      <For each={diffs}>
        {(varName) => (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '2px 0',
              'border-bottom': '1px solid #222',
            }}
          >
            <span style={{ color: '#888', 'min-width': '200px' }}>
              {varName.replace('--sk-', '')}
            </span>
            <span style={{ color: '#ff6b6b' }}>{leftVars[varName] || '(unset)'}</span>
            <span style={{ color: '#666' }}>→</span>
            <span style={{ color: '#51cf66' }}>{rightVars[varName] || '(unset)'}</span>
          </div>
        )}
      </For>
    </div>
  );
};

const meta: Meta = {
  title: 'Theme/Comparison',
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [1400] },
  },
};

export default meta;
type Story = StoryObj;

/** Side-by-side comparison of two themes with CSS var diff */
export const SideBySide: Story = {
  render: () => {
    const themeIds = Object.keys(themePresets);
    const [leftId, setLeftId] = createSignal('zed-dark');
    const [rightId, setRightId] = createSignal('macos-light');
    const [showDiff, setShowDiff] = createSignal(false);

    return (
      <div style={{ padding: '24px', background: '#111', 'min-height': '100vh' }}>
        {/* Theme selectors */}
        <div
          style={{ display: 'flex', gap: '16px', 'margin-bottom': '20px', 'align-items': 'center' }}
        >
          <label style={{ color: '#aaa', 'font-size': '13px' }}>
            Left:
            <select
              style={{
                'margin-left': '8px',
                padding: '4px 8px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                'border-radius': '4px',
              }}
              onChange={(e) => setLeftId(e.currentTarget.value)}
              value={leftId()}
            >
              <For each={themeIds}>
                {(id) => <option value={id}>{themePresets[id].name}</option>}
              </For>
            </select>
          </label>
          <label style={{ color: '#aaa', 'font-size': '13px' }}>
            Right:
            <select
              style={{
                'margin-left': '8px',
                padding: '4px 8px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                'border-radius': '4px',
              }}
              onChange={(e) => setRightId(e.currentTarget.value)}
              value={rightId()}
            >
              <For each={themeIds}>
                {(id) => <option value={id}>{themePresets[id].name}</option>}
              </For>
            </select>
          </label>
          <button
            onClick={() => setShowDiff((prev) => !prev)}
            style={{
              padding: '4px 12px',
              background: showDiff() ? '#6750A4' : '#333',
              color: '#fff',
              border: 'none',
              'border-radius': '4px',
              cursor: 'pointer',
              'font-size': '12px',
            }}
          >
            {showDiff() ? 'Hide' : 'Show'} CSS Var Diff
          </button>
        </div>

        {/* Side by side panels */}
        <div style={{ display: 'flex', gap: '16px', 'margin-bottom': '20px' }}>
          <ScopedTheme themeId={leftId()}>
            <ComparisonSample />
          </ScopedTheme>
          <ScopedTheme themeId={rightId()}>
            <ComparisonSample />
          </ScopedTheme>
        </div>

        {/* CSS Var diff */}
        {showDiff() && <CSSVarDiff leftId={leftId()} rightId={rightId()} />}
      </div>
    );
  },
};

/** Platform pair comparison: Light vs Dark for each platform */
export const PlatformPairs: Story = {
  render: () => {
    const pairs = [
      { light: 'macos-light', dark: 'macos-dark', label: 'macOS' },
      { light: 'windows-light', dark: 'windows-dark', label: 'Windows' },
      { light: 'ubuntu-light', dark: 'ubuntu-dark', label: 'Ubuntu' },
      { light: 'material-light', dark: 'material-dark', label: 'Material' },
    ];

    return (
      <div
        style={{
          padding: '24px',
          background: '#111',
          display: 'flex',
          'flex-direction': 'column',
          gap: '32px',
        }}
      >
        <For each={pairs}>
          {(pair) => (
            <div>
              <h2
                style={{
                  color: '#fff',
                  'font-size': '16px',
                  'font-weight': '600',
                  'margin-bottom': '12px',
                }}
              >
                {pair.label}
              </h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                <ScopedTheme themeId={pair.light}>
                  <ComparisonSample />
                </ScopedTheme>
                <ScopedTheme themeId={pair.dark}>
                  <ComparisonSample />
                </ScopedTheme>
              </div>
            </div>
          )}
        </For>
      </div>
    );
  },
};
