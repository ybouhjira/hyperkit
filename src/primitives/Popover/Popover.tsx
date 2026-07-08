import { type JSX, type Component, lazy, Suspense, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

/** Props for the Popover component. */
export interface PopoverProps {
  /** The trigger element that opens the popover. */
  trigger: JSX.Element;
  /** The content rendered inside the popover panel. */
  content: JSX.Element;
  /** Placement of the popover relative to the trigger.
   * @default 'bottom' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes applied to the content panel. */
  class?: string;
  /** Inline styles for the content panel. */
  style?: JSX.CSSProperties;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const PopoverImpl = lazy(() =>
  import('./Popover.client').then((m) => ({ default: m.PopoverClient }))
);

/** Positioned floating panel for contextual content. Dismisses on outside click and Escape key. */
export const Popover: Component<PopoverProps> = (props) => {
  return (
    <Show when={!isServer} fallback={<>{props.trigger}</>}>
      <Suspense fallback={<>{props.trigger}</>}>
        <PopoverImpl {...props} />
      </Suspense>
    </Show>
  );
};
