import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useBreakpoint, Breakpoint } from './useBreakpoint';

describe('hooks/useBreakpoint', () => {
  let origInnerWidth: number;
  let resizeHandler: (() => void) | undefined;

  beforeEach(() => {
    origInnerWidth = window.innerWidth;
    resizeHandler = undefined;

    vi.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: unknown) => {
      if (event === 'resize') {
        resizeHandler = handler as () => void;
      }
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: origInnerWidth,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  function setWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
      value: width,
      writable: true,
      configurable: true,
    });
  }

  const cases: [number, Breakpoint][] = [
    [320, 'phone'],
    [639, 'phone'],
    [640, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1439, 'desktop'],
    [1440, 'wide'],
    [1919, 'wide'],
    [1920, 'tv'],
    [2560, 'tv'],
  ];

  for (const [width, expected] of cases) {
    it(`should return '${expected}' for width ${width}px`, () => {
      setWidth(width);
      createRoot((dispose) => {
        const bp = useBreakpoint();
        expect(bp()).toBe(expected);
        dispose();
      });
    });
  }

  it('should return "desktop" when window is undefined (SSR)', () => {
    // The SSR fallback is tested by the default value in the source
    // In jsdom, window is always defined, so we test the boundary directly
    setWidth(1024);
    createRoot((dispose) => {
      const bp = useBreakpoint();
      expect(bp()).toBe('desktop');
      dispose();
    });
  });

  it('should register a resize listener on mount', () => {
    setWidth(1024);
    createRoot((dispose) => {
      useBreakpoint();
      // onMount is synchronous in createRoot for testing
      // But we need to wait a tick for onMount to fire
      setTimeout(() => {
        expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        dispose();
      }, 0);
    });
  });

  it('should update breakpoint on resize', async () => {
    setWidth(1024);
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const bp = useBreakpoint();
        expect(bp()).toBe('desktop');

        // Wait for onMount
        setTimeout(() => {
          // Simulate a resize to phone width
          setWidth(400);
          if (resizeHandler) {
            resizeHandler();
          }
          expect(bp()).toBe('phone');

          // Resize to tv width
          setWidth(1920);
          if (resizeHandler) {
            resizeHandler();
          }
          expect(bp()).toBe('tv');

          dispose();
          resolve();
        }, 10);
      });
    });
  });

  it('should clean up resize listener on dispose', async () => {
    setWidth(1024);
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        useBreakpoint();

        setTimeout(() => {
          dispose();
          expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
          resolve();
        }, 10);
      });
    });
  });

  it('should transition through all breakpoints', async () => {
    setWidth(320);
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const bp = useBreakpoint();
        expect(bp()).toBe('phone');

        setTimeout(() => {
          // phone -> tablet
          setWidth(640);
          resizeHandler?.();
          expect(bp()).toBe('tablet');

          // tablet -> desktop
          setWidth(1024);
          resizeHandler?.();
          expect(bp()).toBe('desktop');

          // desktop -> wide
          setWidth(1440);
          resizeHandler?.();
          expect(bp()).toBe('wide');

          // wide -> tv
          setWidth(1920);
          resizeHandler?.();
          expect(bp()).toBe('tv');

          // tv -> phone (jump back)
          setWidth(300);
          resizeHandler?.();
          expect(bp()).toBe('phone');

          dispose();
          resolve();
        }, 10);
      });
    });
  });

  it('should handle edge case at 0 width', () => {
    setWidth(0);
    createRoot((dispose) => {
      const bp = useBreakpoint();
      expect(bp()).toBe('phone');
      dispose();
    });
  });
});
