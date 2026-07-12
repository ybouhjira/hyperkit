import { onMount, createSignal, type JSX, type Component, lazy, Suspense, Show } from 'solid-js';

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
  // Mount-gate the Kobalte implementation instead of branching on `isServer`:
  // server and the client's hydration pass must render the SAME tree (the
  // native fallback), or hydration crashes on prerendered pages. The enhanced
  // control swaps in after mount.
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <Show when={mounted()} fallback={<>{props.trigger}</>}>
      <Suspense fallback={<>{props.trigger}</>}>
        <PopoverImpl {...props} />
      </Suspense>
    </Show>
  );
};
