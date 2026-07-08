export interface AppearanceSettings {
  themeId: string;
  fontSize: number;
}

export interface AnimationSettings {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
}

export interface LayoutSettings {
  sidebarOpen: boolean;
  density: 'compact' | 'normal' | 'comfortable';
}

export interface SettingsConfig {
  appearance: AppearanceSettings;
  animation: AnimationSettings;
  layout: LayoutSettings;
}

export interface AppearancePanelProps {
  settings: AppearanceSettings;
  onChange: (settings: AppearanceSettings) => void;
  availableThemes?: Array<{ id: string; name: string }>;
}

export interface AnimationPanelProps {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
}

export interface LayoutPanelProps {
  settings: LayoutSettings;
  onChange: (settings: LayoutSettings) => void;
}

export interface SettingsPanelProps {
  settings: SettingsConfig;
  onChange: (settings: SettingsConfig) => void;
  availableThemes?: Array<{ id: string; name: string }>;
}
