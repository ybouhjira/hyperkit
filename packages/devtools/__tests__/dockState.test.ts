import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DOCK_STORAGE_KEY,
  DOCK_POSITIONS,
  DEFAULT_DOCK_SIZES,
  isDockPosition,
  isSideDock,
  resizeCursor,
  loadDockPosition,
  saveDockPosition,
  nextDockSize,
  clampDockSize,
  type DockPosition,
} from '../src/dock/dockState';

beforeEach(() => {
  localStorage.clear();
});

describe('isDockPosition', () => {
  it('accepts the three dock positions', () => {
    expect(isDockPosition('bottom')).toBe(true);
    expect(isDockPosition('left')).toBe(true);
    expect(isDockPosition('right')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isDockPosition('top')).toBe(false);
    expect(isDockPosition(null)).toBe(false);
    expect(isDockPosition(undefined)).toBe(false);
    expect(isDockPosition(42)).toBe(false);
  });
});

describe('constants', () => {
  it('lists all positions in toolbar order', () => {
    expect(DOCK_POSITIONS).toEqual(['bottom', 'left', 'right']);
  });

  it('has a default size per position', () => {
    expect(DEFAULT_DOCK_SIZES.bottom).toBe(300);
    expect(DEFAULT_DOCK_SIZES.left).toBe(380);
    expect(DEFAULT_DOCK_SIZES.right).toBe(380);
  });
});

describe('isSideDock / resizeCursor', () => {
  it('left and right are side docks with ew-resize', () => {
    expect(isSideDock('left')).toBe(true);
    expect(isSideDock('right')).toBe(true);
    expect(resizeCursor('left')).toBe('ew-resize');
    expect(resizeCursor('right')).toBe('ew-resize');
  });

  it('bottom is not a side dock and uses ns-resize', () => {
    expect(isSideDock('bottom')).toBe(false);
    expect(resizeCursor('bottom')).toBe('ns-resize');
  });
});

describe('loadDockPosition', () => {
  it('returns the persisted value', () => {
    const storage = { getItem: vi.fn().mockReturnValue('right') };
    expect(loadDockPosition(storage)).toBe('right');
    expect(storage.getItem).toHaveBeenCalledWith(DOCK_STORAGE_KEY);
  });

  it('falls back to bottom when the key is missing', () => {
    expect(loadDockPosition({ getItem: () => null })).toBe('bottom');
  });

  it('falls back to bottom on an invalid stored value', () => {
    expect(loadDockPosition({ getItem: () => 'sideways' })).toBe('bottom');
  });

  it('falls back to bottom when storage reads throw', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
    };
    expect(loadDockPosition(storage)).toBe('bottom');
  });

  it('falls back to bottom when no storage exists', () => {
    expect(loadDockPosition(undefined)).toBe('bottom');
  });

  it('uses localStorage by default', () => {
    localStorage.setItem(DOCK_STORAGE_KEY, 'left');
    expect(loadDockPosition()).toBe('left');
  });
});

describe('saveDockPosition', () => {
  it('persists under the dock key', () => {
    const storage = { setItem: vi.fn() };
    saveDockPosition('right', storage);
    expect(storage.setItem).toHaveBeenCalledWith(DOCK_STORAGE_KEY, 'right');
  });

  it('swallows storage write failures (persistence is best-effort)', () => {
    const storage = {
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(() => saveDockPosition('left', storage)).not.toThrow();
  });

  it('no-ops when no storage exists', () => {
    expect(() => saveDockPosition('left', undefined)).not.toThrow();
  });

  it('uses localStorage by default', () => {
    saveDockPosition('right');
    expect(localStorage.getItem(DOCK_STORAGE_KEY)).toBe('right');
  });
});

describe('default storage resolution', () => {
  it('treats an inaccessible localStorage as missing storage', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      expect(loadDockPosition()).toBe('bottom');
      expect(() => saveDockPosition('left')).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', descriptor!);
    }
  });
});

describe('nextDockSize', () => {
  const start = { x: 500, y: 500 };

  it('bottom grows when dragging the handle up', () => {
    expect(nextDockSize('bottom', 300, start, { x: 500, y: 400 })).toBe(400);
    expect(nextDockSize('bottom', 300, start, { x: 500, y: 600 })).toBe(200);
  });

  it('right grows when dragging the handle left', () => {
    expect(nextDockSize('right', 380, start, { x: 400, y: 500 })).toBe(480);
    expect(nextDockSize('right', 380, start, { x: 600, y: 500 })).toBe(280);
  });

  it('left grows when dragging the handle right', () => {
    expect(nextDockSize('left', 380, start, { x: 600, y: 500 })).toBe(480);
    expect(nextDockSize('left', 380, start, { x: 400, y: 500 })).toBe(280);
  });
});

describe('clampDockSize', () => {
  const viewport = { width: 1024, height: 768 };

  it('enforces the bottom minimum height of 150', () => {
    expect(clampDockSize('bottom', 10, viewport)).toBe(150);
  });

  it('keeps 100px of app visible above a bottom dock', () => {
    expect(clampDockSize('bottom', 5000, viewport)).toBe(668);
  });

  it('passes through an in-range bottom height', () => {
    expect(clampDockSize('bottom', 300, viewport)).toBe(300);
  });

  it.each(['left', 'right'] as DockPosition[])(
    'enforces the side minimum width of 250 (%s)',
    (position) => {
      expect(clampDockSize(position, 10, viewport)).toBe(250);
    },
  );

  it.each(['left', 'right'] as DockPosition[])(
    'keeps 100px of app visible beside a %s dock',
    (position) => {
      expect(clampDockSize(position, 5000, viewport)).toBe(924);
    },
  );

  it('passes through an in-range side width', () => {
    expect(clampDockSize('right', 380, viewport)).toBe(380);
  });
});
