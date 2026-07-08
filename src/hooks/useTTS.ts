import { createSignal, onCleanup } from 'solid-js';
import { logger } from '../utils/logger';

/**
 * Web Speech API (speechSynthesis) TTS hook + factory.
 *
 * Kept intentionally thin — a direct wrapper around the browser primitive.
 * When a higher-quality backend (Piper / ElevenLabs / server-side) ships,
 * it plugs in as an alternate `TTSHandle` implementation without touching
 * the callsites: the same `speak(text, opts?)` contract.
 */

export interface TTSOptions {
  /** Disabled hooks no-op. Default: true. */
  enabled?: boolean;
  /** Playback rate. 0.1–10, default 1. */
  rate?: number;
  /** Pitch. 0–2, default 1. */
  pitch?: number;
  /** Volume. 0–1, default 1. */
  volume?: number;
  /** BCP-47 language tag used as default when speak() doesn't override. */
  lang?: string;
  /** `SpeechSynthesisVoice.voiceURI` to prefer. Overrides auto-pick. */
  voiceURI?: string;
}

export interface TTSSpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  /** If false, queue behind current utterance. Default: true (interrupt). */
  interrupt?: boolean;
}

function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(
  voices: ReadonlyArray<SpeechSynthesisVoice>,
  lang: string,
  voiceURI: string | undefined
): SpeechSynthesisVoice | undefined {
  if (voiceURI !== undefined && voiceURI !== '') {
    const match = voices.find((v) => v.voiceURI === voiceURI);
    if (match) return match;
  }
  const langPrefix = lang.split('-')[0] ?? 'en';
  return (
    voices.find((v) => v.lang === lang && v.localService) ??
    voices.find((v) => v.lang.startsWith(langPrefix) && v.localService) ??
    voices.find((v) => v.lang.startsWith(langPrefix))
  );
}

function resolveLang(explicit: string | undefined, fallback: string | undefined): string {
  if (explicit !== undefined && explicit !== '') return explicit;
  if (fallback !== undefined && fallback !== '') return fallback;
  const docLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  return docLang !== '' ? docLang : 'en-US';
}

export interface TTSHandle {
  speak: (text: string, options?: TTSSpeakOptions) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: () => boolean;
  isSpeaking: () => boolean;
  isPaused: () => boolean;
  currentText: () => string;
  getVoices: () => SpeechSynthesisVoice[];
  enabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

/**
 * Non-reactive factory. Returned getters are plain functions, not signals —
 * use this when you need TTS outside a SolidJS component tree (e.g. from a
 * module-level service or an Effect layer).
 */
export function createTTS(options: TTSOptions = {}): TTSHandle {
  let enabled = options.enabled ?? true;
  let rate = options.rate ?? 1.0;
  let pitch = options.pitch ?? 1.0;
  let volume = options.volume ?? 1.0;

  let speaking = false;
  let paused = false;
  let text = '';

  const getVoices = (): SpeechSynthesisVoice[] =>
    isTTSSupported() ? window.speechSynthesis.getVoices() : [];

  const cancel = (): void => {
    if (!isTTSSupported()) return;
    window.speechSynthesis.cancel();
    speaking = false;
    paused = false;
    text = '';
  };

  const speak: TTSHandle['speak'] = (utteranceText, opts = {}) => {
    if (!enabled) return;
    if (!isTTSSupported()) {
      opts.onError?.('speechSynthesis not supported');
      return;
    }
    if (!utteranceText.trim()) return;

    if (opts.interrupt !== false) window.speechSynthesis.cancel();

    const lang = resolveLang(opts.lang, options.lang);
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.lang = lang;
    utterance.rate = opts.rate ?? rate;
    utterance.pitch = opts.pitch ?? pitch;
    utterance.volume = opts.volume ?? volume;

    const voice = pickVoice(getVoices(), lang, opts.voiceURI ?? options.voiceURI);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      speaking = true;
      paused = false;
      text = utteranceText;
      opts.onStart?.();
    };
    utterance.onend = () => {
      speaking = false;
      paused = false;
      text = '';
      opts.onEnd?.();
    };
    utterance.onerror = (e) => {
      speaking = false;
      paused = false;
      text = '';
      opts.onError?.(e.error ?? 'speech-error');
    };
    utterance.onpause = () => {
      paused = true;
    };
    utterance.onresume = () => {
      paused = false;
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      logger.error('createTTS: speak() threw', err);
      opts.onError?.(String(err));
    }
  };

