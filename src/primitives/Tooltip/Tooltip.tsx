import { type JSX, type Component, lazy, Suspense, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import '@ybouhjira/hyperkit-styles/primitives/Tooltip/Tooltip.css';

/** Props for the Tooltip component. */
export interface TooltipProps {
  /** Tooltip content to display. */
  content: string | JSX.Element;
  /** Tooltip placement relative to the trigger.
   * @default 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing tooltip in milliseconds.
   * @default 300 */
  delay?: number;
  /** Element that triggers the tooltip. */
  children: JSX.Element;
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
  /** Control open state externally. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
}

// Lazy-load the Kobalte-dependent implementation so it is never bundled
// into server-side render paths. The module is only evaluated on the client.
const TooltipImpl = lazy(() =>
  import('./Tooltip.client').then((m) => ({ default: m.TooltipImpl }))
);

/**
 * Tooltip with configurable placement, delay, and arrow pointer.
 *
 * SSR-safe: on the server the children are rendered without a tooltip wrapper
 * (tooltips are hover-only interactions with zero server-side value).
 * On the client the full @kobalte/core Tooltip is lazily loaded.
 *
 * @example
 * ```tsx
 * import { Tooltip, Button, Flex } from "@ybouhjira/hyperkit";
 *
 * // Icon button with descriptive tooltip
 * <Tooltip content="Delete this project permanently" placement="top">
 *   <Button variant="ghost" size="sm" onClick={() => confirmDelete(id)}>
 *     🗑
 *   </Button>
 * </Tooltip>
 *
 * // Toolbar with multiple tooltips
 * <Flex gap="xs">
 *   <Tooltip content="Bold (⌘B)" placement="bottom">
 *     <Button variant="ghost" size="sm">B</Button>
 *   </Tooltip>
 *   <Tooltip content="Italic (⌘I)" placement="bottom">
 *     <Button variant="ghost" size="sm"><em>I</em></Button>
 *   </Tooltip>
 * </Flex>
 *
 * // Tooltip with custom delay for dense UIs
 * <Tooltip content="Regenerate response" placement="right" delay={150}>
 *   <Button variant="ghost" size="sm">↺</Button>
 * </Tooltip>
 * ```
 *
 * @see Popover - for richer floating content with interactive elements
 * @see Badge - for inline status labels that don't need hover
 */
export const Tooltip: Component<TooltipProps> = (props) => {
  return (
    <Show when={!isServer} fallback={<>{props.children}</>}>
      {/* Client: render the full Kobalte Tooltip via a lazy-loaded chunk. */}
      <Suspense fallback={<>{props.children}</>}>
        <TooltipImpl {...props} />
      </Suspense>
    </Show>
  );
};
