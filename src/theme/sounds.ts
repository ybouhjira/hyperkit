/**
 * useThemeSounds — premium sound design wired to the active theme.
 *
 * Each theme can declare a `sounds` block (master volume, enabled flag,
 * per-event presets). Components call `play('click')`, `play('hover')`,
 * etc — only events the theme defines are audible. Silent for unknown
 * keys, SSR-safe, browser-policy-safe (creates AudioContext on demand
 * inside a user gesture).
 *
 * Usage:
 *   const sounds = useThemeSounds();
 *   <button onClick={() => sounds.play('click')}>Save</button>
 *
 * Persistence:
 *   - master volume + enabled flag are persisted to localStorage under
 *     'sk-theme-sounds-config' so user preference survives reloads.
 */

import { createSignal, type Accessor } from 'solid-js';
import { useTheme } from './useTheme';
import type { ThemeSoundPreset, ThemeSounds } from './types';

const STORAGE_KEY = 'sk-theme-sounds-config';

const DEFAULT_PRESET: Required<Omit<ThemeSoundPreset, 'url'>> = {
  frequency: 440,
  duration: 80,
  volume: 0.5,
  wave: 'sine',
};

interface PersistedConfig {
  enabled: boolean;
  volume: number;
}

function loadPersisted(themeDefault: { enabled: boolean; volume: number }): PersistedConfig {
  if (typeof localStorage === 'undefined') return themeDefault;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return themeDefault;
    const parsed = JSON.parse(raw) as Partial<PersistedConfig>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : themeDefault.enabled,
      volume:
        typeof parsed.volume === 'number'
          ? Math.max(0, Math.min(1, parsed.volume))
          : themeDefault.volume,
    };
  } catch {
    return themeDefault;
  }
}

function persist(cfg: PersistedConfig): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore quota/private mode */
  }
}

let cachedAudioContext: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (cachedAudioContext) return cachedAudioContext;
  const Ctx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Ctx === undefined) return null;
  try {
    cachedAudioContext = new Ctx();
    return cachedAudioContext;
  } catch {
    return null;
  }
}

/** Pure: synthesize one tone via Web Audio. Returns nothing — silent on
 * any browser/SSR error, never throws. */
export function playTone(preset: ThemeSoundPreset, masterVolume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const merged = { ...DEFAULT_PRESET, ...preset };
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = merged.wave;
    osc.frequency.value = merged.frequency;
    const peakGain = Math.max(0, Math.min(1, masterVolume * merged.volume));
    gain.gain.setValueAtTime(peakGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + merged.duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + merged.duration / 1000);
  } catch {
    /* Web Audio sometimes throws under autoplay policy — silent fail. */
  }
}

/** Pure: load + play a URL preset via <audio>. */
export function playUrl(url: string, volume: number): void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    void audio.play().catch(() => {
      /* autoplay blocked — silent. */
    });
  } catch {
    /* ignore */
  }
}

export type ThemeSoundEventName = keyof ThemeSounds['events'];

export interface UseThemeSoundsReturn {
  /** Trigger a sound by event name. Silent if no preset for that event. */
  play: (event: ThemeSoundEventName) => void;
  /** Reactive: true when sounds are enabled overall. */
  enabled: Accessor<boolean>;
  /** Reactive: master volume 0..1. */
  volume: Accessor<number>;
  setEnabled: (v: boolean) => void;
  setVolume: (v: number) => void;
  /** Toggle — convenience for keyboard shortcut. */
  toggle: () => void;
}

/** Subscribes to the active theme's `sounds` config; persists user
 * overrides to localStorage. */
export function useThemeSounds(): UseThemeSoundsReturn {
  const { theme } = useTheme();
  const themeSounds = (): ThemeSounds | undefined => theme()?.sounds;

  const initial = loadPersisted({
    enabled: themeSounds()?.enabled ?? false,
    volume: themeSounds()?.volume ?? 0.5,
  });
  const [enabled, setEnabledSig] = createSignal<boolean>(initial.enabled);
  const [volume, setVolumeSig] = createSignal<number>(initial.volume);

  const setEnabled = (v: boolean): void => {
    setEnabledSig(v);
    persist({ enabled: v, volume: volume() });
  };
  const setVolume = (v: number): void => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeSig(clamped);
    persist({ enabled: enabled(), volume: clamped });
  };
  const toggle = (): void => setEnabled(!enabled());

  const play = (event: ThemeSoundEventName): void => {
    if (!enabled()) return;
    const preset = themeSounds()?.events?.[event];
    if (!preset) return;
    if (preset.url) {
      playUrl(preset.url, volume());
      return;
    }
    playTone(preset, volume());
  };

  return { play, enabled, volume, setEnabled, setVolume, toggle };
}
