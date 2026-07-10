import type { JSX } from 'solid-js';

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
  /** Additional CSS class name applied to the root element. */
  class?: string;
  /** Inline CSS styles applied to the root element (applied last). */
  style?: JSX.CSSProperties;
}

export interface AnimationPanelProps {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  /** Additional CSS class name applied to the root element. */
  class?: string;
  /** Inline CSS styles applied to the root element (applied last). */
  style?: JSX.CSSProperties;
}

export interface LayoutPanelProps {
  settings: LayoutSettings;
  onChange: (settings: LayoutSettings) => void;
  /** Additional CSS class name applied to the root element. */
  class?: string;
  /** Inline CSS styles applied to the root element (applied last). */
  style?: JSX.CSSProperties;
}

export interface SettingsPanelProps {
  settings: SettingsConfig;
  onChange: (settings: SettingsConfig) => void;
  availableThemes?: Array<{ id: string; name: string }>;
  /** Additional CSS class name applied to the root element. */
  class?: string;
  /** Inline CSS styles applied to the root element (applied last). */
  style?: JSX.CSSProperties;
}
