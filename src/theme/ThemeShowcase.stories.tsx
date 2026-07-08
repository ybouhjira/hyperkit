import type { Meta, StoryObj } from 'storybook-solidjs';
import { For } from 'solid-js';
import { ThemeProvider } from './ThemeProvider';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';
import {
  defaultLightTheme,
  highContrastTheme,
  warmDarkTheme,
  oceanTheme,
  roseTheme,
  themePresets,
} from './presets';
import type { ThemeConfig } from './types';

const meta = {
  title: 'Theme/Showcase',
  component: ThemeProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to show a theme preview
const ThemeCard = (props: { theme: ThemeConfig }) => {
  return (
    <ThemeProvider theme={props.theme}>
      <Box
        style={{
          background: 'var(--sk-bg-primary)',
          border: '1px solid var(--sk-border)',
          'border-radius': 'var(--sk-radius-lg)',
          padding: '24px',
          'min-width': '300px',
        }}
      >
        <Text
          style={{
            color: 'var(--sk-text-primary)',
            'font-size': 'var(--sk-font-size-xl)',
            'font-weight': '600',
            'margin-bottom': '16px',
          }}
        >
          {props.theme.name}
        </Text>

        <Box style={{ 'margin-bottom': '16px' }}>
          <Text
            style={{
              color: 'var(--sk-text-secondary)',
              'font-size': 'var(--sk-font-size-sm)',
              'margin-bottom': '8px',
            }}
          >
            ID: {props.theme.id}
          </Text>
        </Box>

        {/* Color palette */}
        <Box style={{ 'margin-bottom': '16px' }}>
          <Text
            style={{
              color: 'var(--sk-text-primary)',
              'font-size': 'var(--sk-font-size-sm)',
              'margin-bottom': '8px',
              'font-weight': '500',
            }}
          >
            Colors:
          </Text>
          <Box style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
            <For
              each={[
                { label: 'Primary', color: props.theme.colors.bgPrimary },
                { label: 'Secondary', color: props.theme.colors.bgSecondary },
                { label: 'Tertiary', color: props.theme.colors.bgTertiary },
                { label: 'Accent', color: props.theme.colors.accent },
              ]}
            >
              {(item) => (
                <Box
                  style={{
                    display: 'flex',
                    'flex-direction': 'column',
                    gap: '4px',
                    'align-items': 'center',
                  }}
                >
                  <Box
                    style={{
                      width: '40px',
                      height: '40px',
                      background: item.color,
                      border: '1px solid var(--sk-border)',
                      'border-radius': 'var(--sk-radius-sm)',
                    }}
                  />
                  <Text
                    style={{
                      color: 'var(--sk-text-muted)',
                      'font-size': '10px',
                    }}
                  >
                    {item.label}
                  </Text>
                </Box>
              )}
            </For>
          </Box>
        </Box>

        {/* Sample UI elements */}
        <Box style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
          <Button variant="primary" size="sm">
            Primary Button
          </Button>
          <Button variant="secondary" size="sm">
            Secondary Button
          </Button>
          <Box
            style={{
              background: 'var(--sk-bg-secondary)',
              padding: '12px',
              'border-radius': 'var(--sk-radius-md)',
            }}
          >
            <Text style={{ color: 'var(--sk-text-primary)' }}>Sample Card</Text>
            <Text
              style={{
                color: 'var(--sk-text-secondary)',
                'font-size': 'var(--sk-font-size-sm)',
              }}
            >
              This is some secondary text
            </Text>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export const NewThemePresets: Story = {
  render: () => {
    const newThemes = [defaultLightTheme, highContrastTheme, warmDarkTheme, oceanTheme, roseTheme];

    return (
      <Box style={{ padding: '24px', background: '#1a1a1a' }}>
        <Box style={{ 'margin-bottom': '32px' }}>
          <Text
            style={{
              color: '#ffffff',
              'font-size': '32px',
              'font-weight': 'bold',
              'margin-bottom': '8px',
            }}
          >
            New Theme Presets
          </Text>
          <Text style={{ color: '#999999', 'font-size': '16px' }}>
            5 new built-in themes for SolidKit
          </Text>
        </Box>

        <Box
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <For each={newThemes}>{(theme) => <ThemeCard theme={theme} />}</For>
        </Box>
      </Box>
    );
  },
};

export const AllThemePresets: Story = {
  render: () => {
    const allThemes = Object.values(themePresets);

    return (
      <Box style={{ padding: '24px', background: '#1a1a1a' }}>
        <Box style={{ 'margin-bottom': '32px' }}>
          <Text
            style={{
              color: '#ffffff',
              'font-size': '32px',
              'font-weight': 'bold',
              'margin-bottom': '8px',
            }}
          >
            All Theme Presets
          </Text>
          <Text style={{ color: '#999999', 'font-size': '16px' }}>
            Complete collection of {allThemes.length} built-in themes
          </Text>
        </Box>

        <Box
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <For each={allThemes}>{(theme) => <ThemeCard theme={theme} />}</For>
        </Box>
      </Box>
    );
  },
};

export const DefaultLight: Story = {
  render: () => <ThemeCard theme={defaultLightTheme} />,
};

export const HighContrast: Story = {
  render: () => <ThemeCard theme={highContrastTheme} />,
};

export const WarmDark: Story = {
  render: () => <ThemeCard theme={warmDarkTheme} />,
};

export const Ocean: Story = {
  render: () => <ThemeCard theme={oceanTheme} />,
};

export const Rose: Story = {
  render: () => <ThemeCard theme={roseTheme} />,
};
