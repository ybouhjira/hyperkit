import { onMount, createSignal, type JSX, type Component, lazy, Suspense, Show } from 'solid-js';

export interface DropdownItem {
  /** Display label for the menu item. */
  label: string;
  /** Optional icon element displayed before the label. */
  icon?: JSX.Element;
  /** Callback fired when the menu item is selected. */
  onClick?: () => void;
  /** Whether the menu item is disabled. */
  disabled?: boolean;
  /** Style the item as destructive (e.g., delete action). */
  destructive?: boolean;
}

export interface DropdownProps {
  /** Array of menu items to display. */
  items: DropdownItem[];
  /** Trigger element that opens the dropdown when clicked. */
  trigger: JSX.Element;
  /** Additional CSS class name for the dropdown content. */
  class?: string;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const DropdownImpl = lazy(() =>
  import('./Dropdown.client').then((m) => ({ default: m.DropdownClient }))
);

/** Dropdown menu component with customizable trigger and menu items. */
export const Dropdown: Component<DropdownProps> = (props) => {
  // Mount-gate the Kobalte implementation instead of branching on `isServer`:
  // server and the client's hydration pass must render the SAME tree (the
  // native fallback), or hydration crashes on prerendered pages. The enhanced
  // control swaps in after mount.
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={<>{props.trigger}</>}>
      <Suspense fallback={<>{props.trigger}</>}>
        <DropdownImpl {...props} />
      </Suspense>
    </Show>
  );
};
