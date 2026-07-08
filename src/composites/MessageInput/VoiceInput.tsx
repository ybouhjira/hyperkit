import { Component, Show } from 'solid-js';
import { Tooltip } from '../../primitives/Tooltip';
import { MicIcon } from './icons';

/** Window with vendor-prefixed SpeechRecognition (webkit) */
interface SpeechRecognitionWindow {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

export interface VoiceInputProps {
  disabled?: boolean;
  isRecording: boolean;
  onToggle: () => void;
}

export const VoiceInput: Component<VoiceInputProps> = (props) => {
  const hasVoiceSupport = () => {
    if (typeof window === 'undefined') return false;
    const win = window as Window & SpeechRecognitionWindow;
    return win.SpeechRecognition != null || win.webkitSpeechRecognition != null;
  };

  return (
    <Show when={hasVoiceSupport()}>
      <Tooltip content={props.isRecording ? 'Stop recording' : 'Voice input'} placement="top">
        <button
          class={`sk-message-input__icon-btn ${props.isRecording ? 'sk-message-input__icon-btn--recording' : ''}`}
          onClick={() => props.onToggle()}
          disabled={props.disabled}
          type="button"
          aria-label="Voice input"
        >
          <MicIcon />
        </button>
      </Tooltip>
    </Show>
  );
};

// Voice recognition hook logic
export function createVoiceRecognition(onTranscript: (text: string) => void) {
  let recognition: SpeechRecognition | undefined = undefined;

  const init = () => {
    if (typeof window === 'undefined') return;
    const win = window as Window & SpeechRecognitionWindow;
    const SR = win.SpeechRecognition != null ? win.SpeechRecognition : win.webkitSpeechRecognition;
    if (SR == null) return;

    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const alternative = result?.[0];
        if (result?.isFinal === true && alternative != null) {
          transcript += alternative.transcript;
        }
      }
      if (transcript.length > 0) {
        onTranscript(transcript);
      }
    };
  };

  const start = () => {
    recognition?.start();
  };

  const stop = () => {
    recognition?.stop();
  };

  return { init, start, stop };
}
