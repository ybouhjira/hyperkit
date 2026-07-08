import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useNotificationSound, createNotificationSound } from './useNotificationSound';

// Mock AudioContext
const mockClose = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockConnect = vi.fn();
const mockSetValueAtTime = vi.fn();
const mockExponentialRamp = vi.fn();

let lastOscillator: MockOscillator | undefined;

class MockOscillator {
  frequency = { value: 440 };
  type = 'sine';
  onended: (() => void) | null = null;
  connect = mockConnect;
  start = mockStart;
  stop = mockStop;
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastOscillator = this;
  }
}

class MockGainNode {
  gain = {
    setValueAtTime: mockSetValueAtTime,
    exponentialRampToValueAtTime: mockExponentialRamp,
  };
  connect = mockConnect;
}

class MockAudioContext {
  currentTime = 0;
  createOscillator = () => new MockOscillator();
  createGain = () => new MockGainNode();
  destination = {};
  close = mockClose;
}

describe('hooks/useNotificationSound', () => {
  let originalHidden: boolean;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockClose.mockReset();
    mockStart.mockReset();
    mockStop.mockReset();
    mockConnect.mockReset();
    mockSetValueAtTime.mockReset();
    mockExponentialRamp.mockReset();
    lastOscillator = undefined;

    originalHidden = document.hidden;

    // Mock AudioContext
    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'hidden', {
      value: originalHidden,
      configurable: true,
    });
  });

  describe('createNotificationSound', () => {
    it('should create with default options', () => {
      const sound = createNotificationSound();
      expect(sound.enabled()).toBe(true);
      expect(sound.volume()).toBe(0.5);
    });

    it('should respect custom options', () => {
      const sound = createNotificationSound({ enabled: false, volume: 0.8 });
      expect(sound.enabled()).toBe(false);
      expect(sound.volume()).toBe(0.8);
    });

    it('should have play method', () => {
      const sound = createNotificationSound();
      expect(typeof sound.play).toBe('function');
    });

    it('should toggle enabled', () => {
      const sound = createNotificationSound();
      expect(sound.enabled()).toBe(true);
      sound.setEnabled(false);
      expect(sound.enabled()).toBe(false);
    });

    it('should update volume', () => {
      const sound = createNotificationSound();
      sound.setVolume(0.8);
      expect(sound.volume()).toBe(0.8);
    });

    it('should clamp volume to 0-1 range', () => {
      const sound = createNotificationSound();
      sound.setVolume(1.5);
      expect(sound.volume()).toBe(1);
      sound.setVolume(-0.5);
      expect(sound.volume()).toBe(0);
      sound.setVolume(0.7);
      expect(sound.volume()).toBe(0.7);
    });

    it('should not play when disabled', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ enabled: false });
      sound.play();
      expect(mockStart).not.toHaveBeenCalled();
    });

    it('should not play when document is visible', () => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      const sound = createNotificationSound({ enabled: true });
      sound.play();
      expect(mockStart).not.toHaveBeenCalled();
    });

    it('should play when enabled and tab is hidden', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ enabled: true });
      sound.play();
      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    });

    it('should set correct frequency from options', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ frequency: 440 });
      sound.play();
      expect(lastOscillator).toBeDefined();
      expect(lastOscillator!.frequency.value).toBe(440);
    });

    it('should set gain volume from options', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ volume: 0.7 });
      sound.play();
      expect(mockSetValueAtTime).toHaveBeenCalledWith(0.7, 0);
    });

    it('should set exponential ramp based on duration', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ duration: 200 });
      sound.play();
      expect(mockExponentialRamp).toHaveBeenCalledWith(0.01, 0.2);
    });

    it('should close AudioContext when oscillator ends', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound();
      sound.play();
      expect(lastOscillator).toBeDefined();
      expect(lastOscillator!.onended).toBeTypeOf('function');
      lastOscillator!.onended!();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle missing AudioContext gracefully', () => {
      Object.defineProperty(window, 'AudioContext', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const win = window as unknown as Record<string, unknown>;
      const origWebkit = win['webkitAudioContext'];
      delete win['webkitAudioContext'];
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });

      const sound = createNotificationSound();
      expect(() => sound.play()).not.toThrow();

      if (origWebkit !== undefined) {
        win['webkitAudioContext'] = origWebkit;
      }
    });

    it('should catch and log errors from AudioContext', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      Object.defineProperty(window, 'AudioContext', {
        value: class {
          currentTime = 0;
          destination = {};
          close = vi.fn();
          createOscillator() {
            throw new Error('Audio error');
          }
          createGain = () => new MockGainNode();
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });

      const sound = createNotificationSound();
      expect(() => sound.play()).not.toThrow();
      errorSpy.mockRestore();
    });

    it('should use updated volume after setVolume', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ volume: 0.2 });
      sound.setVolume(0.9);
      sound.play();
      expect(mockSetValueAtTime).toHaveBeenCalledWith(0.9, 0);
    });

    it('should re-enable after setEnabled(true)', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      const sound = createNotificationSound({ enabled: false });
      sound.play();
      expect(mockStart).not.toHaveBeenCalled();
      sound.setEnabled(true);
      sound.play();
      expect(mockStart).toHaveBeenCalled();
    });

    it('should use webkitAudioContext as fallback', () => {
      Object.defineProperty(window, 'AudioContext', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const win = window as unknown as Record<string, unknown>;
      win['webkitAudioContext'] = MockAudioContext;
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });

      const sound = createNotificationSound();
      sound.play();
      expect(mockStart).toHaveBeenCalled();

      delete win['webkitAudioContext'];
    });
  });

  describe('useNotificationSound', () => {
    it('should return reactive notification sound state', () => {
      createRoot((dispose) => {
        const sound = useNotificationSound();
        expect(sound.enabled()).toBe(true);
        expect(sound.volume()).toBe(0.5);
        expect(typeof sound.play).toBe('function');
        expect(typeof sound.setEnabled).toBe('function');
        expect(typeof sound.setVolume).toBe('function');
        dispose();
      });
    });

    it('should toggle enabled reactively', () => {
      createRoot((dispose) => {
        const sound = useNotificationSound();
        expect(sound.enabled()).toBe(true);
        sound.setEnabled(false);
        expect(sound.enabled()).toBe(false);
        dispose();
      });
    });

    it('should update volume reactively', () => {
      createRoot((dispose) => {
        const sound = useNotificationSound();
        sound.setVolume(0.3);
        expect(sound.volume()).toBe(0.3);
        dispose();
      });
    });

    it('should respect initial options', () => {
      createRoot((dispose) => {
        const sound = useNotificationSound({ volume: 0.9, enabled: false });
        expect(sound.volume()).toBe(0.9);
        expect(sound.enabled()).toBe(false);
        dispose();
      });
    });

    it('should clamp volume reactively', () => {
      createRoot((dispose) => {
        const sound = useNotificationSound();
        sound.setVolume(1.5);
        expect(sound.volume()).toBe(1);
        sound.setVolume(-1);
        expect(sound.volume()).toBe(0);
        sound.setVolume(0.6);
        expect(sound.volume()).toBe(0.6);
        dispose();
      });
    });

    it('should play when enabled and tab hidden', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      createRoot((dispose) => {
        const sound = useNotificationSound({ enabled: true, frequency: 660 });
        sound.play();
        expect(mockStart).toHaveBeenCalled();
        expect(lastOscillator!.frequency.value).toBe(660);
        dispose();
      });
    });

    it('should not play after disabling via setEnabled', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      createRoot((dispose) => {
        const sound = useNotificationSound({ enabled: true });
        sound.setEnabled(false);
        sound.play();
        expect(mockStart).not.toHaveBeenCalled();
        dispose();
      });
    });

    it('should use current volume signal when playing', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      createRoot((dispose) => {
        const sound = useNotificationSound({ enabled: true, volume: 0.2 });
        sound.setVolume(0.9);
        sound.play();
        expect(mockSetValueAtTime).toHaveBeenCalledWith(0.9, 0);
        dispose();
      });
    });

    it('should not play when document is visible', () => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      createRoot((dispose) => {
        const sound = useNotificationSound({ enabled: true });
        sound.play();
        expect(mockStart).not.toHaveBeenCalled();
        dispose();
      });
    });

    it('should catch playTone errors without throwing', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      Object.defineProperty(window, 'AudioContext', {
        value: class {
          currentTime = 0;
          destination = {};
          close = vi.fn();
          createOscillator() {
            throw new Error('Audio error');
          }
          createGain = () => new MockGainNode();
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });

      createRoot((dispose) => {
        const sound = useNotificationSound({ enabled: true });
        expect(() => sound.play()).not.toThrow();
        dispose();
      });
      errorSpy.mockRestore();
    });
  });
});
