import { Component, For } from 'solid-js';
import { useTheme } from './useTheme';
import { ThemeConfig } from './types';
import '@ybouhjira/hyperkit-styles/theme/ThemePicker.css';

interface ThemePickerProps {
  onThemeChange?: (theme: ThemeConfig) => void;
}

export const ThemePicker: Component<ThemePickerProps> = (props) => {
  const { theme, setTheme, themes } = useTheme();

  const handleThemeClick = (themeConfig: ThemeConfig) => {
    setTheme(themeConfig.id);
    props.onThemeChange?.(themeConfig);
  };

  return (
    <div class="sk-theme-picker">
      <For each={themes}>
        {(themeConfig) => {
          const isSelected = () => theme().id === themeConfig.id;

          return (
            <button
              classList={{
                'sk-theme-picker__card': true,
                'sk-theme-picker__card--selected': isSelected(),
              }}
              onClick={() => handleThemeClick(themeConfig)}
            >
              <div class="sk-theme-picker__name">{themeConfig.name}</div>

              <div class="sk-theme-picker__swatches">
                {/* Swatch colors are theme preview data (each preset's own palette), not chrome */}
                <div
                  class="sk-theme-picker__swatch"
                  style={{
                    background: themeConfig.colors.bgPrimary,
                    border: `1px solid ${themeConfig.colors.border}`,
                  }}
                />
                <div
                  class="sk-theme-picker__swatch"
                  style={{ background: themeConfig.colors.accent }}
                />
                <div
                  class="sk-theme-picker__swatch"
                  style={{ background: themeConfig.colors.textPrimary }}
                />
              </div>

              {isSelected() && <div class="sk-theme-picker__selected-label">✓ Selected</div>}
            </button>
          );
        }}
      </For>
    </div>
  );
};
