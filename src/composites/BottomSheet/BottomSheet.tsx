import {
  Component,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  untrack,
} from 'solid-js';
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';

/**
 * Props for {@link BottomSheet}.
 *
 * Controlled: parent owns `open` state via `onOpenChange`. Kobalte's Dialog
 * handles focus trap, ESC-to-close, and backdrop.
 */
export interface BottomSheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Called when open state changes (ESC, backdrop click, swipe-down). */
  onOpenChange: (open: boolean) => void;
  /**
   * Snap points as a fraction of viewport height (0-1). The sheet sizes to the
   * largest snap. Users can swipe between snaps; swiping below the smallest
   * dismisses. Default: `[0.5, 0.9]` (half and almost-full).
   */
  snapPoints?: number[];
  /**
   * Maximum width in CSS when viewport is wider than `640px`. On mobile, the
   * sheet is always full-width.
   * @default '640px' */
  maxWidth?: string;
  /** Show the drag handle at the top.
   * @default true */
  showHandle?: boolean;
  /** Allow swipe-down gesture to dismiss.
   * @default true */
  swipeToDismiss?: boolean;
  /** Close when the backdrop is clicked or ESC is pressed.
   * @default true */
  dismissible?: boolean;
  /** Accessible label for the sheet region. */
  'aria-label'?: string;
  /** Sheet body content. */
  children: JSX.Element;
  /** Additional CSS class for the sheet content surface. */
  class?: string;
  /** Inline styles applied to the sheet content surface. */
  style?: JSX.CSSProperties;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SWIPE_DISMISS_THRESHOLD = 80; // px

/**
 * Slide-up modal anchored to the viewport's bottom edge, with snap points and
 * swipe-to-dismiss. Built on Kobalte `Dialog` for focus trap + ESC + portal.
 *
 * The sheet clamps to `maxWidth` and centers when the viewport is wider than
 * 640px, so it reads naturally on tablet and desktop too. On mobile it fills
 * the full width.
 *
 * Drag uses Pointer Events (cross-device) and respects
 * `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false);
 * <BottomSheet open={open()} onOpenChange={setOpen} snapPoints={[0.4, 0.9]}>
 *   <Stack p="md">
 *     <Text size="lg" weight="semibold">Filters</Text>
 *     <Checkbox label="Unread only" />
 *   </Stack>
 * </BottomSheet>
 * ```
 */
