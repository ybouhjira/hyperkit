import {
  Component,
  For,
  JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
  splitProps,
} from 'solid-js';
import { Icon } from '../../icons';
import './AiCompanion.css';

// ── Types ──────────────────────────────────────────────────────────────────

export type AiCompanionPosition = 'inline' | 'drawer-right' | 'drawer-bottom' | 'floating';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  tools?: AiMessageTool[];
}

export interface AiMessageTool {
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface AiContextItem {
  id: string;
  label: string;
  type: 'file' | 'component' | 'state' | 'annotation';
  tokens?: number;
}

export interface AiAction {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface AiCompanionProps {
  position?: AiCompanionPosition;
  defaultOpen?: boolean;
  title?: string;
  placeholder?: string;
  onSend?: (message: string) => void;
  onAction?: (action: string, params?: Record<string, unknown>) => void;
  messages?: AiMessage[];
  streaming?: boolean;
  contextItems?: AiContextItem[];
  actions?: AiAction[];
  class?: string;
  style?: JSX.CSSProperties;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const CONTEXT_TYPE_ICONS: Record<AiContextItem['type'], string> = {
  file: 'file-text',
  component: 'layout-grid',
  state: 'git-branch',
  annotation: 'square-pen',
};

const TOOL_STATUS_LABELS: Record<AiMessageTool['status'], string> = {
  pending: '…',
  running: '⟳',
  done: '✓',
  error: '✗',
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface ContextBarProps {
  items: AiContextItem[];
  onRemove: (id: string) => void;
}

const ContextBar: Component<ContextBarProps> = (props) => {
  const totalTokens = () => props.items.reduce((acc, item) => acc + (item.tokens ?? 0), 0);

  return (
    <div class="sk-ai-companion__context-bar" role="region" aria-label="Loaded context">
      <div class="sk-ai-companion__context-scroll">
        <For each={props.items}>
          {(item) => (
            <div
              class={`sk-ai-companion__context-chip sk-ai-companion__context-chip--${item.type}`}
              title={item.label}
            >
              <Icon
                name={CONTEXT_TYPE_ICONS[item.type] as Parameters<typeof Icon>[0]['name']}
                size="xs"
                class="sk-ai-companion__context-chip-icon"
              />
              <span class="sk-ai-companion__context-chip-label">{item.label}</span>
              <Show when={item.tokens !== undefined}>
                <span class="sk-ai-companion__context-chip-tokens">
                  {formatTokens(item.tokens ?? 0)}
                </span>
              </Show>
              <button
                type="button"
                class="sk-ai-companion__context-chip-remove"
                onClick={() => props.onRemove(item.id)}
                aria-label={`Remove ${item.label} from context`}
              >
                <Icon name="close" size="xs" />
              </button>
            </div>
          )}
        </For>
      </div>
      <Show when={totalTokens() > 0}>
        <span class="sk-ai-companion__context-total">{formatTokens(totalTokens())} tokens</span>
      </Show>
    </div>
  );
};

interface MessageItemProps {
  message: AiMessage;
}

const MessageItem: Component<MessageItemProps> = (props) => (
  <div
    class={`sk-ai-companion__msg-row sk-ai-companion__msg-row--${props.message.role}`}
    data-role={props.message.role}
  >
    <div class={`sk-ai-companion__msg sk-ai-companion__msg--${props.message.role}`}>
      <p class="sk-ai-companion__msg-content">{props.message.content}</p>

      <Show when={props.message.tools && props.message.tools.length > 0}>
        <div class="sk-ai-companion__msg-tools">
          <For each={props.message.tools}>
            {(tool) => (
              <span
                class={`sk-ai-companion__tool-chip sk-ai-companion__tool-chip--${tool.status}`}
                title={tool.name}
              >
                <span class="sk-ai-companion__tool-chip-icon">
                  {TOOL_STATUS_LABELS[tool.status]}
                </span>
                {tool.name}
              </span>
            )}
          </For>
        </div>
      </Show>

      <Show when={props.message.timestamp !== undefined}>
        <span class="sk-ai-companion__msg-time">{formatTime(props.message.timestamp ?? 0)}</span>
      </Show>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

export const AiCompanion: Component<AiCompanionProps> = (rawProps) => {
  const [local] = splitProps(rawProps, [
    'position',
    'defaultOpen',
    'title',
    'placeholder',
    'onSend',
    'onAction',
    'messages',
    'streaming',
    'contextItems',
    'actions',
    'class',
    'style',
  ]);

  const position = () => local.position ?? 'inline';

  // Open/close state — only meaningful for non-inline positions
  const [isOpen, setIsOpen] = createSignal(local.defaultOpen ?? position() === 'inline');

  // Context bar collapse
  const [contextCollapsed, setContextCollapsed] = createSignal(false);

  // Mutable context items (local copy so removals work without parent update)
  const [removedIds, setRemovedIds] = createSignal<Set<string>>(new Set());

  const visibleContext = () =>
    (local.contextItems ?? []).filter((item) => !removedIds().has(item.id));

  const handleRemoveContext = (id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]));
  };

  // Input state
  const [inputValue, setInputValue] = createSignal('');
  let textareaRef: HTMLTextAreaElement | undefined;
  let messagesRef: HTMLDivElement | undefined;

  // Auto-scroll messages
  createEffect(() => {
    const msgs = local.messages;
    if (msgs && msgs.length > 0 && messagesRef != null) {
      // Access msgs.length to track dependency, then defer
      setTimeout(() => {
        if (messagesRef != null) {
          messagesRef.scrollTop = messagesRef.scrollHeight;
        }
      }, 50);
    }
  });

