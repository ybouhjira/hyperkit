import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { usePanelChrome } from './usePanelChrome';

describe('usePanelChrome', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts not idle', () => {
    createRoot((dispose) => {
      const { isIdle } = usePanelChrome();
      expect(isIdle()).toBe(false);
      dispose();
    });
  });

  it('becomes idle after timeout', () => {
    createRoot((dispose) => {
      const { isIdle, setContainerRef } = usePanelChrome({ idleTimeout: 1000 });
      const el = document.createElement('div');
      setContainerRef(el);

      vi.advanceTimersByTime(1100);
      expect(isIdle()).toBe(true);
      dispose();
    });
  });

  it('resets idle on mouse move', () => {
    createRoot((dispose) => {
      const { isIdle, setContainerRef } = usePanelChrome({ idleTimeout: 1000 });
      const el = document.createElement('div');
      setContainerRef(el);

      vi.advanceTimersByTime(800);
      el.dispatchEvent(new MouseEvent('mousemove'));
      vi.advanceTimersByTime(500);
      expect(isIdle()).toBe(false);

      vi.advanceTimersByTime(600);
      expect(isIdle()).toBe(true);
      dispose();
    });
  });

  it('goes idle on mouse leave', () => {
    createRoot((dispose) => {
      const { isIdle, setContainerRef } = usePanelChrome({ idleTimeout: 3000 });
      const el = document.createElement('div');
      setContainerRef(el);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      expect(isIdle()).toBe(true);
      dispose();
    });
  });

  it('uses default 3000ms timeout', () => {
    createRoot((dispose) => {
      const { isIdle, setContainerRef } = usePanelChrome();
      const el = document.createElement('div');
      setContainerRef(el);

      vi.advanceTimersByTime(2900);
      expect(isIdle()).toBe(false);

      vi.advanceTimersByTime(200);
      expect(isIdle()).toBe(true);
      dispose();
    });
  });
});
