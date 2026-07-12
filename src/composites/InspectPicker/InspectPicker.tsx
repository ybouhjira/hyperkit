/**
 * InspectPicker — devtools-style element picker.
 *
 * Arms a crosshair over the page: hovering paints an accent highlight
 * overlay plus a tag/size chip near the cursor (like browser devtools),
 * clicking snapshots the element (`InspectCapture`) and hands it to the
 * host. When the host passes the capture back via `capture`, a floating
 * panel renders next to the captured element (flipping above/below to stay
 * inside the viewport) with the element's tag, dimensions, selector, text
 * snippet, and a host-provided `actions` slot. Escape cancels at any stage.
 *
 * The picker never captures its own surface (`.sk-inspect-picker`), and the
 * highlight/chip overlays are `pointer-events: none` so they can never sit
 * between the cursor and the page.
 */

import { Component, JSX, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { Card } from '../../primitives/Card';
import { Flex } from '../../primitives/Flex';
import { Kbd } from '../../primitives/Kbd';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { X } from '../../icons';
import '@ybouhjira/hyperkit-styles/composites/InspectPicker/InspectPicker.css';

/** Rounded bounding box of an inspected element (viewport coordinates). */
export interface InspectRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Structured snapshot of a picked element. */
export interface InspectCapture {
  /** Short CSS selector (`#id` or `tag.cls1.cls2.cls3`). */
  selector: string;
  /** Lowercase tag name. */
  tag: string;
  /** First 6 class names, space-joined. */
  classes: string;
  /** Trimmed text content, capped at 120 chars. */
  text: string;
  /** Rounded bounding-client rect. */
  rect: InspectRect;
  /** Page URL at capture time. */
  url: string;
}

/** Resolved position for the captured-element panel. */
export interface InspectPanelPlacement {
  top: number;
  left: number;
  placement: 'below' | 'above';
}

export interface InspectPickerProps {
  /** Arm the crosshair picker: hover highlights, click captures. */
  active: boolean;
  /** Captured element shown in the floating panel (nullish hides it). */
  capture?: InspectCapture | null;
  /** Fired when the user clicks an element while the picker is armed. */
  onCapture?: (capture: InspectCapture) => void;
  /** Fired on Escape or the panel's close button. */
  onCancel?: () => void;
  /** Host-provided action buttons rendered at the bottom of the panel. */
  actions?: JSX.Element;
  /** Accessible label for the captured-element dialog. */
  panelLabel?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

const SELF = '.sk-inspect-picker';
/** Gap between the panel/chip and its anchor, and the viewport safe margin. */
const EDGE_GAP = 8;
/** Distance from the cursor to the hover chip. */
const CHIP_OFFSET = 14;
/** Pre-measure estimates used until the real panel/chip size is known. */
const PANEL_SIZE_ESTIMATE = { width: 320, height: 180 };
const CHIP_SIZE_ESTIMATE = { width: 140, height: 28 };

/** `#id` when available, else `tag.cls1.cls2.cls3` (first 3 classes). */
export function buildInspectSelector(el: HTMLElement): string {
  if (el.id.length > 0) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  const classes = [...el.classList]
    .slice(0, 3)
    .map((c) => `.${c}`)
    .join('');
  return `${tag}${classes}`;
}

/** Snapshot the structured context of a picked element. */
export function captureInspectElement(el: HTMLElement): InspectCapture {
  const rect = el.getBoundingClientRect();
  return {
    selector: buildInspectSelector(el),
    tag: el.tagName.toLowerCase(),
    classes: [...el.classList].slice(0, 6).join(' '),
    text: (el.textContent ?? '').trim().slice(0, 120),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    url: window.location.href,
  };
}

/**
 * Anchor the panel below the element; flip above when it would overflow the
 * bottom of the viewport and there is room above; otherwise clamp inside
 * the viewport. Horizontal position aligns with the element's left edge,
 * clamped to the viewport with an `EDGE_GAP` safe margin.
 */
export function computeInspectPanelPlacement(
  anchor: InspectRect,
  panel: { width: number; height: number },
  viewport: { width: number; height: number }
): InspectPanelPlacement {
  let placement: 'below' | 'above' = 'below';
  let top = anchor.y + anchor.height + EDGE_GAP;
  if (top + panel.height > viewport.height) {
    const above = anchor.y - EDGE_GAP - panel.height;
    if (above >= EDGE_GAP) {
      top = above;
      placement = 'above';
    } else {
      top = Math.max(EDGE_GAP, viewport.height - panel.height - EDGE_GAP);
    }
  }
  const maxLeft = Math.max(EDGE_GAP, viewport.width - panel.width - EDGE_GAP);
  const left = Math.min(Math.max(anchor.x, EDGE_GAP), maxLeft);
  return { top, left, placement };
}

/** Place the hover chip beside the cursor, flipping when near an edge. */
export function computeInspectChipPlacement(
  cursor: { x: number; y: number },
  chip: { width: number; height: number },
  viewport: { width: number; height: number }
): { top: number; left: number } {
  let left = cursor.x + CHIP_OFFSET;
  if (left + chip.width > viewport.width - EDGE_GAP) {
    left = cursor.x - CHIP_OFFSET - chip.width;
  }
  let top = cursor.y + CHIP_OFFSET;
  if (top + chip.height > viewport.height - EDGE_GAP) {
    top = cursor.y - CHIP_OFFSET - chip.height;
  }
  return { top, left };
}

interface HoverInfo {
  rect: InspectRect;
  tag: string;
  x: number;
  y: number;
}

export const InspectPicker: Component<InspectPickerProps> = (props) => {
  const [hover, setHover] = createSignal<HoverInfo | null>(null);
  const [panelSize, setPanelSize] = createSignal(PANEL_SIZE_ESTIMATE);
  const [chipSize, setChipSize] = createSignal(CHIP_SIZE_ESTIMATE);

  let panelEl: HTMLDivElement | undefined;
  let chipEl: HTMLDivElement | undefined;

  // ── Picker engine: highlight on hover, capture on click ──────────────────
  createEffect(() => {
    if (!props.active) {
      setHover(null);
      return;
    }

    const onMove = (e: MouseEvent): void => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el == null || el.closest(SELF) != null) return;
      const rect = el.getBoundingClientRect();
      setHover({
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        tag: el.tagName.toLowerCase(),
        x: e.clientX,
        y: e.clientY,
      });
    };

    const onClick = (e: MouseEvent): void => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el == null || el.closest(SELF) != null) return;
      e.preventDefault();
      e.stopPropagation();
      setHover(null);
      props.onCapture?.(captureInspectElement(el));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick, true);
    onCleanup(() => {
      setHover(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick, true);
    });
  });

  // ── Escape cancels while armed or while the panel is open ────────────────
  createEffect(() => {
    if (!props.active && props.capture == null) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      props.onCancel?.();
    };
    window.addEventListener('keydown', onKey, true);
    onCleanup(() => window.removeEventListener('keydown', onKey, true));
  });

  // ── Measure the rendered panel + move focus into the dialog ──────────────
  createEffect(() => {
    if (props.capture == null) return;
    // The <Show> below has already rendered the panel for this capture, so
    // the ref is always assigned by the time this effect runs.
    const el = panelEl as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setPanelSize({ width: rect.width, height: rect.height });
    }
    el.focus();
  });

  // ── Measure the hover chip so edge-flipping uses its real size ───────────
  createEffect(() => {
    if (hover() === null) return;
    const el = chipEl as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setChipSize({ width: rect.width, height: rect.height });
    }
  });

  const panelPos = createMemo<InspectPanelPlacement>(() => {
    const cap = props.capture;
    if (cap == null) return { top: 0, left: 0, placement: 'below' };
    return computeInspectPanelPlacement(cap.rect, panelSize(), {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  const chipPos = createMemo<{ top: number; left: number }>(() => {
    const h = hover();
    if (h === null) return { top: 0, left: 0 };
    return computeInspectChipPlacement({ x: h.x, y: h.y }, chipSize(), {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  return (
    <div
      class={`sk-inspect-picker ${props.class ?? ''}`}
      style={props.style}
      data-testid="inspect-picker"
    >
      <Show when={props.active ? hover() : null}>
        {(h) => (
          <>
            <div
              class="sk-inspect-picker__highlight"
              aria-hidden="true"
              style={{
                top: `${h().rect.y}px`,
                left: `${h().rect.x}px`,
                width: `${h().rect.width}px`,
                height: `${h().rect.height}px`,
              }}
            />
            <div
              ref={(el) => {
                chipEl = el;
              }}
              class="sk-inspect-picker__chip"
              aria-hidden="true"
              style={{ top: `${chipPos().top}px`, left: `${chipPos().left}px` }}
            >
              <span class="sk-inspect-picker__chip-tag">{h().tag}</span>
              <span class="sk-inspect-picker__chip-size">
                {Math.round(h().rect.width)}×{Math.round(h().rect.height)}
              </span>
            </div>
          </>
        )}
      </Show>

      <Show when={props.active}>
        <div class="sk-inspect-picker__hint" role="status">
          <Badge variant="info" size="sm">
            inspect
          </Badge>
          <Text size="xs" color="muted">
            Click an element to capture
          </Text>
          <Kbd keys={['Esc']} />
        </div>
      </Show>

      <Show when={props.capture}>
        {(cap) => (
          <div
            ref={(el) => {
              panelEl = el;
            }}
            class="sk-inspect-picker__panel"
            classList={{ 'sk-inspect-picker__panel--above': panelPos().placement === 'above' }}
            style={{ top: `${panelPos().top}px`, left: `${panelPos().left}px` }}
            role="dialog"
            aria-label={props.panelLabel ?? 'Inspected element'}
            tabIndex={-1}
          >
            <Card variant="elevated" padding="sm">
              <Stack gap="sm">
                <Flex justify="between" align="center" gap="sm">
                  <Flex gap="xs" align="center">
                    <Badge variant="info" size="sm">{`<${cap().tag}>`}</Badge>
                    <Text size="xs" color="muted">
                      {cap().rect.width}×{cap().rect.height}px
                    </Text>
                  </Flex>
                  <Flex gap="xs" align="center">
                    <Kbd keys={['Esc']} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => props.onCancel?.()}
                      aria-label="Close inspect panel (Esc)"
                    >
                      <X size="sm" aria-hidden="true" />
                    </Button>
                  </Flex>
                </Flex>

                <Text size="xs" class="sk-inspect-picker__selector">
                  {cap().selector}
                </Text>

                <Show when={cap().text.length > 0}>
                  <Text size="xs" color="muted" class="sk-inspect-picker__snippet">
                    {cap().text}
                  </Text>
                </Show>

                <Show when={props.actions}>
                  <div class="sk-inspect-picker__actions">{props.actions}</div>
                </Show>
              </Stack>
            </Card>
          </div>
        )}
      </Show>
    </div>
  );
};
