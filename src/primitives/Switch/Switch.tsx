import { type Component, splitProps, Show, createMemo } from 'solid-js';
import { Switch as KobalteSwitch } from '@kobalte/core/switch';
import '@ybouhjira/hyperkit-styles/primitives/Switch/Switch.css';

/** Props for the Switch component. */
export interface SwitchProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled mode.
   * @default false */
  defaultChecked?: boolean;
  /** Callback when checked state changes. */
  onChange?: (checked: boolean) => void;
  /** Disable the switch.
   * @default false */
  disabled?: boolean;
  /** Label text displayed next to the switch. */
  label?: string;
  /** Description text displayed below the label. */
  description?: string;
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md';
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Toggle switch with label, description, and keyboard accessibility.
 *
 * @example
 * ```tsx
 * import { Switch, Stack } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Controlled switch for a feature flag
 * const [enabled, setEnabled] = createSignal(false);
 * <Switch
 *   checked={enabled()}
 *   onChange={setEnabled}
 *   label="Enable notifications"
 *   description="Receive email alerts for important events"
 * />
 *
 * // Settings panel with multiple switches
 * <Stack gap="md">
 *   <Switch label="Dark mode" defaultChecked onChange={(v) => setTheme(v ? "dark" : "light")} />
 *   <Switch label="Auto-save" defaultChecked description="Save changes every 30 seconds" />
 *   <Switch label="Beta features" size="sm" disabled />
 * </Stack>
 * ```
 *
 * @see Select - for multi-option settings
 * @see Stack - for grouping settings items
 */
export const Switch: Component<SwitchProps> = (props) => {
  const [local, others] = splitProps(props, [
    'checked',
    'defaultChecked',
    'onChange',
    'disabled',
    'label',
    'description',
    'size',
    'class',
    'unstyled',
  ]);

  const size = createMemo(() => local.size ?? 'md');

  return (
    <KobalteSwitch
      class={
        local.unstyled ? (local.class ?? '') : `sk-switch sk-switch--${size()} ${local.class ?? ''}`
      }
      {...(local.checked !== undefined ? { checked: local.checked } : {})}
      {...(local.defaultChecked !== undefined ? { defaultChecked: local.defaultChecked } : {})}
      {...(local.onChange !== undefined ? { onChange: local.onChange } : {})}
      {...(local.disabled !== undefined ? { disabled: local.disabled } : {})}
      {...others}
    >
      <KobalteSwitch.Input />
      <div class={local.unstyled ? '' : 'sk-switch__main'}>
        <Show when={local.label}>
          <KobalteSwitch.Label class={local.unstyled ? '' : 'sk-switch__label'}>
            {local.label}
          </KobalteSwitch.Label>
        </Show>
        <Show when={local.description}>
          <KobalteSwitch.Description class={local.unstyled ? '' : 'sk-switch__description'}>
            {local.description}
          </KobalteSwitch.Description>
        </Show>
      </div>
      <KobalteSwitch.Control class={local.unstyled ? '' : 'sk-switch__control'}>
        <KobalteSwitch.Thumb class={local.unstyled ? '' : 'sk-switch__thumb'} />
      </KobalteSwitch.Control>
    </KobalteSwitch>
  );
};
