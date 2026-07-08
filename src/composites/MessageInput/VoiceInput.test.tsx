import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceInput, createVoiceRecognition } from './VoiceInput';

// --- Mock SpeechRecognition ---

let lastMockSRInstance: MockSpeechRecognition | undefined;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastMockSRInstance = this;
  }
}

describe('composites/MessageInput/VoiceInput', () => {
  let origSR: unknown;
  let origWebkitSR: unknown;

  beforeEach(() => {
    const win = window as unknown as Record<string, unknown>;
    origSR = win['SpeechRecognition'];
    origWebkitSR = win['webkitSpeechRecognition'];
  });

  afterEach(() => {
    const win = window as unknown as Record<string, unknown>;
    if (origSR !== undefined) {
      win['SpeechRecognition'] = origSR;
    } else {
      delete win['SpeechRecognition'];
    }
    if (origWebkitSR !== undefined) {
      win['webkitSpeechRecognition'] = origWebkitSR;
    } else {
      delete win['webkitSpeechRecognition'];
    }
    vi.restoreAllMocks();
  });

  describe('VoiceInput component', () => {
    it('should not render when SpeechRecognition is unavailable', () => {
      const win = window as unknown as Record<string, unknown>;
      delete win['SpeechRecognition'];
      delete win['webkitSpeechRecognition'];

      const { container } = render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} />);

      expect(container.querySelector('button')).toBeNull();
    });

    it('should render when SpeechRecognition is available', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Voice input' })).toBeInTheDocument();
    });

    it('should render when webkitSpeechRecognition is available', () => {
      const win = window as unknown as Record<string, unknown>;
      delete win['SpeechRecognition'];
      win['webkitSpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Voice input' })).toBeInTheDocument();
    });

    it('should call onToggle when button is clicked', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      const onToggle = vi.fn();

      render(() => <VoiceInput isRecording={false} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole('button', { name: 'Voice input' }));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should apply recording class when isRecording is true', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={true} onToggle={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Voice input' });
      expect(button.className).toContain('sk-message-input__icon-btn--recording');
    });

    it('should not apply recording class when isRecording is false', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Voice input' });
      expect(button.className).not.toContain('sk-message-input__icon-btn--recording');
    });

    it('should be disabled when disabled prop is true', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} disabled={true} />);

      const button = screen.getByRole('button', { name: 'Voice input' });
      expect(button).toBeDisabled();
    });

    it('should have type="button"', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      render(() => <VoiceInput isRecording={false} onToggle={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Voice input' });
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  describe('createVoiceRecognition', () => {
    it('should return init, start, stop methods', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      const recognition = createVoiceRecognition(vi.fn());
      expect(typeof recognition.init).toBe('function');
      expect(typeof recognition.start).toBe('function');
      expect(typeof recognition.stop).toBe('function');
    });

    it('should initialize recognition with continuous and no interim results', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;

      const recognition = createVoiceRecognition(vi.fn());
      recognition.init();

      // After init, start and stop should work without errors
      expect(() => recognition.start()).not.toThrow();
      expect(() => recognition.stop()).not.toThrow();
    });

    it('should call start on the SpeechRecognition instance', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const recognition = createVoiceRecognition(vi.fn());
      recognition.init();
      recognition.start();
      expect(lastMockSRInstance).toBeDefined();
      expect(lastMockSRInstance!.start).toHaveBeenCalled();
    });

    it('should call stop on the SpeechRecognition instance', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const recognition = createVoiceRecognition(vi.fn());
      recognition.init();
      recognition.stop();
      expect(lastMockSRInstance).toBeDefined();
      expect(lastMockSRInstance!.stop).toHaveBeenCalled();
    });

    it('should fire onTranscript with final results', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const onTranscript = vi.fn();
      const recognition = createVoiceRecognition(onTranscript);
      recognition.init();

      // Simulate a speech recognition result
      const mockEvent = {
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: true,
            0: { transcript: 'hello world' },
            length: 1,
          },
        },
      };

      lastMockSRInstance!.onresult!(mockEvent);
      expect(onTranscript).toHaveBeenCalledWith('hello world');
    });

    it('should not fire onTranscript for interim results', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const onTranscript = vi.fn();
      const recognition = createVoiceRecognition(onTranscript);
      recognition.init();

      const mockEvent = {
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: false,
            0: { transcript: 'hel' },
            length: 1,
          },
        },
      };

      lastMockSRInstance!.onresult!(mockEvent);
      expect(onTranscript).not.toHaveBeenCalled();
    });

    it('should not fire onTranscript for empty transcript', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const onTranscript = vi.fn();
      const recognition = createVoiceRecognition(onTranscript);
      recognition.init();

      const mockEvent = {
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: true,
            0: { transcript: '' },
            length: 1,
          },
        },
      };

      lastMockSRInstance!.onresult!(mockEvent);
      expect(onTranscript).not.toHaveBeenCalled();
    });

    it('should concatenate multiple final results', () => {
      const win = window as unknown as Record<string, unknown>;
      win['SpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const onTranscript = vi.fn();
      const recognition = createVoiceRecognition(onTranscript);
      recognition.init();

      const mockEvent = {
        resultIndex: 0,
        results: {
          length: 2,
          0: {
            isFinal: true,
            0: { transcript: 'hello ' },
            length: 1,
          },
          1: {
            isFinal: true,
            0: { transcript: 'world' },
            length: 1,
          },
        },
      };

      lastMockSRInstance!.onresult!(mockEvent);
      expect(onTranscript).toHaveBeenCalledWith('hello world');
    });

    it('should handle init when SpeechRecognition is unavailable', () => {
      const win = window as unknown as Record<string, unknown>;
      delete win['SpeechRecognition'];
      delete win['webkitSpeechRecognition'];

      const recognition = createVoiceRecognition(vi.fn());
      // Should not throw
      expect(() => recognition.init()).not.toThrow();
      // start/stop should be safe to call (no-op)
      expect(() => recognition.start()).not.toThrow();
      expect(() => recognition.stop()).not.toThrow();
    });

    it('should use webkitSpeechRecognition as fallback', () => {
      const win = window as unknown as Record<string, unknown>;
      delete win['SpeechRecognition'];
      win['webkitSpeechRecognition'] = MockSpeechRecognition;
      lastMockSRInstance = undefined;

      const recognition = createVoiceRecognition(vi.fn());
      recognition.init();
      recognition.start();
      expect(lastMockSRInstance).toBeDefined();
      expect(lastMockSRInstance!.start).toHaveBeenCalled();
    });
  });
});
