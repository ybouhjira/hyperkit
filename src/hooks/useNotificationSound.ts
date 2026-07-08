import { createSignal } from 'solid-js';
import { logger } from '../utils/logger';

export interface NotificationSoundOptions {
  enabled?: boolean;
  volume?: number;
  frequency?: number;
  duration?: number;
}

export interface NotificationSoundReturn {
  play: () => void;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  enabled: () => boolean;
  volume: () => number;
}

/**
 * Shared function to play a tone using Web Audio API.
 * Handles SSR, AudioContext creation, and proper cleanup.
 */
function playTone(frequency: number, duration: number, volume: number): void {
  // SSR guard
  if (typeof window === 'undefined') return;

  const AudioCtx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (AudioCtx === undefined) return;

  const audioContext = new AudioCtx();
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);

    oscillator.onended = () => {
      void audioContext.close();
    };
  } catch (error) {
    // Close AudioContext on error to prevent leak
    void audioContext.close();
    throw error;
  }
}

/**
 * Creates a notification sound utility using Web Audio API.
 * This is a non-hook version that can be used outside of components.
 *
 * @param options - Configuration options for the notification sound
 * @returns An object with methods to control the notification sound
 */
export function createNotificationSound(
  options: NotificationSoundOptions = {}
): NotificationSoundReturn {
  const {
    enabled: initialEnabled = true,
    volume: initialVolume = 0.5,
    frequency: initialFrequency = 880, // A5 note
    duration: initialDuration = 150,
  } = options;

  let _enabled = initialEnabled;
  let _volume = initialVolume;
  let _frequency = initialFrequency;
  let _duration = initialDuration;

  const play = () => {
    // Only play if enabled and tab is not visible
    if (!_enabled || !document.hidden) {
      return;
    }

    try {
      playTone(_frequency, _duration, _volume);
    } catch (error) {
      logger.error('Failed to play notification sound:', error);
    }
  };

  return {
    play,
    setEnabled: (enabled: boolean) => {
      _enabled = enabled;
    },
    setVolume: (volume: number) => {
      _volume = Math.max(0, Math.min(1, volume));
    },
    enabled: () => _enabled,
    volume: () => _volume,
  };
}

/**
 * A SolidJS hook for playing notification sounds using Web Audio API.
 * Automatically detects tab visibility and only plays when the tab is inactive.
 *
 * @param options - Configuration options for the notification sound
 * @returns An object with methods to control the notification sound and reactive signals
 *
 * @example
 * ```tsx
 * const { play, setEnabled, setVolume, enabled, volume } = useNotificationSound({
 *   enabled: true,
 *   volume: 0.5,
 *   frequency: 880, // A5 note
 *   duration: 150,
 * });
 *
 * // Play sound (only when tab is inactive)
 * play();
 *
 * // Toggle enabled state
 * setEnabled(!enabled());
 *
 * // Adjust volume
 * setVolume(0.8);
 * ```
 */
export function useNotificationSound(
  options: NotificationSoundOptions = {}
): NotificationSoundReturn {
  const {
    enabled: initialEnabled = true,
    volume: initialVolume = 0.5,
    frequency = 880, // A5 note
    duration = 150,
  } = options;

  const [enabled, setEnabled] = createSignal(initialEnabled);
  const [volume, setVolume] = createSignal(initialVolume);

  const play = () => {
    // Only play if enabled and tab is not visible
    if (!enabled() || !document.hidden) {
      return;
    }

    try {
      playTone(frequency, duration, volume());
    } catch (error) {
      logger.error('Failed to play notification sound:', error);
    }
  };

  const setVolumeWithValidation = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return {
    play,
    setEnabled,
    setVolume: setVolumeWithValidation,
    enabled,
    volume,
  };
}
