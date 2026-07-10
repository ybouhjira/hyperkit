import { For, Show, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Switch } from '../../primitives/Switch';
import type { LayoutPanelProps } from './types';
import './SettingsPanel.css';

const densityDescriptions = {
  compact: 'Minimal spacing',
  normal: 'Default spacing',
  comfortable: 'Generous spacing',
} as const;

export const LayoutPanel: Component<LayoutPanelProps> = (props) => {
  return (
    <Stack gap="lg" class={props.class} style={props.style}>
      {/* Sidebar Default State */}
      <Switch
        class="sk-settings__switch"
        checked={props.settings.sidebarOpen}
        onChange={(sidebarOpen) => props.onChange({ ...props.settings, sidebarOpen })}
        label="Sidebar Open by Default"
        description="Show sidebar when app loads"
      />

      {/* Density Selector */}
      <Stack gap="sm">
        <div class="sk-settings__section-title">Layout Density</div>
        <div class="sk-settings__hint">Control spacing between elements</div>
        <Stack gap="sm" role="radiogroup" aria-label="Layout density">
          <For each={['compact', 'normal', 'comfortable'] as const}>
            {(density) => (
              <button
                type="button"
                role="radio"
                aria-checked={props.settings.density === density}
                class={`sk-settings__option sk-settings__option--row ${
                  props.settings.density === density ? 'sk-settings__option--selected' : ''
                }`}
                onClick={() => props.onChange({ ...props.settings, density })}
              >
                <span class="sk-settings__option-main">
                  <span class="sk-settings__option-label">{density}</span>
                  <span class="sk-settings__option-desc">{densityDescriptions[density]}</span>
                </span>
                <Show when={props.settings.density === density}>
                  <span class="sk-settings__option-check" aria-hidden="true">
                    ✓
                  </span>
                </Show>
              </button>
            )}
          </For>
        </Stack>
      </Stack>
    </Stack>
  );
};
