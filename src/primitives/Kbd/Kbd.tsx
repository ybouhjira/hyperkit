import { type JSX, type Component, splitProps, For, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Kbd/Kbd.css';

/** Props for the Kbd component. */
export interface KbdProps {
  /** Content to render as a single key. */
  children?: JSX.Element;
  /** Array of key names to render as a keyboard shortcut (e.g., ['Ctrl', 'C']). */
  keys?: string[];
  /** Additional CSS classes. */
  class?: string;
}

/** Keyboard shortcut display with styled key representations. */
export const Kbd: Component<KbdProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'keys', 'class']);

  return (
    <Show
      when={local.keys && local.keys.length > 0}
      fallback={
        <kbd class={`sk-kbd ${local.class ?? ''}`} {...others}>
          {local.children}
        </kbd>
      }
    >
      <span class={`sk-kbd-group ${local.class ?? ''}`} {...others}>
        <For each={local.keys}>
          {(key, index) => (
            <>
              <kbd class="sk-kbd">{key}</kbd>
              <Show when={local.keys && index() < local.keys.length - 1}>
                <span class="sk-kbd-separator">+</span>
              </Show>
            </>
          )}
        </For>
      </span>
    </Show>
  );
};