  return {
    speak,
    cancel,
    pause: () => {
      if (isTTSSupported()) window.speechSynthesis.pause();
    },
    resume: () => {
      if (isTTSSupported()) window.speechSynthesis.resume();
    },
    isSupported: isTTSSupported,
    isSpeaking: () => speaking,
    isPaused: () => paused,
    currentText: () => text,
    getVoices,
    enabled: () => enabled,
    setEnabled: (v: boolean) => {
      enabled = v;
      if (!v) cancel();
    },
    setRate: (r: number) => {
      rate = Math.max(0.1, Math.min(10, r));
    },
    setVolume: (v: number) => {
      volume = Math.max(0, Math.min(1, v));
    },
  };
}

export interface UseTTSReturn {
  speak: (text: string, options?: TTSSpeakOptions) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: () => boolean;
  /** Reactive: true while an utterance is actively being spoken. */
  isSpeaking: () => boolean;
  /** Reactive: true while speech is paused. */
  isPaused: () => boolean;
  /** Reactive: the text currently being spoken, '' when idle. */
  currentText: () => string;
  /** Reactive enabled state. */
  enabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  getVoices: () => SpeechSynthesisVoice[];
}

/**
 * SolidJS reactive TTS hook. `isSpeaking`, `isPaused`, `currentText`, and
 * `enabled` are signals — wire them directly into your UI and the component
 * re-renders on utterance boundaries.
 *
 * Auto-cancels on component cleanup so a disposed component can't leave a
 * zombie utterance playing.
 */
export function useTTS(options: TTSOptions = {}): UseTTSReturn {
  const [enabled, setEnabledSignal] = createSignal(options.enabled ?? true);
  const [isSpeaking, setIsSpeaking] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [currentText, setCurrentText] = createSignal('');
  let rate = options.rate ?? 1.0;
  let volume = options.volume ?? 1.0;

  const cancel = (): void => {
    if (isTTSSupported()) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText('');
  };

  const speak: UseTTSReturn['speak'] = (text, opts = {}) => {
    if (!enabled()) return;
    if (!isTTSSupported()) {
      opts.onError?.('speechSynthesis not supported');
      return;
    }
    if (!text.trim()) return;

    if (opts.interrupt !== false) window.speechSynthesis.cancel();

    const lang = resolveLang(opts.lang, options.lang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = opts.rate ?? rate;
    utterance.pitch = opts.pitch ?? options.pitch ?? 1.0;
    utterance.volume = opts.volume ?? volume;

    const voices = isTTSSupported() ? window.speechSynthesis.getVoices() : [];
    const voice = pickVoice(voices, lang, opts.voiceURI ?? options.voiceURI);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentText(text);
      opts.onStart?.();
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
      opts.onEnd?.();
    };
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
      opts.onError?.(e.error ?? 'speech-error');
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      logger.error('useTTS: speak() threw', err);
      opts.onError?.(String(err));
    }
  };

  onCleanup(() => cancel());

  return {
    speak,
    cancel,
    pause: () => {
      if (isTTSSupported()) window.speechSynthesis.pause();
    },
    resume: () => {
      if (isTTSSupported()) window.speechSynthesis.resume();
    },
    isSupported: isTTSSupported,
    isSpeaking,
    isPaused,
    currentText,
    enabled,
    setEnabled: (v: boolean) => {
      setEnabledSignal(v);
      if (!v) cancel();
    },
    setRate: (r: number) => {
      rate = Math.max(0.1, Math.min(10, r));
    },
    setVolume: (v: number) => {
      volume = Math.max(0, Math.min(1, v));
    },
    getVoices: () => (isTTSSupported() ? window.speechSynthesis.getVoices() : []),
  };
}
