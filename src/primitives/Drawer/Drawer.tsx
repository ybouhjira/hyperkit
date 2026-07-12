import { type JSX, type Component, splitProps, Show } from 'solid-js';
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import '@ybouhjira/hyperkit-styles/primitives/Drawer/Drawer.css';

/** Which edge of the viewport the drawer slides in from. */
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

/** Props for the Drawer component. */
export interface DrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Callback fired when drawer open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Which edge the drawer slides in from.
   * @default 'left' */
  side?: DrawerSide;
  /** Drawer size along its slide axis. CSS length (e.g. `'280px'`, `'60%'`).
   * Defaults to `min(320px, 80vw)` on left/right, `min(60vh, 480px)` on top/bottom. */
  size?: string;
  /** Whether clicking the backdrop or pressing Escape closes the drawer.
   * @default true */
  dismissible?: boolean;
  /** Whether to render a dimmed, interaction-blocking backdrop behind the drawer.
   * @default true */
  modal?: boolean;
  /** Trap keyboard focus inside the drawer while open. Defaults to `modal`. */
  trapFocus?: boolean;
  /** Drawer body content. */
  children: JSX.Element;
  /** Accessible label for the drawer region. */
  'aria-label'?: string;
  /** Additional CSS class for the drawer content surface. */
  class?: string;
  /** Inline styles applied to the drawer content surface. */
  style?: JSX.CSSProperties;
}

/**
 * Slide-in overlay panel docked to an edge of the viewport.
 *
 * Ideal for mobile sidebars, filter trays, and off-canvas navigation. Differs
 * from {@link Dialog} in that it slides from an edge rather than centering,
 * and supports a non-modal variant that does not render a backdrop.
 *
 * @example
 * ```tsx
 * import { Drawer, Button, Stack } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * const [open, setOpen] = createSignal(false);
 * <Button onClick={() => setOpen(true)}>Open menu</Button>
 * <Drawer open={open()} onOpenChange={setOpen} side="left" size="280px">
 *   <Stack gap="sm">
 *     <a href="/home">Home</a>
 *     <a href="/projects">Projects</a>
 *   </Stack>
 * </Drawer>
 * ```
 *
 * @see Dialog - for centered modal dialogs
 * @see Popover - for anchored floating content
 */
export const Drawer: Component<DrawerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'onOpenChange',
    'side',
    'size',
    'dismissible',
    'modal',
    'trapFocus',
    'children',
    'class',
    'style',
    'aria-label',
  ]);

  const side = () => local.side ?? 'left';
  const modal = () => local.modal ?? true;
  const dismissible = () => local.dismissible ?? true;
  const trapFocus = () => local.trapFocus ?? modal();

  // The size prop feeds the stylesheet through the --sk-drawer-size custom
  // property; the user style prop merges last so it can override anything.
  const contentStyle = (): JSX.CSSProperties => ({
    ...(local.size !== undefined ? { '--sk-drawer-size': local.size } : {}),
    ...(local.style ?? {}),
  });

  return (
    <KobalteDialog
      open={local.open}
      onOpenChange={local.onOpenChange}
      modal={modal()}
      preventScroll={modal()}
      {...others}
    >
      <KobalteDialog.Portal>
        <Show when={modal()}>
          <KobalteDialog.Overlay
            data-sk-drawer-overlay=""
            class="sk-drawer__overlay"
            onClick={(e: MouseEvent) => {
              if (!dismissible()) {
                e.preventDefault();
              }
            }}
          />
        </Show>
        <KobalteDialog.Content
          data-sk-drawer=""
          data-side={side()}
          role="dialog"
          aria-label={local['aria-label']}
          class={`sk-drawer ${local.class ?? ''}`.trim()}
          style={contentStyle()}
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (!dismissible() || !modal()) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e: Event) => {
            if (!dismissible()) {
              e.preventDefault();
            }
          }}
          onOpenAutoFocus={(e: Event) => {
            if (!trapFocus()) {
              e.preventDefault();
            }
          }}
          onCloseAutoFocus={(e: Event) => {
            if (!trapFocus()) {
              e.preventDefault();
            }
          }}
        >
          {local.children}
        </KobalteDialog.Content>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
};
