import { Component, For } from 'solid-js';
import { useTheme } from './useTheme';
import { ThemeConfig } from './types';

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
    <div
      style={{
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      <For each={themes}>
        {(themeConfig) => {
          const isSelected = () => theme().id === themeConfig.id;

          return (
            <button
              onClick={() => handleThemeClick(themeConfig)}
              style={{
                display: 'flex',
                'flex-direction': 'column',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--sk-bg-secondary)',
                border: `2px solid ${isSelected() ? 'var(--sk-accent)' : 'var(--sk-border)'}`,
                'border-radius': 'var(--sk-radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                'box-shadow': isSelected() ? '0 0 0 3px var(--sk-accent-muted)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected()) {
                  e.currentTarget.style.borderColor = 'var(--sk-border-subtle)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected()) {
                  e.currentTarget.style.borderColor = 'var(--sk-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div
                style={{
                  'font-size': 'var(--sk-font-size-base)',
                  'font-weight': '600',
                  color: 'var(--sk-text-primary)',
                  'font-family': 'var(--sk-font-ui)',
                }}
              >
                {themeConfig.name}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    background: themeConfig.colors.bgPrimary,
                    border: `1px solid ${themeConfig.colors.border}`,
                    'border-radius': 'var(--sk-radius-sm)',
                  }}
                />
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    background: themeConfig.colors.accent,
                    'border-radius': 'var(--sk-radius-sm)',
                  }}
                />
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    background: themeConfig.colors.textPrimary,
                    'border-radius': 'var(--sk-radius-sm)',
                  }}
                />
              </div>

              {isSelected() && (
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    color: 'var(--sk-accent)',
                    'font-weight': '500',
                    'font-family': 'var(--sk-font-ui)',
                  }}
                >
                  ✓ Selected
                </div>
              )}
            </button>
          );
        }}
      </For>
    </div>
  );
};
