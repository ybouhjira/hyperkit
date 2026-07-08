import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { ChatWindow } from './ChatWindow';

const messages = [
  { id: '1', role: 'user' as const, content: 'Hello' },
  { id: '2', role: 'assistant' as const, content: 'Hi!' },
];

const models = [
  { id: 'opus', name: 'Claude Opus' },
  { id: 'sonnet', name: 'Claude Sonnet' },
];

describe('ChatWindow', () => {
  it('renders with messages', () => {
    render(() => <ChatWindow messages={messages} connectionState="connected" />);
    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi!')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    render(() => <ChatWindow messages={[]} connectionState="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows title when provided', () => {
    render(() => <ChatWindow messages={[]} connectionState="connected" title="My Chat" />);
    expect(screen.getByText('My Chat')).toBeInTheDocument();
  });

  it('shows model selector when models provided', () => {
    render(() => <ChatWindow messages={[]} connectionState="connected" models={models} />);
    expect(screen.getByTestId('model-selector')).toBeInTheDocument();
  });

  it('shows input area', () => {
    render(() => <ChatWindow messages={[]} connectionState="connected" />);
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <ChatWindow messages={[]} connectionState="connected" class="h-screen" />);
    expect(screen.getByTestId('chat-window').className).toContain('h-screen');
  });

  it('forwards composer submissions to onSend', () => {
    const onSend = vi.fn();
    const { container } = render(() => (
      <ChatWindow messages={[]} connectionState="connected" onSend={onSend} />
    ));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: 'hello there' } });
    fireEvent.click(screen.getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledWith('hello there', undefined);
  });

  it('shows the stop button while streaming and forwards onInterrupt', () => {
    const onInterrupt = vi.fn();
    render(() => (
      <ChatWindow
        messages={messages}
        connectionState="connected"
        streamingMessageId="2"
        onInterrupt={onInterrupt}
      />
    ));
    fireEvent.click(screen.getByTestId('interrupt-button'));
    expect(onInterrupt).toHaveBeenCalledTimes(1);
  });

  it('forwards model changes to onModelChange', async () => {
    const onModelChange = vi.fn();
    const { container } = render(() => (
      <ChatWindow
        messages={[]}
        connectionState="connected"
        models={models}
        selectedModel="opus"
        onModelChange={onModelChange}
      />
    ));
    // The kobalte trigger lazy-loads behind Suspense — wait for the button.
    // Generous timeout: under a full-suite run the lazy chunk can take
    // noticeably longer than in a standalone run.
    await waitFor(
      () => expect(container.querySelector('button.sk-select__trigger')).not.toBeNull(),
      { timeout: 5000 }
    );
    const trigger = container.querySelector('button.sk-select__trigger') as HTMLElement;
    fireEvent.pointerDown(trigger, { pointerType: 'mouse', pointerId: 1, button: 0 });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    const sonnet = screen
      .getAllByRole('option')
      .find((o) => o.textContent?.includes('Sonnet')) as HTMLElement;
    fireEvent.pointerMove(sonnet, { pointerType: 'mouse', pointerId: 1 });
    fireEvent.pointerDown(sonnet, { pointerType: 'mouse', pointerId: 1, button: 0 });
    fireEvent.pointerUp(sonnet, { pointerType: 'mouse', pointerId: 1, button: 0 });
    fireEvent.click(sonnet, { button: 0 });
    await waitFor(() => expect(onModelChange).toHaveBeenCalledWith('sonnet'));
  });

  it('forwards copy clicks to onCopyMessage', () => {
    const onCopyMessage = vi.fn();
    render(() => (
      <ChatWindow messages={messages} connectionState="connected" onCopyMessage={onCopyMessage} />
    ));
    fireEvent.click(screen.getAllByTestId('copy-button')[0] as HTMLElement);
    expect(onCopyMessage).toHaveBeenCalledWith(messages[0]);
  });

  it('forwards draft + onDraftApplied to the composer', () => {
    const applied = vi.fn();
    const [draft, setDraft] = createSignal<string | undefined>(undefined);
    const { container } = render(() => (
      <ChatWindow
        messages={[]}
        connectionState="connected"
        draft={draft()}
        onDraftApplied={() => {
          applied();
          setDraft(undefined);
        }}
      />
    ));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    setDraft('prefilled prompt');
    expect(textarea.value).toBe('prefilled prompt');
    expect(applied).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(textarea);
  });
});
