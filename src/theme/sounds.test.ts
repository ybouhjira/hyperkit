/**
 * sounds.test — coverage for playTone / playUrl helpers.
 *
 * useThemeSounds itself wraps these + the active theme; integration is
 * exercised by the hyperlabs theme test which renders a ThemeProvider
 * and asserts the contract. These tests cover the pure helpers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { playTone, playUrl } from './sounds';

interface FakeOscillator {
  type: 'sine' | 'square' | 'triangle' | 'sawtooth';
  frequency: { value: number };
  connect: (n: unknown) => void;
  start: (t: number) => void;
  stop: (t: number) => void;
  onended?: () => void;
}

interface FakeGain {
  gain: {
    setValueAtTime: (v: number, t: number) => void;
    exponentialRampToValueAtTime: (v: number, t: number) => void;
  };
  connect: (n: unknown) => void;
}

interface FakeAudioContext {
  currentTime: number;
  destination: object;
  createOscillator: () => FakeOscillator;
  createGain: () => FakeGain;
  close: () => Promise<void>;
}

let lastOsc: FakeOscillator | null = null;
let lastGain: FakeGain | null = null;
let createCalls = 0;

function makeFakeCtx(): FakeAudioContext {
  const ctx: FakeAudioContext = {
    currentTime: 0,
    destination: {},
    createOscillator: () => {
      const osc: FakeOscillator = {
        type: 'sine',
        frequency: { value: 0 },
        connect: () => undefined,
        start: () => undefined,
        stop: () => undefined,
      };
      lastOsc = osc;
      return osc;
    },
    createGain: () => {
      const g: FakeGain = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: () => undefined,
      };
      lastGain = g;
      return g;
    },
    close: () => Promise.resolve(),
  };
  return ctx;
}

describe('playTone', () => {
  beforeEach(() => {
    createCalls = 0;
    lastOsc = null;
    lastGain = null;
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = function FakeAudioCtor() {
      createCalls++;
      return makeFakeCtx();
    } as unknown as typeof AudioContext;
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('synthesizes a tone with the merged preset (default frequency 440)', () => {
    playTone({}, 0.5);
    expect(lastOsc?.type).toBe('sine');
    expect(lastOsc?.frequency.value).toBe(440);
  });

  it('honors a custom frequency + wave', () => {
    playTone({ frequency: 880, wave: 'triangle', duration: 100, volume: 0.3 }, 1.0);
    expect(lastOsc?.frequency.value).toBe(880);
    expect(lastOsc?.type).toBe('triangle');
  });

  it('clamps the master*preset gain into [0, 1]', () => {
    playTone({ volume: 5 }, 5);
    const setSpy = lastGain?.gain.setValueAtTime as unknown as { mock: { calls: unknown[][] } };
    expect(setSpy.mock.calls[0]?.[0]).toBe(1);
  });

  it('clamps to 0 for negative inputs', () => {
    playTone({ volume: -1 }, 0.5);
    const setSpy = lastGain?.gain.setValueAtTime as unknown as { mock: { calls: unknown[][] } };
    expect(setSpy.mock.calls[0]?.[0]).toBe(0);
  });

  it('caches the AudioContext across calls (creation count never grows per call)', () => {
    const baseline = createCalls;
    playTone({}, 0.5);
    playTone({ frequency: 880 }, 0.5);
    playTone({ frequency: 220 }, 0.5);
    // Module-scope cache may already be warm from earlier tests, so accept
    // 0 or 1 new constructions for 3 calls — the contract is "no per-call
    // ctor", not "exactly one".
    expect(createCalls - baseline).toBeLessThanOrEqual(1);
  });

  it('is silent (no throw) when AudioContext is unavailable', () => {
    delete (globalThis as Record<string, unknown>).AudioContext;
    expect(() => playTone({}, 0.5)).not.toThrow();
  });

  it('survives an oscillator throw without bubbling', () => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = function ThrowingCtx() {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: () => {
          throw new Error('blocked by autoplay policy');
        },
        createGain: () => ({
          gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined },
          connect: () => undefined,
        }),
        close: () => Promise.resolve(),
      };
    } as unknown as typeof AudioContext;
    expect(() => playTone({}, 0.5)).not.toThrow();
  });
});

describe('playUrl', () => {
  let originalAudio: typeof Audio | undefined;
  let lastUrl: string | null = null;
  let lastVolume: number | null = null;

  beforeEach(() => {
    lastUrl = null;
    lastVolume = null;
    originalAudio = globalThis.Audio;
    (globalThis as unknown as { Audio: unknown }).Audio = class FakeAudio {
      volume = 0;
      constructor(public src: string) {
        lastUrl = src;
      }
      play() {
        lastVolume = this.volume;
        return Promise.resolve();
      }
    } as unknown as typeof Audio;
  });

  afterEach(() => {
    if (originalAudio !== undefined) {
      (globalThis as unknown as { Audio: typeof Audio }).Audio = originalAudio;
    } else {
      delete (globalThis as Record<string, unknown>).Audio;
    }
  });

  it('plays the requested URL', () => {
    playUrl('/click.mp3', 0.7);
    expect(lastUrl).toBe('/click.mp3');
    expect(lastVolume).toBeCloseTo(0.7);
  });

  it('clamps the volume to [0, 1]', () => {
    playUrl('/loud.mp3', 5);
    expect(lastVolume).toBe(1);
    playUrl('/loud.mp3', -1);
    expect(lastVolume).toBe(0);
  });

  it('is silent when Audio is unavailable', () => {
    delete (globalThis as Record<string, unknown>).Audio;
    expect(() => playUrl('/x.mp3', 0.5)).not.toThrow();
  });

  it('swallows constructor throws', () => {
    (globalThis as unknown as { Audio: unknown }).Audio = function Throws() {
      throw new Error('decoding failed');
    } as unknown as typeof Audio;
    expect(() => playUrl('/bad.mp3', 0.5)).not.toThrow();
  });

  it('swallows play() rejections', async () => {
    (globalThis as unknown as { Audio: unknown }).Audio = class FakeAudio {
      volume = 0;
      constructor(public src: string) {}
      play() {
        return Promise.reject(new Error('autoplay blocked'));
      }
    } as unknown as typeof Audio;
    expect(() => playUrl('/blocked.mp3', 0.5)).not.toThrow();
  });
});
