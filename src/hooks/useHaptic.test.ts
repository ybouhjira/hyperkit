import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useHaptic, createHaptic } from './useHaptic';

describe('hooks/useHaptic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createHaptic', () => {
    it('should detect vibration support', () => {
      const haptic = createHaptic();
      expect(typeof haptic.supported).toBe('boolean');
    });

    it('should have enabled true by default', () => {
      const haptic = createHaptic();
      expect(haptic.enabled).toBe(true);
    });

    it('should respect enabled option', () => {
      const haptic = createHaptic({ enabled: false });
      expect(haptic.enabled).toBe(false);
    });

    it('should have light, medium, heavy, and custom methods', () => {
      const haptic = createHaptic();
      expect(typeof haptic.light).toBe('function');
      expect(typeof haptic.medium).toBe('function');
      expect(typeof haptic.heavy).toBe('function');
      expect(typeof haptic.custom).toBe('function');
    });

    it('should not throw when vibration is not supported', () => {
      const haptic = createHaptic();
      expect(() => haptic.light()).not.toThrow();
      expect(() => haptic.medium()).not.toThrow();
      expect(() => haptic.heavy()).not.toThrow();
      expect(() => haptic.custom([10, 20])).not.toThrow();
    });

    it('should call navigator.vibrate when supported and enabled', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      const haptic = createHaptic({ enabled: true });
      haptic.light();

      if (haptic.supported) {
        expect(vibrateMock).toHaveBeenCalled();
      }
    });

    it('should not call navigator.vibrate when disabled', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      const haptic = createHaptic({ enabled: false });
      haptic.light();
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });

  describe('useHaptic', () => {
    it('should return reactive haptic state', () => {
      createRoot((dispose) => {
        const haptic = useHaptic();
        expect(haptic.enabled()).toBe(true);
        expect(typeof haptic.setEnabled).toBe('function');
        expect(typeof haptic.light).toBe('function');
        expect(typeof haptic.medium).toBe('function');
        expect(typeof haptic.heavy).toBe('function');
        expect(typeof haptic.custom).toBe('function');
        dispose();
      });
    });

    it('should toggle enabled state', () => {
      createRoot((dispose) => {
        const haptic = useHaptic();
        expect(haptic.enabled()).toBe(true);
        haptic.setEnabled(false);
        expect(haptic.enabled()).toBe(false);
        haptic.setEnabled(true);
        expect(haptic.enabled()).toBe(true);
        dispose();
      });
    });

    it('should respect initial enabled option', () => {
      createRoot((dispose) => {
        const haptic = useHaptic({ enabled: false });
        expect(haptic.enabled()).toBe(false);
        dispose();
      });
    });

    it('should not call navigator.vibrate when disabled via setEnabled', () => {
      createRoot((dispose) => {
        const vibrateMock = vi.fn();
        Object.defineProperty(navigator, 'vibrate', {
          value: vibrateMock,
          writable: true,
          configurable: true,
        });

        const haptic = useHaptic({ enabled: true });
        haptic.setEnabled(false);

        haptic.light();
        haptic.medium();
        haptic.heavy();
        haptic.custom(100);
        haptic.custom([10, 20, 30]);

        expect(vibrateMock).not.toHaveBeenCalled();
        dispose();
      });
    });

    it('should call navigator.vibrate with correct patterns when enabled and supported', () => {
      createRoot((dispose) => {
        const vibrateMock = vi.fn();
        Object.defineProperty(navigator, 'vibrate', {
          value: vibrateMock,
          writable: true,
          configurable: true,
        });

        const haptic = useHaptic({ enabled: true });

        if (haptic.supported) {
          haptic.light();
          expect(vibrateMock).toHaveBeenLastCalledWith(10);

          haptic.medium();
          expect(vibrateMock).toHaveBeenLastCalledWith(25);

          haptic.heavy();
          expect(vibrateMock).toHaveBeenLastCalledWith([50, 30, 50]);

          haptic.custom(42);
          expect(vibrateMock).toHaveBeenLastCalledWith(42);

          haptic.custom([100, 50, 100]);
          expect(vibrateMock).toHaveBeenLastCalledWith([100, 50, 100]);
        }
        dispose();
      });
    });
  });

  describe('createHaptic', () => {
    it('should call navigator.vibrate with correct patterns for medium, heavy, and custom', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      const haptic = createHaptic({ enabled: true });

      if (haptic.supported) {
        haptic.medium();
        expect(vibrateMock).toHaveBeenLastCalledWith(25);

        haptic.heavy();
        expect(vibrateMock).toHaveBeenLastCalledWith([50, 30, 50]);

        haptic.custom(99);
        expect(vibrateMock).toHaveBeenLastCalledWith(99);

        haptic.custom([1, 2, 3]);
        expect(vibrateMock).toHaveBeenLastCalledWith([1, 2, 3]);
      }
    });

    it('should not call navigator.vibrate for medium/heavy/custom when disabled', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      const haptic = createHaptic({ enabled: false });
      haptic.medium();
      haptic.heavy();
      haptic.custom(50);
      haptic.custom([10, 20]);
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });

  describe('vibration API absent', () => {
    it('reports supported=false when navigator.vibrate is missing', () => {
      const saved = navigator.vibrate;

      delete (navigator as Record<string, unknown>)['vibrate'];

      const haptic = createHaptic({ enabled: true });
      expect(haptic.supported).toBe(false);

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        value: saved,
        writable: true,
        configurable: true,
      });
    });

    it('does not throw when calling methods without vibrate support', () => {
      const saved = navigator.vibrate;

      delete (navigator as Record<string, unknown>)['vibrate'];

      const haptic = createHaptic({ enabled: true });
      expect(() => haptic.light()).not.toThrow();
      expect(() => haptic.medium()).not.toThrow();
      expect(() => haptic.heavy()).not.toThrow();
      expect(() => haptic.custom([1, 2])).not.toThrow();

      Object.defineProperty(navigator, 'vibrate', {
        value: saved,
        writable: true,
        configurable: true,
      });
    });

    it('useHaptic reports supported=false when vibrate is missing', () => {
      const saved = navigator.vibrate;

      delete (navigator as Record<string, unknown>)['vibrate'];

      createRoot((dispose) => {
        const haptic = useHaptic();
        expect(haptic.supported).toBe(false);
        expect(() => haptic.light()).not.toThrow();
        dispose();
      });

      Object.defineProperty(navigator, 'vibrate', {
        value: saved,
        writable: true,
        configurable: true,
      });
    });
  });
});
