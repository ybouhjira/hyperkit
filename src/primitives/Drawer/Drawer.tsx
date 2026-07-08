import { type JSX, type Component, splitProps, Show, createMemo } from 'solid-js';
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';

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

const sideTransforms: Record<DrawerSide, { hidden: string; visible: string }> = {
  left: { hidden: 'translateX(-100%)', visible: 'translateX(0)' },
  right: { hidden: 'translateX(100%)', visible: 'translateX(0)' },
  top: { hidden: 'translateY(-100%)', visible: 'translateY(0)' },
  bottom: { hidden: 'translateY(100%)', visible: 'translateY(0)' },
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const backdropStyle = (modal: boolean): JSX.CSSProperties => ({
  position: 'fixed',
  inset: '0',
  'z-index': 'var(--sk-z-modal, 1000)',
  background: modal ? 'var(--sk-overlay-bg, rgba(0, 0, 0, 0.5))' : 'transparent',
  'backdrop-filter': modal ? 'blur(4px)' : 'none',
  '-webkit-backdrop-filter': modal ? 'blur(4px)' : 'none',
  'pointer-events': modal ? 'auto' : 'none',
});

function contentStyle(
  side: DrawerSide,
  size: string | undefined,
  reducedMotion: boolean,
  extra?: JSX.CSSProperties
): JSX.CSSProperties {
  const base: JSX.CSSProperties = {
    position: 'fixed',
    'z-index': 'var(--sk-z-modal, 1000)',
    background: 'var(--sk-bg-elevated)',
    'box-shadow': 'var(--sk-shadow-2xl)',
    display: 'flex',
    'flex-direction': 'column',
    overflow: 'auto',
    transition: reducedMotion
      ? 'none'
      : 'transform var(--sk-duration-normal, 200ms) var(--sk-ease-default, cubic-bezier(0.4, 0, 0.2, 1))',
  };

  if (side === 'left') {
    base.top = '0';
    base.bottom = '0';
    base.left = '0';
    base.width = size ?? 'min(320px, 80vw)';
    base['border-right'] = '1px solid var(--sk-border)';
  } else if (side === 'right') {
    base.top = '0';
    base.bottom = '0';
    base.right = '0';
    base.width = size ?? 'min(320px, 80vw)';
    base['border-left'] = '1px solid var(--sk-border)';
  } else if (side === 'top') {
    base.top = '0';
    base.left = '0';
    base.right = '0';
    base.height = size ?? 'min(60vh, 480px)';
    base['border-bottom'] = '1px solid var(--sk-border)';
  } else {
    base.bottom = '0';
    base.left = '0';
    base.right = '0';
    base.height = size ?? 'min(60vh, 480px)';
    base['border-top'] = '1px solid var(--sk-border)';
  }

  return { ...base, ...(extra ?? {}) };
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

  const reducedMotion = createMemo(() => prefersReducedMotion());

  const transforms = () => sideTransforms[side()];

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
            style={backdropStyle(modal())}
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
          class={local.class}
          style={contentStyle(side(), local.size, reducedMotion(), {
            // Kobalte toggles data-expanded / data-closed; translate accordingly
            // via inline CSS variable. We use a starting transform state
            // and rely on data attribute to drive the visible transform.
            transform: local.open ? transforms().visible : transforms().hidden,
            ...(local.style ?? {}),
          })}
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
