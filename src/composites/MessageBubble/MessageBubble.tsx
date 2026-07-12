import { Component, Show, createSignal } from 'solid-js';
import { Icon } from '../../icons';
import { Markdown } from '../../primitives/Markdown';
import '@ybouhjira/hyperkit-styles/composites/MessageBubble/MessageBubble.css';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  onCopy?: () => void;
  class?: string;
  /** Variant: 'default' = colored bubble, 'borderless' = transparent thread-style */
  variant?: 'default' | 'borderless';
  /** Avatar text (e.g., "Y" for user, "AI" for assistant) - only shown in borderless variant */
  avatarText?: string;
  /** Display name (e.g., "You", "Assistant") - only shown in borderless variant */
  displayName?: string;
}

export const MessageBubble: Component<MessageBubbleProps> = (props) => {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = () => {
    props.onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      class={`sk-message sk-message--${props.role} ${props.variant === 'borderless' ? 'sk-message--borderless' : ''} ${props.class ?? ''}`}
      data-testid="message-bubble"
      data-role={props.role}
    >
      <Show when={props.variant === 'borderless'}>
        <div class="sk-message__header">
          <div class={`sk-message__avatar sk-message__avatar--${props.role}`}>
            {props.avatarText ?? (props.role === 'user' ? 'U' : 'AI')}
          </div>
          <span class="sk-message__name">{props.displayName ?? props.role}</span>
          <Show when={props.timestamp}>
            {props.timestamp && (
              <span class="sk-message__header-time">{formatTime(props.timestamp)}</span>
            )}
          </Show>
        </div>
      </Show>
      <div class={props.variant === 'borderless' ? 'sk-message__body' : 'sk-message__top'}>
        <Markdown
          content={props.content}
          streaming={props.isStreaming}
          class="sk-message__content"
        />
        <Show when={!props.isStreaming}>
          <button
            type="button"
            onClick={handleCopy}
            class="sk-message__copy"
            aria-label="Copy message"
            data-testid="copy-button"
          >
            <Icon name={copied() ? 'check' : 'copy'} size="xs" />
          </button>
        </Show>
      </div>
      <Show when={props.variant !== 'borderless'}>
        <div class="sk-message__footer">
          <span class="sk-message__role">{props.role}</span>
          <div class="sk-message__meta">
            <Show when={props.isStreaming}>
              <span class="sk-message__streaming" data-testid="streaming-indicator">
                Streaming...
              </span>
            </Show>
            <Show when={props.timestamp}>
              {props.timestamp && (
                <span class="sk-message__time">{formatTime(props.timestamp)}</span>
              )}
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
