import { Component, For, createEffect, createSignal, Show, onMount } from 'solid-js';
import type { LLMUIControllerReturn, LLMMessage } from '../../hooks/createLLMUIController';
import './LLMChatBox.css';

export interface LLMChatBoxProps {
  controller: LLMUIControllerReturn;
  title?: string;
  placeholder?: string;
  class?: string;
}

export const LLMChatBox: Component<LLMChatBoxProps> = (props) => {
  const [inputValue, setInputValue] = createSignal('');
  const [isMinimized, setIsMinimized] = createSignal(false);
  let messageListRef: HTMLDivElement | undefined;
  let textareaRef: HTMLTextAreaElement | undefined;

  // Auto-scroll to bottom on new messages
  createEffect(() => {
    const messages = props.controller.messages();
    if (messages.length > 0 && messageListRef != null) {
      setTimeout(() => {
        if (messageListRef != null) {
          messageListRef.scrollTop = messageListRef.scrollHeight;
        }
      }, 50);
    }
  });

  const handleSend = () => {
    const text = inputValue().trim();
    if (!text || props.controller.isProcessing()) return;

    void props.controller.sendMessage(text);
    setInputValue('');

    // Reset textarea height
    if (textareaRef) {
      textareaRef.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setInputValue(target.value);

    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageContent = (msg: LLMMessage) => {
    if (msg.role === 'system') return null;
    return msg.content;
  };

  onMount(() => {
    textareaRef?.focus();
  });

  return (
    <div class={`sk-llm-chat ${props.class ?? ''}`}>
      {/* Header */}
      <div class="sk-llm-chat__header">
        <h3 class="sk-llm-chat__title">{props.title ?? 'AI Assistant'}</h3>
        <div class="sk-llm-chat__header-actions">
          <button
            onClick={() => props.controller.clearMessages()}
            class="sk-llm-chat__header-btn"
            title="Clear chat"
          >
            Clear
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized())}
            class="sk-llm-chat__header-btn"
            title={isMinimized() ? 'Expand' : 'Minimize'}
          >
            {isMinimized() ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <Show when={!isMinimized()}>
        {/* Error Banner */}
        <Show when={props.controller.error()}>
          <div class="sk-llm-chat__error">{props.controller.error()}</div>
        </Show>

        {/* Message List */}
        <div
          ref={messageListRef}
          class="sk-llm-chat__messages"
          style={{ 'max-height': 'calc(100% - 140px)' }}
        >
          <For each={props.controller.messages()}>
            {(msg) => (
              <Show when={msg.role !== 'system'}>
                <div class={`sk-llm-chat__msg-row sk-llm-chat__msg-row--${msg.role}`}>
                  <div class={`sk-llm-chat__msg sk-llm-chat__msg--${msg.role}`}>
                    <div class="sk-llm-chat__msg-text">{getMessageContent(msg)}</div>

                    {/* Tool call badges */}
                    <Show when={msg.toolCalls && msg.toolCalls.length > 0}>
                      <div class="sk-llm-chat__tool-badges">
                        <For each={msg.toolCalls}>
                          {(toolCall) => {
                            const result = msg.toolResults?.find((r) => r.name === toolCall.name);
                            const isError = result?.result.startsWith('error:');
                            return (
                              <span
                                class={`sk-llm-chat__tool-badge sk-llm-chat__tool-badge--${isError ? 'error' : 'success'}`}
                                title={result?.result}
                              >
                                {isError ? '✗' : '✓'} {toolCall.name}
                              </span>
                            );
                          }}
                        </For>
                      </div>
                    </Show>

                    <div class="sk-llm-chat__msg-time">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              </Show>
            )}
          </For>

          {/* Typing indicator */}
          <Show when={props.controller.isProcessing()}>
            <div class="sk-llm-chat__typing">
              <div class="sk-llm-chat__typing-inner">
                <div class="sk-llm-chat__typing-dots">
                  <span class="sk-llm-chat__typing-dot" style={{ 'animation-delay': '0ms' }} />
                  <span class="sk-llm-chat__typing-dot" style={{ 'animation-delay': '150ms' }} />
                  <span class="sk-llm-chat__typing-dot" style={{ 'animation-delay': '300ms' }} />
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* Input Area */}
        <div class="sk-llm-chat__input-area">
          <div class="sk-llm-chat__input-row">
            <textarea
              ref={textareaRef}
              value={inputValue()}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={
                props.placeholder ?? 'Type a message... (Enter to send, Shift+Enter for newline)'
              }
              class="sk-llm-chat__textarea"
              rows={1}
              style={{ 'min-height': '38px', 'max-height': '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue().trim() || props.controller.isProcessing()}
              class="sk-llm-chat__send"
            >
              Send
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
