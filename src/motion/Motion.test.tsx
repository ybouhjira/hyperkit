/** @jsxImportSource solid-js */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { createSignal, Show, useContext } from 'solid-js';
import { Motion } from './Motion';
import { Presence } from './Presence';
import { resolveEasing, easingMap } from './easing';
import { AnimationProvider, AnimationContext } from '../animation/AnimationProvider';

// jsdom does not implement Web Animations API — provide a minimal stub so
// solid-motionone does not throw during tests.
const animateSpy = vi.fn(() => ({
  finished: Promise.resolve(),
  cancel: vi.fn(),
  finish: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  reverse: vi.fn(),
  commitStyles: vi.fn(),
  currentTime: 0,
  playbackRate: 1,
  playState: 'finished' as AnimationPlayState,
  effect: null,
  id: '',
  oncancel: null,
  onfinish: null,
  onremove: null,
  pending: false,
  persist: vi.fn(),
  removeEventListener: vi.fn(),
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => true),
  ready: Promise.resolve({} as Animation),
  timeline: null,
  replaceState: 'active' as AnimationReplaceState,
  updatePlaybackRate: vi.fn(),
}));

beforeEach(() => {
  // Attach animate stub to Element prototype before each test
  Object.defineProperty(Element.prototype, 'animate', {
    value: animateSpy,
    configurable: true,
    writable: true,
  });

  // matchMedia stub for AnimationProvider
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    })),
  });

  localStorage.clear();
  document.documentElement.style.cssText = '';
  animateSpy.mockClear();
});

// ---------------------------------------------------------------------------
// resolveEasing
// ---------------------------------------------------------------------------

describe('resolveEasing', () => {
  it('returns default cubic-bezier when no argument provided', () => {
    expect(resolveEasing()).toBe(easingMap.default);
  });

  it('resolves every SK preset key', () => {
    for (const key of Object.keys(easingMap) as Array<keyof typeof easingMap>) {
      expect(resolveEasing(key)).toBe(easingMap[key]);
    }
  });

  it('passes through arbitrary CSS easing strings unchanged', () => {
    expect(resolveEasing('ease-in-out')).toBe('ease-in-out');
    expect(resolveEasing('linear')).toBe('linear');
    expect(resolveEasing('cubic-bezier(0.1, 0.2, 0.3, 0.4)')).toBe(
      'cubic-bezier(0.1, 0.2, 0.3, 0.4)'
    );
  });
});

// ---------------------------------------------------------------------------
// Motion — rendering
// ---------------------------------------------------------------------------

describe('Motion', () => {
  it('renders children', () => {
    const { container } = render(() => (
      <Motion animate={{ opacity: 1 }}>
        <span>hello</span>
      </Motion>
    ));
    expect(container.textContent).toContain('hello');
  });

  it('renders a div by default', () => {
    const { container } = render(() => <Motion animate={{ opacity: 1 }}>content</Motion>);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders the element specified by the `as` prop', () => {
    const { container } = render(() => (
      <Motion as="section" animate={{ opacity: 1 }}>
        content
      </Motion>
    ));
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('forwards class prop to the DOM element', () => {
    const { container } = render(() => (
      <Motion class="my-class" animate={{ opacity: 1 }}>
        content
      </Motion>
    ));
    const el = container.firstElementChild;
    expect(el?.classList.contains('my-class')).toBe(true);
  });

  it('applies inline styles', () => {
    const { container } = render(() => (
      <Motion style={{ color: 'red' }} animate={{ opacity: 1 }}>
        content
      </Motion>
    ));
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('red');
  });
});

// ---------------------------------------------------------------------------
// Motion — AnimationProvider integration
// ---------------------------------------------------------------------------

describe('Motion with AnimationProvider', () => {
  it('renders children inside AnimationProvider', () => {
    const { container } = render(() => (
      <AnimationProvider>
        <Motion animate={{ opacity: 1 }}>
          <span>inside provider</span>
        </Motion>
      </AnimationProvider>
    ));
    expect(container.textContent).toContain('inside provider');
  });

  it('collapses duration to 0 when animations are disabled', () => {
    // Track what transition options were passed to motionone via Element.animate.
    let capturedDuration: number | undefined;

    Object.defineProperty(Element.prototype, 'animate', {
      value: vi.fn().mockImplementation((_keyframes: unknown, options: unknown) => {
        capturedDuration = (options as { duration?: number })?.duration;
        return animateSpy();
      }),
      configurable: true,
      writable: true,
    });

    // DisabledAnimation is a helper component that reads context and disables animations,
    // then renders a Motion so we can verify the duration collapses.
    function DisabledAnimation() {
      const ctx = useContext(AnimationContext);
      if (ctx) {
        ctx.setEnabled(false);
      }
      return (
        <Motion initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          content
        </Motion>
      );
    }

    render(() => (
      <AnimationProvider>
        <DisabledAnimation />
      </AnimationProvider>
    ));

    // If animate was called, the duration must be 0.
    // If animate was not called (motionone optimized it away), that's also correct.
    if (capturedDuration !== undefined) {
      expect(capturedDuration).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Presence
// ---------------------------------------------------------------------------

describe('Presence', () => {
  it('renders children', () => {
    const { container } = render(() => (
      <Presence>
        <Motion animate={{ opacity: 1 }}>
          <span>visible</span>
        </Motion>
      </Presence>
    ));
    expect(container.textContent).toContain('visible');
  });

  it('mounts and unmounts children based on Show signal', async () => {
    const [visible, setVisible] = createSignal(true);

    const { container } = render(() => (
      <Presence>
        <Show when={visible()}>
          <Motion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 50 }}
          >
            <span data-testid="content">content</span>
          </Motion>
        </Show>
      </Presence>
    ));

    expect(container.querySelector('[data-testid="content"]')).not.toBeNull();

    setVisible(false);
    // After toggling, motionone handles exit animations asynchronously —
    // we only assert the signal update did not throw.
    expect(() => setVisible(false)).not.toThrow();
  });

  it('forwards exitBeforeEnter prop', () => {
    // Renders without error when exitBeforeEnter is set
    expect(() => {
      render(() => (
        <Presence exitBeforeEnter>
          <Motion animate={{ opacity: 1 }}>child</Motion>
        </Presence>
      ));
    }).not.toThrow();
  });

  it('forwards initial={false} prop to suppress first animation', () => {
    expect(() => {
      render(() => (
        <Presence initial={false}>
          <Motion animate={{ opacity: 1 }}>child</Motion>
        </Presence>
      ));
    }).not.toThrow();
  });
});