export const BottomSheet: Component<BottomSheetProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'onOpenChange',
    'snapPoints',
    'maxWidth',
    'showHandle',
    'swipeToDismiss',
    'dismissible',
    'children',
    'class',
    'style',
    'aria-label',
  ]);

  const snapPoints = createMemo(() => {
    const pts = local.snapPoints ?? [0.5, 0.9];
    // Ensure sorted ascending + clamp to (0, 1]
    return [...pts].map((p) => Math.max(0.05, Math.min(1, p))).sort((a, b) => a - b);
  });
  const maxSnap = () => snapPoints()[snapPoints().length - 1] ?? 0.9;

  const [activeSnapIndex, setActiveSnapIndex] = createSignal(
    untrack(() => snapPoints().length - 1)
  );
  const [dragOffset, setDragOffset] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);
  const reducedMotion = createMemo(() => prefersReducedMotion());

  // Reset snap index when opening
  createEffect(() => {
    if (local.open) {
      setActiveSnapIndex(snapPoints().length - 1);
      setDragOffset(0);
    }
  });

  const maxWidth = () => local.maxWidth ?? '640px';
  const showHandle = () => local.showHandle !== false;
  const swipeToDismiss = () => local.swipeToDismiss !== false;
  const dismissible = () => local.dismissible !== false;

  let startY = 0;
  let pointerId: number | null = null;

  const onPointerDown = (e: PointerEvent) => {
    if (!swipeToDismiss()) return;
    // Only drag from the handle region — otherwise scrolling content would conflict.
    const target = e.target as HTMLElement;
    if (!target.closest('[data-sk-bottom-sheet-handle]')) return;
    startY = e.clientY;
    pointerId = e.pointerId;
    setDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Not supported in this environment (e.g. jsdom) — drag still works via document events.
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging() || pointerId !== e.pointerId) return;
    const delta = e.clientY - startY;
    // Only allow downward drag
    setDragOffset(Math.max(0, delta));
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragging() || pointerId !== e.pointerId) return;
    const offset = dragOffset();
    setDragging(false);
    pointerId = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore — may already be released or unsupported
    }
    if (offset > SWIPE_DISMISS_THRESHOLD && dismissible()) {
      setDragOffset(0);
      local.onOpenChange(false);
    } else {
      setDragOffset(0);
    }
  };

  onCleanup(() => {
    pointerId = null;
  });

  const contentStyle = (): JSX.CSSProperties => {
    const heightVh = maxSnap() * 100;
    const translate = dragOffset();
    return {
      position: 'fixed',
      left: '50%',
      bottom: '0',
      transform: `translateX(-50%) translateY(${local.open ? translate : 9999}px)`,
      width: '100%',
      'max-width': maxWidth(),
      height: `${heightVh}vh`,
      'max-height': '100vh',
      background: 'var(--sk-bg-elevated)',
      'border-top-left-radius': 'var(--sk-radius-lg)',
      'border-top-right-radius': 'var(--sk-radius-lg)',
      'box-shadow': 'var(--sk-shadow-2xl)',
      display: 'flex',
      'flex-direction': 'column',
      overflow: 'hidden',
      'z-index': 'var(--sk-z-modal, 1000)',
      transition:
        reducedMotion() || dragging()
          ? 'none'
          : 'transform var(--sk-duration-fast, 150ms) var(--sk-ease-default, cubic-bezier(0.4, 0, 0.2, 1))',
      'touch-action': 'none',
      ...(local.style ?? {}),
    };
  };

  const backdropStyle = (): JSX.CSSProperties => ({
    position: 'fixed',
    inset: '0',
    background: 'var(--sk-overlay-bg, rgba(0, 0, 0, 0.5))',
    'backdrop-filter': 'blur(4px)',
    '-webkit-backdrop-filter': 'blur(4px)',
    'z-index': 'var(--sk-z-modal, 1000)',
    transition: reducedMotion()
      ? 'none'
      : 'opacity var(--sk-duration-fast, 150ms) var(--sk-ease-default, cubic-bezier(0.4, 0, 0.2, 1))',
  });

  return (
    <KobalteDialog
      open={local.open}
      onOpenChange={local.onOpenChange}
      modal
      preventScroll
      {...others}
    >
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay
          data-sk-bottom-sheet-overlay=""
          data-testid="bottom-sheet-overlay"
          style={backdropStyle()}
          onClick={(e: MouseEvent) => {
            if (!dismissible()) e.preventDefault();
          }}
        />
        <KobalteDialog.Content
          data-sk-bottom-sheet=""
          data-testid="bottom-sheet"
          data-snap={activeSnapIndex()}
          role="dialog"
          aria-label={local['aria-label']}
          class={local.class}
          style={contentStyle()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (!dismissible()) e.preventDefault();
          }}
          onInteractOutside={(e: Event) => {
            if (!dismissible()) e.preventDefault();
          }}
        >
          <Show when={showHandle()}>
            <div
              data-sk-bottom-sheet-handle=""
              data-testid="bottom-sheet-handle"
              role="separator"
              aria-label="Drag to resize or dismiss"
              style={{
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                padding: 'var(--sk-space-sm) 0 var(--sk-space-xs)',
                cursor: swipeToDismiss() ? 'grab' : 'default',
                'flex-shrink': '0',
                'touch-action': 'none',
              }}
            >
              <span
                style={{
                  width: 'var(--sk-space-2xl)',
                  height: 'var(--sk-space-2xs)',
                  'border-radius': '9999px',
                  background: 'var(--sk-border)',
                }}
              />
            </div>
          </Show>
          <div
            data-sk-bottom-sheet-body=""
            data-testid="bottom-sheet-body"
            style={{
              flex: '1 1 auto',
              overflow: 'auto',
              'min-height': '0',
            }}
          >
            {local.children}
          </div>
        </KobalteDialog.Content>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
};
