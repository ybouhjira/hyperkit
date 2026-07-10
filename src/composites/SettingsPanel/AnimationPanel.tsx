import { createSignal, For, Show, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Switch } from '../../primitives/Switch';
import { Button } from '../../primitives/Button';
import type { AnimationPanelProps } from './types';
import './SettingsPanel.css';

export const AnimationPanel: Component<AnimationPanelProps> = (props) => {
  const [isAnimating, setIsAnimating] = createSignal(false);

  const speedMultipliers = {
    slow: 2,
    normal: 1,
    fast: 0.5,
  };

  const playPreview = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000 * speedMultipliers[props.settings.speed]);
  };

  return (
    <Stack gap="lg" class={props.class} style={props.style}>
      {/* Enable/Disable Toggle */}
      <Switch
        class="sk-settings__switch"
        checked={props.settings.enabled}
        onChange={(enabled) => props.onChange({ ...props.settings, enabled })}
        label="Enable Animations"
        description="Turn animations on or off globally"
      />

      {/* Speed Selector */}
      <Stack gap="sm">
        <div class="sk-settings__section-title">Animation Speed</div>
        <div class="sk-settings__choices" role="radiogroup" aria-label="Animation speed">
          <For each={['slow', 'normal', 'fast'] as const}>
            {(speed) => (
              <button
                type="button"
                role="radio"
                aria-checked={props.settings.speed === speed}
                class={`sk-settings__option ${
                  props.settings.speed === speed ? 'sk-settings__option--selected' : ''
                }`}
                onClick={() => props.onChange({ ...props.settings, speed })}
              >
                <span class="sk-settings__option-label">{speed}</span>
              </button>
            )}
          </For>
        </div>
      </Stack>

      {/* Preview Button */}
      <Stack gap="sm">
        <div class="sk-settings__section-title">Preview</div>
        <Button
          variant="primary"
          size="md"
          class="sk-settings__preview-btn"
          disabled={!props.settings.enabled}
          onClick={playPreview}
        >
          Play Animation
        </Button>
        <Show when={props.settings.enabled}>
          <div
            class={`sk-settings__preview-box ${
              isAnimating() ? 'sk-settings__preview-box--animating' : ''
            }`}
            style={{
              '--sk-settings-preview-duration': `${1 * speedMultipliers[props.settings.speed]}s`,
            }}
          />
        </Show>
      </Stack>
    </Stack>
  );
};
