import { Component, For, Show, createEffect, onMount } from 'solid-js';
import { MessageBubble, type MessageRole } from '../MessageBubble';
import './MessageList.css';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

export interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string;
  onCopyMessage?: (message: Message) => void;
  autoScroll?: boolean;
  class?: string;
}

export const MessageList: Component<MessageListProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    if (containerRef && props.autoScroll !== false) {
      containerRef.scrollTop = containerRef.scrollHeight;
    }
  };

  onMount(scrollToBottom);
  createEffect(() => {
    // Reactive on messages length to auto-scroll on new messages
    void props.messages.length;
    scrollToBottom();
  });

  return (
    <div
      ref={containerRef}
      class={`sk-message-list ${props.class ?? ''}`}
      data-testid="message-list"
    >
      <Show
        when={props.messages.length > 0}
        fallback={
          <div class="sk-message-list__empty" data-testid="empty-state">
            No messages yet. Start a conversation!
          </div>
        }
      >
        <For each={props.messages}>
          {(message) => (
            <MessageBubble
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              isStreaming={message.id === props.streamingMessageId}
              onCopy={() => props.onCopyMessage?.(message)}
            />
          )}
        </For>
      </Show>
    </div>
  );
};
