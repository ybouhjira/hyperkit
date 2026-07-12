import { createSignal, For, type Component } from 'solid-js';
import { AppearancePanel } from './AppearancePanel';
import { AnimationPanel } from './AnimationPanel';
import { LayoutPanel } from './LayoutPanel';
import type { SettingsPanelProps, SettingsConfig } from './types';
import '@ybouhjira/hyperkit-styles/composites/SettingsPanel/SettingsPanel.css';

type Tab = 'appearance' | 'animation' | 'layout';

export const SettingsPanel: Component<SettingsPanelProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<Tab>('appearance');

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'animation', label: 'Animation', icon: '✨' },
    { id: 'layout', label: 'Layout', icon: '📐' },
  ];

  return (
    <div class={`sk-settings ${props.class ?? ''}`} style={props.style}>
      {/* Tab Navigation */}
      <div class="sk-settings__tabs" role="tablist" aria-label="Settings sections">
        <For each={tabs}>
          {(tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab() === tab.id}
              class={`sk-settings__tab ${activeTab() === tab.id ? 'sk-settings__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span class="sk-settings__tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )}
        </For>
      </div>

      {/* Panel Content */}
      <div class="sk-settings__body">
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
      </div>
    </div>
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
