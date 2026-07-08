/**
 * Pure dock-position state for the DevTools panel.
 *
 * The panel can dock to the bottom (horizontal bar), or to the left/right
 * edge (full-height side panel, like a browser element inspector). The
 * chosen position persists to localStorage so it survives reloads.
 *
 * Everything in this module is pure/testable — no Solid, no DOM rendering.
 */

export type DockPosition = 'bottom' | 'left' | 'right';

/** localStorage key holding the persisted dock position. */
export const DOCK_STORAGE_KEY = 'hk-devtools-dock';

/** All dock positions in the order they appear in the toolbar control. */
export const DOCK_POSITIONS: readonly DockPosition[] = ['bottom', 'left', 'right'];

/** Default panel size (px) per dock position — height for bottom, width for sides. */
export const DEFAULT_DOCK_SIZES: Readonly<Record<DockPosition, number>> = {
  bottom: 300,
  left: 380,
  right: 380,
};

/** Minimum panel size (px) per axis. Structural values, not theme values. */
const MIN_BOTTOM_HEIGHT = 150;
const MIN_SIDE_WIDTH = 250;
/** Space (px) always left free for the app on the resized axis. */
const VIEWPORT_RESERVE = 100;

/** Type guard for values read back from storage. */
export function isDockPosition(value: unknown): value is DockPosition {
  return value === 'bottom' || value === 'left' || value === 'right';
}

/** True when the panel is a full-height side panel (resized on the x axis). */
export function isSideDock(position: DockPosition): boolean {
  return position === 'left' || position === 'right';
}

/** Cursor for the resize handle at a given dock position. */
export function resizeCursor(position: DockPosition): 'ns-resize' | 'ew-resize' {
  return isSideDock(position) ? 'ew-resize' : 'ns-resize';
}

/**
 * Read the persisted dock position. Falls back to 'bottom' when the key is
 * missing, holds an invalid value, or storage is unavailable (e.g. blocked
 * by browser privacy settings — reading must never crash the panel).
 */
export function loadDockPosition(
  storage: Pick<Storage, 'getItem'> | undefined = defaultStorage(),
): DockPosition {
  if (!storage) return 'bottom';
  try {
    const raw = storage.getItem(DOCK_STORAGE_KEY);
    return isDockPosition(raw) ? raw : 'bottom';
  } catch {
    return 'bottom';
  }
}

/**
 * Persist the dock position. Storage failures (quota, privacy mode) are
 * non-fatal: the panel keeps working for the session, only persistence is
 * lost — there is no better recovery than skipping the write.
 */
export function saveDockPosition(
  position: DockPosition,
  storage: Pick<Storage, 'setItem'> | undefined = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(DOCK_STORAGE_KEY, position);
  } catch {
    // Persistence is best-effort by design; see docblock.
  }
}

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export interface Point {
  x: number;
  y: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Compute the panel size during a resize drag.
 * - bottom dock: dragging the top handle up grows the panel (height).
 * - right dock: dragging the left handle left grows the panel (width).
 * - left dock: dragging the right handle right grows the panel (width).
 */
export function nextDockSize(
  position: DockPosition,
  startSize: number,
  start: Point,
  current: Point,
): number {
  switch (position) {
    case 'bottom':
      return startSize + (start.y - current.y);
    case 'right':
      return startSize + (start.x - current.x);
    case 'left':
      return startSize + (current.x - start.x);
  }
}

/**
 * Clamp a panel size so the panel stays usable and never swallows the whole
 * viewport: a minimum per axis, and at least VIEWPORT_RESERVE px of app left.
 */
export function clampDockSize(
  position: DockPosition,
  size: number,
  viewport: ViewportSize,
): number {
  const min = isSideDock(position) ? MIN_SIDE_WIDTH : MIN_BOTTOM_HEIGHT;
  const max = (isSideDock(position) ? viewport.width : viewport.height) - VIEWPORT_RESERVE;
  return Math.max(min, Math.min(max, size));
}
