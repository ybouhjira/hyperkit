import type { Meta, StoryObj } from 'storybook-solidjs';
import { onMount, For } from 'solid-js';
import { themePresets } from '../theme/presets';
import { applyThemeToElement } from '../theme/ThemeProvider';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Input } from '../primitives/Input';

/**
 * Renders a component sample inside a theme-scoped container.
 * Uses a ref + onMount to apply CSS vars to the container div.
 */
const ThemeCell = (props: { themeId: string; children: import('solid-js').JSX.Element }) => {
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
        padding: '16px',
        'border-radius': '8px',
        border: '1px solid #333',
        'background-color': 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
        'font-family': 'var(--sk-font-ui)',
        'min-width': '260px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          'font-size': '11px',
          'font-weight': '600',
          'margin-bottom': '12px',
          opacity: '0.7',
          'text-transform': 'uppercase',
          'letter-spacing': '0.5px',
        }}
      >
        {theme?.name ?? props.themeId}
      </div>
      {props.children}
    </div>
  );
};

/** Standard component sample rendered in each cell */
const ComponentSample = () => (
  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
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
    <Input placeholder="Type something..." />
    <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Theme/Matrix',
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [1400] },
  },
};

export default meta;
type Story = StoryObj;

/** All 20 themes rendered in a responsive grid */
export const AllThemes: Story = {
  render: () => {
    const themeIds = Object.keys(themePresets);
    return (
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '24px',
          background: '#111',
        }}
      >
        <For each={themeIds}>
          {(id) => (
            <ThemeCell themeId={id}>
              <ComponentSample />
            </ThemeCell>
          )}
        </For>
      </div>
    );
  },
};

/** Light themes only */
export const LightThemes: Story = {
  render: () => {
    const lightIds = Object.keys(themePresets).filter(
      (id) => themePresets[id].appearance === 'light'
    );
    return (
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '24px',
          background: '#eee',
        }}
      >
        <For each={lightIds}>
          {(id) => (
            <ThemeCell themeId={id}>
              <ComponentSample />
            </ThemeCell>
          )}
        </For>
      </div>
    );
  },
};

/** Dark themes only */
export const DarkThemes: Story = {
  render: () => {
    const darkIds = Object.keys(themePresets).filter(
      (id) => themePresets[id].appearance === 'dark'
    );
    return (
      <div
        style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '24px',
          background: '#111',
        }}
      >
        <For each={darkIds}>
          {(id) => (
            <ThemeCell themeId={id}>
              <ComponentSample />
            </ThemeCell>
          )}
        </For>
      </div>
    );
  },
};

/** Platform-grouped themes (macOS, Windows, Ubuntu, Material) */
export const ByPlatform: Story = {
  render: () => {
    const platforms = ['macos', 'windows', 'ubuntu', 'material'] as const;
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
        <For each={[...platforms]}>
          {(platform) => {
            const ids = Object.keys(themePresets).filter(
              (id) => themePresets[id].platform === platform
            );
            return (
              <div>
                <h2
                  style={{
                    color: '#fff',
                    'font-size': '18px',
                    'font-weight': '600',
                    'margin-bottom': '12px',
                    'text-transform': 'capitalize',
                  }}
                >
                  {platform}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <For each={ids}>
                    {(id) => (
                      <ThemeCell themeId={id}>
                        <ComponentSample />
                      </ThemeCell>
                    )}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    );
  },
};
