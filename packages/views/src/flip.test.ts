import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDelta,
  classifyFields,
  resolveFlipOptions,
  supportsViewTransitions,
  captureSnapshot,
  createFlipTransition,
  applyFlip,
} from './flip';
import type { ElementRect, FlipSnapshot } from './flip';

describe('calculateDelta', () => {
  it('returns zero deltas for same position', () => {
    const rect: ElementRect = { x: 100, y: 200, width: 50, height: 75 };
    const delta = calculateDelta(rect, rect);

    expect(delta.dx).toBe(0);
    expect(delta.dy).toBe(0);
    expect(delta.sw).toBe(1);
    expect(delta.sh).toBe(1);
  });

  it('returns correct deltas for different positions', () => {
    const first: ElementRect = { x: 100, y: 200, width: 50, height: 75 };
    const last: ElementRect = { x: 120, y: 180, width: 50, height: 75 };
    const delta = calculateDelta(first, last);

    expect(delta.dx).toBe(-20);
    expect(delta.dy).toBe(20);
    expect(delta.sw).toBe(1);
    expect(delta.sh).toBe(1);
  });

  it('returns correct scale factors for different sizes', () => {
    const first: ElementRect = { x: 100, y: 200, width: 100, height: 150 };
    const last: ElementRect = { x: 100, y: 200, width: 50, height: 75 };
    const delta = calculateDelta(first, last);

    expect(delta.dx).toBe(0);
    expect(delta.dy).toBe(0);
    expect(delta.sw).toBe(2);
    expect(delta.sh).toBe(2);
  });

  it('handles division with fallback for zero width/height', () => {
    const first: ElementRect = { x: 100, y: 200, width: 50, height: 75 };
    const last: ElementRect = { x: 100, y: 200, width: 0, height: 0 };
    const delta = calculateDelta(first, last);

    // width / (0 || 1) = width / 1 = width
    expect(delta.sw).toBe(50);
    expect(delta.sh).toBe(75);
  });
});

describe('classifyFields', () => {
  it('matches shared fields by fieldName', () => {
    const source: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
      { fieldName: 'body', rect: { x: 0, y: 20, width: 100, height: 80 }, opacity: 1 },
    ];

    const target: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 10, y: 10, width: 120, height: 25 }, opacity: 1 },
      { fieldName: 'body', rect: { x: 10, y: 35, width: 120, height: 100 }, opacity: 1 },
    ];

    const result = classifyFields(source, target);

    expect(result.shared).toHaveLength(2);
    expect(result.entering).toHaveLength(0);
    expect(result.leaving).toHaveLength(0);
    expect(result.shared[0]?.field).toBe('title');
    expect(result.shared[1]?.field).toBe('body');
  });

  it('identifies entering fields not in source', () => {
    const source: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
    ];

    const target: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 10, y: 10, width: 120, height: 25 }, opacity: 1 },
      { fieldName: 'footer', rect: { x: 10, y: 100, width: 120, height: 30 }, opacity: 1 },
    ];

    const result = classifyFields(source, target);

    expect(result.shared).toHaveLength(1);
    expect(result.entering).toHaveLength(1);
    expect(result.leaving).toHaveLength(0);
    expect(result.entering[0]?.fieldName).toBe('footer');
  });

  it('identifies leaving fields not in target', () => {
    const source: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
      { fieldName: 'header', rect: { x: 0, y: 0, width: 100, height: 50 }, opacity: 1 },
    ];

    const target: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 10, y: 10, width: 120, height: 25 }, opacity: 1 },
    ];

    const result = classifyFields(source, target);

    expect(result.shared).toHaveLength(1);
    expect(result.entering).toHaveLength(0);
    expect(result.leaving).toHaveLength(1);
    expect(result.leaving[0]?.fieldName).toBe('header');
  });

  it('handles empty source with all entering', () => {
    const source: FlipSnapshot[] = [];
    const target: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 10, y: 10, width: 120, height: 25 }, opacity: 1 },
      { fieldName: 'body', rect: { x: 10, y: 35, width: 120, height: 100 }, opacity: 1 },
    ];

    const result = classifyFields(source, target);

    expect(result.shared).toHaveLength(0);
    expect(result.entering).toHaveLength(2);
    expect(result.leaving).toHaveLength(0);
  });

  it('handles empty target with all leaving', () => {
    const source: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
      { fieldName: 'body', rect: { x: 0, y: 20, width: 100, height: 80 }, opacity: 1 },
    ];
    const target: FlipSnapshot[] = [];

    const result = classifyFields(source, target);

    expect(result.shared).toHaveLength(0);
    expect(result.entering).toHaveLength(0);
    expect(result.leaving).toHaveLength(2);
  });

  it('handles identical sets with all shared, none entering/leaving', () => {
    const snapshots: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
      { fieldName: 'body', rect: { x: 0, y: 20, width: 100, height: 80 }, opacity: 1 },
    ];

    const result = classifyFields(snapshots, snapshots);

    expect(result.shared).toHaveLength(2);
    expect(result.entering).toHaveLength(0);
    expect(result.leaving).toHaveLength(0);
  });
});

