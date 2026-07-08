import { Component, createSignal, Show, onMount, createEffect, batch } from 'solid-js';
import { Tooltip } from '../../primitives/Tooltip';
import { MessageInputProps, FileAttachment, SlashCommand, MentionItem } from './types';
import { SlashCommandMenu } from './SlashCommandMenu';
import { MentionMenu } from './MentionMenu';
import { AttachmentBar } from './AttachmentBar';
import { MarkdownToolbar } from './MarkdownToolbar';
import { VoiceInput, createVoiceRecognition } from './VoiceInput';
import { PaperclipIcon, SendIcon, StopIcon } from './icons';
import { createFileHandlers } from './useMessageFiles';
import { createMarkdownFormatters } from './useMarkdownFormat';
import './MessageInput.css';

export const MessageInput: Component<MessageInputProps> = (props) => {
  let textareaRef: HTMLTextAreaElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  // Ref wrapper for markdown formatters (closure-safe)
  const textareaRefWrapper = {
    get current() {
      return textareaRef;
    },
  };

  // Core state
  const [value, setValue] = createSignal('');
  const [attachments, setAttachments] = createSignal<FileAttachment[]>([]);
  const [isFocused, setIsFocused] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  // Dropdown state
  const [showSlashDropdown, setShowSlashDropdown] = createSignal(false);
  const [slashQuery, setSlashQuery] = createSignal('');
  const [slashSelectedIndex, setSlashSelectedIndex] = createSignal(0);

  const [showMentionDropdown, setShowMentionDropdown] = createSignal(false);
  const [mentionQuery, setMentionQuery] = createSignal('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = createSignal(0);

  // Voice state
  const [isRecording, setIsRecording] = createSignal(false);

  // History state
  const [internalHistory, setInternalHistory] = createSignal<string[]>([]);
  const [historyIndex, setHistoryIndex] = createSignal(-1);

  // Derived
  const messageHistory = () => props.messageHistory || internalHistory();
  const charCount = () => value().length;
  const isOverLimit = () => (props.maxLength != null ? charCount() > props.maxLength : false);
  const isNearLimit = () => (props.maxLength != null ? charCount() > props.maxLength * 0.9 : false);
  const showHints = () => props.showShortcutHints !== false && isFocused() && value().length === 0;

  const filteredSlashCommands = () => {
    /* v8 ignore next -- type guard only: the dropdown can only be open when slashCommands exist, and the menu reads `commands` lazily behind its <Show> @preserve */
    if (!props.slashCommands) return [];
    const q = slashQuery().toLowerCase();
    return props.slashCommands.filter(
      (cmd) => cmd.name.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q)
    );
  };

  const filteredMentions = () => {
    /* v8 ignore next -- type guard only: the dropdown can only be open when mentions exist, and the menu reads `mentions` lazily behind its <Show> @preserve */
    if (!props.mentions) return [];
    const q = mentionQuery().toLowerCase();
    return props.mentions.filter((m) => m.name.toLowerCase().includes(q));
  };

  // --------------------------------------------------------------------------
  // Auto-resize
  // --------------------------------------------------------------------------

  const adjustHeight = () => {
    /* v8 ignore next -- defensive: every caller runs after mount, when the textarea ref is already assigned @preserve */
    if (textareaRef == null) return;
    textareaRef.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(textareaRef).lineHeight, 10);
    const validLineHeight = isNaN(lineHeight) ? 24 : lineHeight;
    const minH = validLineHeight;
    const maxH = 6 * validLineHeight;
    textareaRef.style.height = `${Math.min(Math.max(textareaRef.scrollHeight, minH), maxH)}px`;
  };

  // --------------------------------------------------------------------------
  // Extracted handlers
  // --------------------------------------------------------------------------

  const fileHandlers = createFileHandlers(attachments, setAttachments, setIsDragging, {
    get maxFileSize() {
      return props.maxFileSize;
    },
    get acceptedFileTypes() {
      return props.acceptedFileTypes;
    },
    get maxFiles() {
      return props.maxFiles;
    },
    get onFileError() {
      return props.onFileError;
    },
  });

  const markdown = createMarkdownFormatters(textareaRefWrapper, value, setValue, adjustHeight);

  // Voice recognition
  const voiceRecognition = createVoiceRecognition((transcript) => {
    setValue(value() + transcript);
    setTimeout(adjustHeight, 0);
  });

  // --------------------------------------------------------------------------
  // Slash commands & mentions
  // --------------------------------------------------------------------------

  const detectSlashCommand = () => {
    if (textareaRef == null || props.slashCommands == null || props.slashCommands.length === 0)
      return;
    const text = value();
    const before = text.substring(0, textareaRef.selectionStart);
    const line = before.split('\n').pop() || '';

    if (line.startsWith('/')) {
      setSlashQuery(line.substring(1));
      setShowSlashDropdown(true);
      setSlashSelectedIndex(0);
    } else {
      setShowSlashDropdown(false);
    }
  };

  const detectMention = () => {
    if (textareaRef == null || props.mentions == null || props.mentions.length === 0) return;
    const before = value().substring(0, textareaRef.selectionStart);

    let atIdx = -1;
    for (let i = before.length - 1; i >= 0; i--) {
      const char = before[i];
      const prevChar = before[i - 1];
      if (char === '@' && (i === 0 || (prevChar != null && /\s/.test(prevChar)))) {
        atIdx = i;
        break;
      }
      if (char != null && /\s/.test(char)) break;
    }

    if (atIdx !== -1) {
      setMentionQuery(before.substring(atIdx + 1));
      setShowMentionDropdown(true);
      setMentionSelectedIndex(0);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const selectSlashCommand = (cmd: SlashCommand) => {
    /* v8 ignore next -- defensive: only invoked from keyboard/menu handlers, which exist after mount when the ref is assigned @preserve */
    if (!textareaRef) return;
    const text = value();
    const before = text.substring(0, textareaRef.selectionStart);
    const after = text.substring(textareaRef.selectionStart);
    const lines = before.split('\n');
    lines[lines.length - 1] = `/${cmd.name} `;
    const newText = lines.join('\n') + after;
    setValue(newText);
    setShowSlashDropdown(false);
    props.onSlashCommand?.(cmd);
    setTimeout(() => {
      textareaRef?.focus();
      const pos = lines.join('\n').length;
      textareaRef?.setSelectionRange(pos, pos);
    }, 0);
  };

  const selectMention = (mention: MentionItem) => {
    /* v8 ignore next -- defensive: only invoked from keyboard/menu handlers, which exist after mount when the ref is assigned @preserve */
    if (!textareaRef) return;
    const text = value();
    const before = text.substring(0, textareaRef.selectionStart);

    let atIdx = -1;
    for (let i = before.length - 1; i >= 0; i--) {
      const char = before[i];
      const prevChar = before[i - 1];
      if (char === '@' && (i === 0 || (prevChar != null && /\s/.test(prevChar)))) {
        atIdx = i;
        break;
      }
    }

    if (atIdx !== -1) {
      const replacement = `@${mention.name} `;
      const newText =
        text.substring(0, atIdx) + replacement + text.substring(textareaRef.selectionStart);
      setValue(newText);
      setShowMentionDropdown(false);
      setTimeout(() => {
        textareaRef?.focus();
        const pos = atIdx + replacement.length;
        textareaRef?.setSelectionRange(pos, pos);
      }, 0);
    }
  };

  // --------------------------------------------------------------------------
  // Voice input
  // --------------------------------------------------------------------------

  const toggleVoice = () => {
    if (isRecording()) {
      voiceRecognition.stop();
      setIsRecording(false);
    } else {
      voiceRecognition.start();
      setIsRecording(true);
    }
  };

  // --------------------------------------------------------------------------
  // Message history
  // --------------------------------------------------------------------------

  const navigateHistory = (dir: 'up' | 'down') => {
    const hist = messageHistory();
    if (hist.length === 0) return;

    let idx = historyIndex();
    if (dir === 'up' && idx < hist.length - 1) idx++;
    else if (dir === 'down' && idx > -1) idx--;

    setHistoryIndex(idx);
    /* v8 ignore next -- the `?? ''` arm is unreachable: idx is clamped to the history bounds above @preserve */
    setValue(idx === -1 ? '' : (hist[hist.length - 1 - idx] ?? ''));
    setTimeout(adjustHeight, 0);
  };

  // --------------------------------------------------------------------------
  // Send / interrupt
  // --------------------------------------------------------------------------

  const handleSend = () => {
    const text = value().trim();
    if (!text && attachments().length === 0) return;
    /* v8 ignore next -- defense-in-depth: when disabled, the textarea and send button are disabled and SolidJS event delegation already skips disabled targets @preserve */
    if (props.disabled) return;

    props.onSend?.(text, attachments().length > 0 ? attachments() : undefined);

    if (text) setInternalHistory([...internalHistory(), text]);

    batch(() => {
      setValue('');
      setAttachments([]);
      setHistoryIndex(-1);
      setShowSlashDropdown(false);
      setShowMentionDropdown(false);
    });
    setTimeout(adjustHeight, 0);
  };

  // --------------------------------------------------------------------------
  // Keyboard handling
  // --------------------------------------------------------------------------

  const handleKeyDown = (e: KeyboardEvent) => {
    // Dropdowns take priority
    if (showSlashDropdown()) {
      const cmds = filteredSlashCommands();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((slashSelectedIndex() + 1) % cmds.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((slashSelectedIndex() - 1 + cmds.length) % cmds.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = cmds[slashSelectedIndex()];
        if (cmd != null) selectSlashCommand(cmd);
        return;
      }
      if (e.key === 'Escape') {
        setShowSlashDropdown(false);
        return;
      }
    }

    if (showMentionDropdown()) {
      const items = filteredMentions();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((mentionSelectedIndex() + 1) % items.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((mentionSelectedIndex() - 1 + items.length) % items.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[mentionSelectedIndex()];
        if (item != null) selectMention(item);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        return;
      }
    }

    // Send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // History
    if (e.key === 'ArrowUp' && textareaRef) {
      const pos = textareaRef.selectionStart;
      const before = value().substring(0, pos);
      if (before.split('\n').length === 1) {
        e.preventDefault();
        navigateHistory('up');
      }
    }
    if (e.key === 'ArrowDown' && textareaRef) {
      const pos = textareaRef.selectionStart;
      if (value().substring(pos).split('\n').length === 1) {
        e.preventDefault();
        navigateHistory('down');
      }
    }

    // Markdown shortcuts
    if (props.enableMarkdownToolbar) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'b') {
        e.preventDefault();
        markdown.handleBold();
      }
      if (mod && e.key === 'i') {
        e.preventDefault();
        markdown.handleItalic();
      }
      if (mod && e.key === '`') {
        e.preventDefault();
        markdown.handleCode();
      }
      if (mod && e.key === 'k') {
        e.preventDefault();
        markdown.handleLink();
      }
    }
  };

  // --------------------------------------------------------------------------
  // Input handler
  // --------------------------------------------------------------------------

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setValue(target.value);
    adjustHeight();
    setHistoryIndex(-1);
    detectSlashCommand();
    detectMention();
  };

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  onMount(() => {
    adjustHeight();
    if (props.enableVoice) voiceRecognition.init();
  });

  createEffect(() => {
    value();
    adjustHeight();
  });

  // Draft prefill — every change of `props.draft` to a non-empty string
  // replaces the current value, focuses the textarea with the caret at the
  // end, and notifies the host. Hosts clear their draft source inside
  // `onDraftApplied`, which makes this effect re-run with an empty draft so
  // the SAME text can be drafted again later (signal equality would
  // otherwise swallow the repeat).
  createEffect(() => {
    const draft = props.draft;
    if (draft == null || draft.length === 0) return;
    setValue(draft);
    adjustHeight();
    /* v8 ignore next -- defensive: createEffect runs post-render, after the textarea ref is assigned @preserve */
    if (textareaRef != null) {
      textareaRef.value = draft;
      textareaRef.focus();
      textareaRef.setSelectionRange(draft.length, draft.length);
    }
    props.onDraftApplied?.();
  });

  // --------------------------------------------------------------------------
  // Render helpers
  // --------------------------------------------------------------------------

  const outerClass = () => {
    let cls = 'sk-message-input';
    if (props.class) cls += ` ${props.class}`;
    if (props.disabled) cls += ' sk-message-input--disabled';
    if (props.isStreaming) cls += ' sk-message-input--streaming';
    return cls;
  };

  const pillClass = () => {
    let cls = 'sk-message-input__pill';
    if (isFocused()) cls += ' sk-message-input__pill--focused';
    if (isDragging()) cls += ' sk-message-input__pill--dragging';
    return cls;
  };

  const counterClass = () => {
    let cls = 'sk-message-input__counter';
    if (isOverLimit()) cls += ' sk-message-input__counter--danger';
    else if (isNearLimit()) cls += ' sk-message-input__counter--warning';
    return cls;
  };

  return (
    <div class={outerClass()} data-testid="message-input">
      <SlashCommandMenu
        show={showSlashDropdown()}
        commands={filteredSlashCommands()}
        selectedIndex={slashSelectedIndex()}
        onSelect={selectSlashCommand}
        onHover={setSlashSelectedIndex}
      />

      <MentionMenu
        show={showMentionDropdown()}
        mentions={filteredMentions()}
        selectedIndex={mentionSelectedIndex()}
        onSelect={selectMention}
        onHover={setMentionSelectedIndex}
      />

      <div
        class={pillClass()}
        onDragOver={(e) =>
          props.enableAttachments === true ? fileHandlers.handleDragOver(e) : undefined
        }
        onDragLeave={(e) =>
          props.enableAttachments === true ? fileHandlers.handleDragLeave(e) : undefined
        }
        onDrop={(e) => (props.enableAttachments === true ? fileHandlers.handleDrop(e) : undefined)}
      >
        <AttachmentBar attachments={attachments()} onRemove={fileHandlers.removeAttachment} />

        <div class="sk-message-input__editor">
          <textarea
            ref={(el) => {
              textareaRef = el;
            }}
            class="sk-message-input__textarea"
            value={value()}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={props.placeholder || 'Type a message...'}
            disabled={props.disabled || props.isStreaming}
            rows={1}
          />
        </div>

        <div class="sk-message-input__toolbar">
          <div class="sk-message-input__toolbar-left">
            <Show when={props.enableAttachments}>
              <Tooltip content="Attach files" placement="top">
                <button
                  class="sk-message-input__icon-btn"
                  onClick={() => fileInputRef?.click()}
                  disabled={props.disabled}
                  type="button"
                  aria-label="Attach files"
                >
                  <PaperclipIcon />
                </button>
              </Tooltip>
              <input
                ref={(el) => {
                  fileInputRef = el;
                }}
                type="file"
                multiple
                accept={props.acceptedFileTypes?.join(',')}
                onChange={fileHandlers.handleFileInputChange}
                style={{ display: 'none' }}
              />
              <div class="sk-message-input__divider" />
            </Show>

            <Show when={props.enableMarkdownToolbar}>
              <MarkdownToolbar
                disabled={props.disabled}
                onBold={markdown.handleBold}
                onItalic={markdown.handleItalic}
                onCode={markdown.handleCode}
                onLink={markdown.handleLink}
              />
            </Show>

            <Show when={props.enableVoice}>
              <Show when={props.enableMarkdownToolbar}>
                <div class="sk-message-input__divider" />
              </Show>
              <VoiceInput
                disabled={props.disabled}
                isRecording={isRecording()}
                onToggle={toggleVoice}
              />
            </Show>
          </div>

          <div class="sk-message-input__toolbar-right">
            <Show when={showHints()}>
              <span class="sk-message-input__hints">↵ Send · ⇧↵ Newline</span>
            </Show>

            <Show when={isRecording()}>
              <span class="sk-message-input__recording-indicator">Recording...</span>
            </Show>

            <Show when={props.showCharCount || props.maxLength}>
              <span class={counterClass()}>
                {charCount()}
                {props.maxLength != null ? `/${props.maxLength}` : ''}
              </span>
            </Show>

            <Show
              when={!props.isStreaming}
              fallback={
                <button
                  class="sk-message-input__send-btn sk-message-input__send-btn--stop"
                  onClick={() => props.onInterrupt?.()}
                  type="button"
                  aria-label="Stop"
                  data-testid="interrupt-button"
                >
                  <StopIcon />
                </button>
              }
            >
              <button
                class="sk-message-input__send-btn"
                onClick={handleSend}
                disabled={
                  props.disabled || (value().trim().length === 0 && attachments().length === 0)
                }
                type="button"
                aria-label="Send"
              >
                <SendIcon />
              </button>
            </Show>
          </div>
        </div>

        <Show when={isDragging()}>
          <div class="sk-message-input__drag-overlay">Drop files here</div>
        </Show>
      </div>
    </div>
  );
};