  onMount(() => {
    if (isOpen() && textareaRef) {
      textareaRef.focus();
    }
  });

  const handleSend = () => {
    const text = inputValue().trim();
    if (!text || local.streaming) return;
    local.onSend?.(text);
    setInputValue('');
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
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const handleAction = (action: AiAction) => {
    local.onAction?.(action.id);
  };

  // Root class composition
  const rootClass = () => {
    const classes = [
      'sk-ai-companion',
      `sk-ai-companion--${position()}`,
      isOpen() ? 'sk-ai-companion--open' : 'sk-ai-companion--closed',
    ];
    if (local.class) classes.push(local.class);
    return classes.join(' ');
  };

  // The actual panel content — shared between all positions
  const panel = () => (
    <div
      class="sk-ai-companion__panel"
      role="complementary"
      aria-label={local.title ?? 'AI Assistant'}
    >
      {/* Header */}
      <div class="sk-ai-companion__header">
        <div class="sk-ai-companion__header-left">
          <Icon name="message-square" size="sm" class="sk-ai-companion__header-icon" />
          <span class="sk-ai-companion__header-title">{local.title ?? 'AI Assistant'}</span>
          <Show when={visibleContext().length > 0}>
            <button
              type="button"
              class="sk-ai-companion__context-badge"
              onClick={() => setContextCollapsed((v) => !v)}
              aria-label={`${visibleContext().length} context items loaded`}
              aria-expanded={!contextCollapsed()}
            >
              {visibleContext().length}
            </button>
          </Show>
        </div>
        <div class="sk-ai-companion__header-actions">
          <Show when={position() !== 'inline'}>
            <button
              type="button"
              class="sk-ai-companion__header-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI companion"
            >
              <Icon name="close" size="sm" />
            </button>
          </Show>
        </div>
      </div>

      {/* Context bar */}
      <Show when={visibleContext().length > 0 && !contextCollapsed()}>
        <ContextBar items={visibleContext()} onRemove={handleRemoveContext} />
      </Show>

      {/* Message list */}
      <div ref={messagesRef} class="sk-ai-companion__messages" role="log" aria-live="polite">
        <Show
          when={(local.messages ?? []).filter((m) => m.role !== 'system').length > 0}
          fallback={
            <div class="sk-ai-companion__empty">
              <Icon name="message-square" size="lg" class="sk-ai-companion__empty-icon" />
              <span class="sk-ai-companion__empty-text">Start a conversation</span>
            </div>
          }
        >
          <For each={(local.messages ?? []).filter((m) => m.role !== 'system')}>
            {(msg) => <MessageItem message={msg} />}
          </For>
        </Show>

        {/* Streaming indicator */}
        <Show when={local.streaming}>
          <div class="sk-ai-companion__typing" aria-label="AI is typing">
            <div class="sk-ai-companion__typing-bubble">
              <span class="sk-ai-companion__typing-dot" style={{ 'animation-delay': '0ms' }} />
              <span class="sk-ai-companion__typing-dot" style={{ 'animation-delay': '160ms' }} />
              <span class="sk-ai-companion__typing-dot" style={{ 'animation-delay': '320ms' }} />
            </div>
          </div>
        </Show>
      </div>

      {/* Quick actions bar */}
      <Show when={local.actions && local.actions.length > 0}>
        <div class="sk-ai-companion__actions" role="toolbar" aria-label="Quick actions">
          <div class="sk-ai-companion__actions-scroll">
            <For each={local.actions}>
              {(action) => (
                <button
                  type="button"
                  class="sk-ai-companion__action-chip"
                  onClick={() => handleAction(action)}
                  title={action.description}
                >
                  <Show when={action.icon}>
                    <Icon
                      name={action.icon as Parameters<typeof Icon>[0]['name']}
                      size="xs"
                      class="sk-ai-companion__action-chip-icon"
                    />
                  </Show>
                  {action.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Input area */}
      <div class="sk-ai-companion__input-area">
        <div class="sk-ai-companion__input-row">
          <textarea
            ref={textareaRef}
            value={inputValue()}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={local.placeholder ?? 'Ask anything… (Enter to send)'}
            class="sk-ai-companion__textarea"
            rows={1}
            disabled={local.streaming}
            aria-label="Message input"
          />
          <button
            type="button"
            class="sk-ai-companion__send-btn"
            onClick={handleSend}
            disabled={!inputValue().trim() || local.streaming}
            aria-label="Send message"
          >
            <Icon name="arrow-right" size="sm" />
          </button>
        </div>
        <Show when={local.streaming}>
          <p class="sk-ai-companion__input-hint">AI is responding…</p>
        </Show>
      </div>
    </div>
  );

  return (
    <div class={rootClass()} style={local.style}>
      {/* Floating trigger button */}
      <Show when={position() === 'floating' && !isOpen()}>
        <button
          type="button"
          class="sk-ai-companion__float-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          aria-haspopup="dialog"
        >
          <Icon name="message-square" size="md" />
        </button>
      </Show>

      {/* Backdrop for drawer modes */}
      <Show when={position() !== 'inline' && position() !== 'floating' && isOpen()}>
        <div
          class="sk-ai-companion__backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      </Show>

      {/* Panel — shown when open (always shown for inline) */}
      <Show when={isOpen()}>{panel()}</Show>
    </div>
  );
};
