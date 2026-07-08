import { createSignal } from 'solid-js';

export interface HapticOptions {
  enabled?: boolean;
}

export interface HapticReturn {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  custom: (pattern: number | number[]) => void;
  supported: boolean;
  enabled: () => boolean;
  setEnabled: (value: boolean) => void;
}

/**
 * Check if Vibration API is supported
 */
const isVibrationSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Vibrate the device with the given pattern
 */
const vibrate = (pattern: number | number[]): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(pattern);
  }
};

/**
 * Hook for haptic feedback using the Vibration API
 *
 * @param options - Configuration options
 * @returns Methods for triggering haptic feedback
 *
 * @example
 * ```tsx
 * const haptic = useHaptic();
 *
 * <Button onClick={() => haptic.light()}>Tap me</Button>
 * ```
 */
export function useHaptic(options: HapticOptions = {}): HapticReturn {
  const [enabled, setEnabled] = createSignal(options.enabled ?? true);
  const supported = isVibrationSupported();

  const light = () => {
    if (enabled() && supported) {
      vibrate(10);
    }
  };

  const medium = () => {
    if (enabled() && supported) {
      vibrate(25);
    }
  };

  const heavy = () => {
    if (enabled() && supported) {
      vibrate([50, 30, 50]);
    }
  };

  const custom = (pattern: number | number[]) => {
    if (enabled() && supported) {
      vibrate(pattern);
    }
  };

  return {
    light,
    medium,
    heavy,
    custom,
    supported,
    enabled,
    setEnabled,
  };
}

/**
 * Non-hook version for use outside components
 *
 * @param options - Configuration options
 * @returns Methods for triggering haptic feedback
 *
 * @example
 * ```tsx
 * const haptic = createHaptic();
 * haptic.light();
 * ```
 */
export function createHaptic(
  options: HapticOptions = {}
): Omit<HapticReturn, 'enabled' | 'setEnabled'> & { enabled: boolean } {
  const enabled = options.enabled ?? true;
  const supported = isVibrationSupported();

  const light = () => {
    if (enabled && supported) {
      vibrate(10);
    }
  };

  const medium = () => {
    if (enabled && supported) {
      vibrate(25);
    }
  };

  const heavy = () => {
    if (enabled && supported) {
      vibrate([50, 30, 50]);
    }
  };

  const custom = (pattern: number | number[]) => {
    if (enabled && supported) {
      vibrate(pattern);
    }
  };

  return {
    light,
    medium,
    heavy,
    custom,
    supported,
    enabled,
  };
}