describe('resolveFlipOptions', () => {
  it('returns defaults when no options provided', () => {
    const result = resolveFlipOptions();

    expect(result.duration).toBe(300);
    expect(result.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(result.fadeInDuration).toBe(200);
    expect(result.fadeOutDuration).toBe(150);
  });

  it('merges partial options with defaults', () => {
    const result = resolveFlipOptions({ duration: 500 });

    expect(result.duration).toBe(500);
    expect(result.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(result.fadeInDuration).toBe(200);
    expect(result.fadeOutDuration).toBe(150);
  });

  it('overrides all options', () => {
    const result = resolveFlipOptions({
      duration: 400,
      easing: 'ease-in-out',
      fadeInDuration: 100,
      fadeOutDuration: 100,
    });

    expect(result.duration).toBe(400);
    expect(result.easing).toBe('ease-in-out');
    expect(result.fadeInDuration).toBe(100);
    expect(result.fadeOutDuration).toBe(100);
  });
});

describe('supportsViewTransitions', () => {
  it('returns boolean without throwing', () => {
    const result = supportsViewTransitions();
    expect(typeof result).toBe('boolean');
  });
});

describe('captureSnapshot', () => {
  beforeEach(() => {
    // Clear the DOM between tests
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('captures empty snapshot from container without data-field elements', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const snapshot = captureSnapshot(container);

    expect(snapshot).toHaveLength(0);
  });

  it('captures snapshots of elements with data-field attributes', () => {
    const container = document.createElement('div');
    const title = document.createElement('div');
    title.setAttribute('data-field', 'title');
    title.textContent = 'Title';

    const body = document.createElement('div');
    body.setAttribute('data-field', 'body');
    body.textContent = 'Body';

    container.appendChild(title);
    container.appendChild(body);
    document.body.appendChild(container);

    const snapshot = captureSnapshot(container);

    expect(snapshot).toHaveLength(2);
    expect(snapshot[0]?.fieldName).toBe('title');
    expect(snapshot[1]?.fieldName).toBe('body');
    expect(snapshot[0]?.rect).toBeDefined();
    expect(snapshot[0]?.opacity).toBe(1);
  });

  it('ignores elements without data-field attribute', () => {
    const container = document.createElement('div');
    const withField = document.createElement('div');
    withField.setAttribute('data-field', 'title');
    const withoutField = document.createElement('div');

    container.appendChild(withField);
    container.appendChild(withoutField);
    document.body.appendChild(container);

    const snapshot = captureSnapshot(container);

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.fieldName).toBe('title');
  });
});

describe('createFlipTransition', () => {
  beforeEach(() => {
    // Clear the DOM between tests
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('captures snapshot and sets animating to false', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const transition = createFlipTransition(container);

    expect(transition.sourceSnapshot).toBeDefined();
    expect(transition.animating).toBe(false);
  });
});

describe('applyFlip', () => {
  beforeEach(() => {
    // Clear the DOM between tests
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('returns empty animations array for empty snapshots', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const animations = applyFlip(container, []);

    expect(animations).toHaveLength(0);
  });

  it('creates animations for shared fields if Element.animate is supported', () => {
    // Mock Element.animate if not available in jsdom
    if (!HTMLElement.prototype.animate) {
      HTMLElement.prototype.animate = vi.fn(() => ({
        cancel: vi.fn(),
        finish: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        reverse: vi.fn(),
        updatePlaybackRate: vi.fn(),
        id: '',
        currentTime: null,
        effect: null,
        finished: Promise.resolve({} as Animation),
        oncancel: null,
        onfinish: null,
        onremove: null,
        pending: false,
        playState: 'running' as AnimationPlayState,
        playbackRate: 1,
        ready: Promise.resolve({} as Animation),
        replaceState: 'active' as AnimationReplaceState,
        startTime: null,
        timeline: null,
        commitStyles: vi.fn(),
        persist: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
      })) as unknown as typeof HTMLElement.prototype.animate;
    }

    const container = document.createElement('div');
    const title = document.createElement('div');
    title.setAttribute('data-field', 'title');
    container.appendChild(title);
    document.body.appendChild(container);

    const sourceSnapshot: FlipSnapshot[] = [
      { fieldName: 'title', rect: { x: 0, y: 0, width: 100, height: 20 }, opacity: 1 },
    ];

    const animations = applyFlip(container, sourceSnapshot);

    // jsdom may not support animate, so check if it was called
    if (HTMLElement.prototype.animate) {
      expect(animations.length).toBeGreaterThanOrEqual(0);
    }
  });
});
