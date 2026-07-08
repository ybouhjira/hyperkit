import { createRoot } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTTS, useTTS } from './useTTS';

type UtteranceLike = SpeechSynthesisUtterance & {
  onstart?: () => void;
  onend?: () => void;
  onerror?: (e: { error: string }) => void;
};

let speakCalls: UtteranceLike[] = [];
let cancelCalls = 0;

class MockUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

const mockSynth = {
  speak: (u: UtteranceLike) => {
    speakCalls.push(u);
    queueMicrotask(() => u.onstart?.());
  },
  cancel: () => {
    cancelCalls += 1;
  },
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [] as SpeechSynthesisVoice[],
};

beforeEach(() => {
  speakCalls = [];
  cancelCalls = 0;
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: mockSynth,
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockUtterance,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createTTS (factory)', () => {
  it('speak() sends an utterance to speechSynthesis', () => {
    const tts = createTTS();
    tts.speak('hello world');
    expect(speakCalls.length).toBe(1);
    expect(speakCalls[0]?.text).toBe('hello world');
  });

  it('interrupts current utterance by default', () => {
    const tts = createTTS();
    tts.speak('one');
    tts.speak('two');
    expect(cancelCalls).toBeGreaterThanOrEqual(1);
  });

  it('queues behind current utterance when interrupt=false', () => {
    const tts = createTTS();
    tts.speak('one');
    cancelCalls = 0;
    tts.speak('two', { interrupt: false });
    expect(cancelCalls).toBe(0);
  });

  it('no-ops when disabled', () => {
    const tts = createTTS({ enabled: false });
    tts.speak('should not speak');
    expect(speakCalls.length).toBe(0);
  });

  it('setEnabled(false) cancels current speech', () => {
    const tts = createTTS();
    tts.speak('hi');
    tts.setEnabled(false);
    expect(cancelCalls).toBeGreaterThanOrEqual(1);
  });

  it('ignores empty strings', () => {
    const tts = createTTS();
    tts.speak('   ');
    expect(speakCalls.length).toBe(0);
  });

  it('applies rate/pitch/volume overrides', () => {
    const tts = createTTS({ rate: 0.8 });
    tts.speak('hi', { rate: 1.5, pitch: 0.9, volume: 0.3 });
    const u = speakCalls[0];
    expect(u?.rate).toBe(1.5);
    expect(u?.pitch).toBe(0.9);
    expect(u?.volume).toBe(0.3);
  });
});

describe('useTTS (SolidJS hook)', () => {
  it('isSpeaking flips true on onstart, false on onend', async () => {
    await createRoot(async (dispose) => {
      const tts = useTTS();
      expect(tts.isSpeaking()).toBe(false);
      tts.speak('hi');
      await new Promise((r) => queueMicrotask(() => r(null)));
      expect(tts.isSpeaking()).toBe(true);
      speakCalls[0]?.onend?.();
      expect(tts.isSpeaking()).toBe(false);
      dispose();
    });
  });

  it('currentText tracks the active utterance', async () => {
    await createRoot(async (dispose) => {
      const tts = useTTS();
      tts.speak('narration line');
      await new Promise((r) => queueMicrotask(() => r(null)));
      expect(tts.currentText()).toBe('narration line');
      speakCalls[0]?.onend?.();
      expect(tts.currentText()).toBe('');
      dispose();
    });
  });

  it('setEnabled(false) clears isSpeaking state', async () => {
    await createRoot(async (dispose) => {
      const tts = useTTS();
      tts.speak('hi');
      await new Promise((r) => queueMicrotask(() => r(null)));
      tts.setEnabled(false);
      expect(tts.isSpeaking()).toBe(false);
      dispose();
    });
  });
});
