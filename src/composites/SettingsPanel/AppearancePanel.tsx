import { For, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import type { AppearancePanelProps } from './types';
import './SettingsPanel.css';

export const AppearancePanel: Component<AppearancePanelProps> = (props) => {
  return (
    <Stack gap="lg" class={props.class} style={props.style}>
      {/* Theme Selector */}
      <Stack gap="sm">
        <div class="sk-settings__section-title">Theme</div>
        <div class="sk-settings__theme-grid" role="radiogroup" aria-label="Theme">
          <For
            each={
              props.availableThemes ?? [
                { id: 'light', name: 'Light' },
                { id: 'dark', name: 'Dark' },
              ]
            }
          >
            {(theme) => (
              <button
                type="button"
                role="radio"
                aria-checked={props.settings.themeId === theme.id}
                class={`sk-settings__option ${
                  props.settings.themeId === theme.id ? 'sk-settings__option--selected' : ''
                }`}
                onClick={() => props.onChange({ ...props.settings, themeId: theme.id })}
              >
                {theme.name}
              </button>
            )}
          </For>
        </div>
      </Stack>

      {/* Font Size Slider */}
      <Stack gap="sm">
        <Flex justify="between" align="center">
          <div class="sk-settings__section-title">Font Size</div>
          <span class="sk-settings__value">{props.settings.fontSize}px</span>
        </Flex>
        <input
          type="range"
          class="sk-settings__slider"
          min="12"
          max="20"
          step="1"
          aria-label="Font size"
          value={props.settings.fontSize}
          onInput={(e) =>
            props.onChange({
              ...props.settings,
              fontSize: parseInt(e.currentTarget.value),
            })
          }
        />
        <div class="sk-settings__scale">
          <span class="sk-settings__hint">12px</span>
          <span class="sk-settings__hint">20px</span>
        </div>
      </Stack>
    </Stack>
  );
};
