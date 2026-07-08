import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Stack } from '../../primitives/Stack';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import {
  SettingsPanel,
  AppearancePanel,
  AnimationPanel,
  LayoutPanel,
  createSettingsStore,
} from './index';
import type { SettingsConfig } from './types';
import type { ThemeConfig } from '../../theme/types';
import {
  zedDarkTheme,
  zedLightTheme,
  cursorDarkTheme,
  cursorLightTheme,
  linearTheme,
  githubDarkTheme,
  githubLightTheme,
} from '../../theme/presets';

const meta = {
  title: 'Composites/SettingsPanel',
  component: SettingsPanel,
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full-height themed surface; `fontSize` (px from a number control) scales demo text. */
const DemoSurface = (props: { children: JSX.Element; fontSize?: number }) => (
  <Box
    p="xl"
    bg="primary"
    minH="100vh"
    style={props.fontSize === undefined ? undefined : { 'font-size': `${props.fontSize}px` }}
  >
    {props.children}
  </Box>
);

/** Monospace JSON dump panel used to echo the live settings object. */
const JsonBlock = (props: { children: JSX.Element }) => (
  <Box
    p="md"
    bg="tertiary"
    borderRadius="sm"
    style={{ 'font-family': 'var(--sk-font-code)', 'white-space': 'pre-wrap' }}
  >
    <Text size="sm" color="secondary" font="mono" whiteSpace="pre-wrap">
      {props.children}
    </Text>
  </Box>
);

const availableThemes = [
  { id: 'zed-dark', name: 'Zed Dark' },
  { id: 'zed-light', name: 'Zed Light' },
  { id: 'cursor-dark', name: 'Cursor Dark' },
  { id: 'cursor-light', name: 'Cursor Light' },
  { id: 'linear', name: 'Linear' },
  { id: 'github-dark', name: 'GitHub Dark' },
  { id: 'github-light', name: 'GitHub Light' },
];

const themeMap: Record<string, ThemeConfig> = {
  'zed-dark': zedDarkTheme,
  'zed-light': zedLightTheme,
  'cursor-dark': cursorDarkTheme,
  'cursor-light': cursorLightTheme,
  linear: linearTheme,
  'github-dark': githubDarkTheme,
  'github-light': githubLightTheme,
};

function SettingsPanelDemo() {
  const { defaultSettings } = createSettingsStore();
  const [settings, setSettings] = createSignal<SettingsConfig>(defaultSettings);

  const handleChange = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    console.log('Settings changed:', newSettings);
  };

  const currentTheme = () => themeMap[settings().appearance.themeId] || zedDarkTheme;

  return (
    <ThemeProvider theme={currentTheme()}>
      <DemoSurface fontSize={settings().appearance.fontSize}>
        <Stack gap="xl">
          <SettingsPanel
            settings={settings()}
            onChange={handleChange}
            availableThemes={availableThemes}
          />

          {/* Current Settings JSON */}
          <Box
            p="lg"
            bg="secondary"
            borderRadius="md"
            style={{ border: '1px solid var(--sk-border)' }}
          >
            <Stack gap="md">
              <Text weight="semibold" color="primary" size="lg">
                Current Settings
              </Text>
              <Box
                p="md"
                bg="tertiary"
                borderRadius="sm"
                style={{ 'font-family': 'var(--sk-font-code)', 'white-space': 'pre-wrap' }}
              >
                <Text size="sm" color="secondary" font="mono" whiteSpace="pre-wrap">
                  {JSON.stringify(settings(), null, 2)}
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DemoSurface>
    </ThemeProvider>
  );
}

export const Default: Story = {
  render: () => <SettingsPanelDemo />,
};

function AppearancePanelDemo() {
  const [settings, setSettings] = createSignal({
    themeId: 'zed-dark',
    fontSize: 16,
  });

  const currentTheme = () => themeMap[settings().themeId] || zedDarkTheme;

  return (
    <ThemeProvider theme={currentTheme()}>
      <DemoSurface fontSize={settings().fontSize}>
        <Stack gap="xl">
          <AppearancePanel
            settings={settings()}
            onChange={setSettings}
            availableThemes={availableThemes}
          />

          <JsonBlock>{JSON.stringify(settings(), null, 2)}</JsonBlock>
        </Stack>
      </DemoSurface>
    </ThemeProvider>
  );
}

export const AppearanceOnly: Story = {
  render: () => <AppearancePanelDemo />,
};

function AnimationPanelDemo() {
  const [settings, setSettings] = createSignal({
    enabled: true,
    speed: 'normal' as const,
  });

  return (
    <ThemeProvider theme={zedDarkTheme}>
      <DemoSurface>
        <Stack gap="xl">
          <AnimationPanel settings={settings()} onChange={setSettings} />

          <JsonBlock>{JSON.stringify(settings(), null, 2)}</JsonBlock>
        </Stack>
      </DemoSurface>
    </ThemeProvider>
  );
}

export const AnimationOnly: Story = {
  render: () => <AnimationPanelDemo />,
};

function LayoutPanelDemo() {
  const [settings, setSettings] = createSignal({
    sidebarOpen: true,
    density: 'normal' as const,
  });

  return (
    <ThemeProvider theme={zedDarkTheme}>
      <DemoSurface>
        <Stack gap="xl">
          <LayoutPanel settings={settings()} onChange={setSettings} />

          <JsonBlock>{JSON.stringify(settings(), null, 2)}</JsonBlock>
        </Stack>
      </DemoSurface>
    </ThemeProvider>
  );
}

export const LayoutOnly: Story = {
  render: () => <LayoutPanelDemo />,
};

function WithLocalStorage() {
  const { loadSettings, saveSettings } = createSettingsStore('demo-settings');
  const [settings, setSettings] = createSignal<SettingsConfig>(loadSettings());

  const handleChange = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    console.log('Settings saved to localStorage');
  };

  const currentTheme = () => themeMap[settings().appearance.themeId] || zedDarkTheme;

  return (
    <ThemeProvider theme={currentTheme()}>
      <DemoSurface fontSize={settings().appearance.fontSize}>
        <Stack gap="xl">
          <Box p="md" bg="accent" borderRadius="md">
            <Text weight="semibold" color="on-accent">
              Settings are persisted to localStorage (key: demo-settings)
            </Text>
          </Box>

          <SettingsPanel
            settings={settings()}
            onChange={handleChange}
            availableThemes={availableThemes}
          />
        </Stack>
      </DemoSurface>
    </ThemeProvider>
  );
}

export const WithPersistence: Story = {
  render: () => <WithLocalStorage />,
};
