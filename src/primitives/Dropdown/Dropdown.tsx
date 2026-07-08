import { type JSX, type Component, lazy, Suspense, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

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
  return (
    <Show when={!isServer} fallback={<>{props.trigger}</>}>
      <Suspense fallback={<>{props.trigger}</>}>
        <DropdownImpl {...props} />
      </Suspense>
    </Show>
  );
};
