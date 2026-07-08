import { Component, Show } from 'solid-js';
import { MessageList, type Message } from '../MessageList';
import { MessageInput } from '../MessageInput';
import { ConnectionStatus, type ConnectionState } from '../ConnectionStatus';
import { ModelSelector, type ModelOption } from '../ModelSelector';
import './ChatWindow.css';

export interface ChatWindowProps {
  messages: Message[];
  connectionState: ConnectionState;
  streamingMessageId?: string;
  models?: ModelOption[];
  selectedModel?: string;
  onSend?: (message: string) => void;
  onInterrupt?: () => void;
  onModelChange?: (modelId: string) => void;
  onCopyMessage?: (message: Message) => void;
  title?: string;
  class?: string;
  /**
   * Prefill the composer — forwarded to `MessageInput`. A change to a
   * non-empty string replaces the composer draft, focuses it, and fires
   * `onDraftApplied`. Clear the draft source in `onDraftApplied` so the
   * same text can be drafted repeatedly.
   */
  draft?: string;
  /** Called after a `draft` value has been applied to the composer. */
  onDraftApplied?: () => void;
}

export const ChatWindow: Component<ChatWindowProps> = (props) => {
  const isConnected = () => props.connectionState === 'connected';
  const isStreaming = () => !!props.streamingMessageId;

  return (
    <div class={`sk-chat-window ${props.class ?? ''}`} data-testid="chat-window">
      {/* Header */}
      <div class="sk-chat-window__header">
        <div class="sk-chat-window__header-left">
          <Show when={props.title}>
            <span class="sk-chat-window__title">{props.title}</span>
          </Show>
          <ConnectionStatus state={props.connectionState} />
        </div>
        <Show when={props.models && props.models.length > 0}>
          {props.models && (
            <ModelSelector
              models={props.models}
              value={props.selectedModel}
              onChange={props.onModelChange}
              disabled={!isConnected()}
            />
          )}
        </Show>
      </div>

      {/* Message area */}
      <MessageList
        messages={props.messages}
        streamingMessageId={props.streamingMessageId}
        onCopyMessage={props.onCopyMessage}
        class="flex-1"
      />

      {/* Input area */}
      <MessageInput
        onSend={props.onSend}
        onInterrupt={props.onInterrupt}
        isStreaming={isStreaming()}
        disabled={!isConnected()}
        draft={props.draft}
        onDraftApplied={props.onDraftApplied}
      />
    </div>
  );
};
