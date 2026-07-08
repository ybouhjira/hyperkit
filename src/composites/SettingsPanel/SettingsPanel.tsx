import { createSignal, For, type Component } from 'solid-js';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Box } from '../../primitives/Box';
import { AppearancePanel } from './AppearancePanel';
import { AnimationPanel } from './AnimationPanel';
import { LayoutPanel } from './LayoutPanel';
import type { SettingsPanelProps, SettingsConfig } from './types';

type Tab = 'appearance' | 'animation' | 'layout';

export const SettingsPanel: Component<SettingsPanelProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<Tab>('appearance');

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'animation', label: 'Animation', icon: '✨' },
    { id: 'layout', label: 'Layout', icon: '📐' },
  ];

  return (
    <Box
      style={{
        'background-color': 'var(--color-surface, #f5f5f5)',
        'border-radius': '0.75rem',
        overflow: 'hidden',
        border: '1px solid var(--color-border, #e0e0e0)',
      }}
    >
      {/* Tab Navigation */}
      <Flex
        style={{
          'border-bottom': '1px solid var(--color-border, #e0e0e0)',
          'background-color': 'var(--color-background, white)',
        }}
      >
        <For each={tabs}>
          {(tab) => (
            <Box
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem',
                cursor: 'pointer',
                'text-align': 'center',
                'border-bottom': `3px solid ${
                  activeTab() === tab.id ? 'var(--color-primary, #007bff)' : 'transparent'
                }`,
                'background-color':
                  activeTab() === tab.id ? 'var(--color-primary-light, #e3f2fd)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Flex direction="column" align="center" gap="xs">
                <Text style={{ 'font-size': '1.25rem' }}>{tab.icon}</Text>
                <Text
                  style={{
                    'font-size': '0.875rem',
                    'font-weight': activeTab() === tab.id ? '600' : '400',
                    color:
                      activeTab() === tab.id
                        ? 'var(--color-primary, #007bff)'
                        : 'var(--color-text, #333)',
                  }}
                >
                  {tab.label}
                </Text>
              </Flex>
            </Box>
          )}
        </For>
      </Flex>

      {/* Panel Content */}
      <Box style={{ padding: '1.5rem', 'background-color': 'var(--color-background, white)' }}>
        {activeTab() === 'appearance' && (
          <AppearancePanel
            settings={props.settings.appearance}
            onChange={(appearance) => props.onChange({ ...props.settings, appearance })}
            availableThemes={props.availableThemes}
          />
        )}
        {activeTab() === 'animation' && (
          <AnimationPanel
            settings={props.settings.animation}
            onChange={(animation) => props.onChange({ ...props.settings, animation })}
          />
        )}
        {activeTab() === 'layout' && (
          <LayoutPanel
            settings={props.settings.layout}
            onChange={(layout) => props.onChange({ ...props.settings, layout })}
          />
        )}
      </Box>
    </Box>
  );
};

// Helper function for localStorage persistence
export function createSettingsStore(key = 'hyperkit-settings') {
  const defaultSettings: SettingsConfig = {
    appearance: { themeId: 'light', fontSize: 16 },
    animation: { enabled: true, speed: 'normal' },
    layout: { sidebarOpen: true, density: 'normal' },
  };

  const loadSettings = (): SettingsConfig => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  };

  const saveSettings = (settings: SettingsConfig) => {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      // Failed to save settings - silently ignore
    }
  };

  return { loadSettings, saveSettings, defaultSettings };
}
