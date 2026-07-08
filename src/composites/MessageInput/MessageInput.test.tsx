import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { MessageInput } from './MessageInput';

describe('MessageInput', () => {
  it('renders input area', () => {
    render(() => <MessageInput />);
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(() => <MessageInput placeholder="Ask anything..." />);
    expect(screen.getByPlaceholderText('Ask anything...')).toBeInTheDocument();
  });

  it('shows send button by default', () => {
    render(() => <MessageInput />);
    expect(screen.getByLabelText('Send')).toBeInTheDocument();
  });

  it('shows stop button when streaming', () => {
    render(() => <MessageInput isStreaming />);
    expect(screen.getByLabelText('Stop')).toBeInTheDocument();
    expect(screen.queryByLabelText('Send')).not.toBeInTheDocument();
  });

  it('calls onSend with message text', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.click(screen.getByLabelText('Send'));

    expect(onSend).toHaveBeenCalledWith('Hello', undefined);
  });

  it('calls onInterrupt when stop clicked', async () => {
    const onInterrupt = vi.fn();
    render(() => <MessageInput isStreaming onInterrupt={onInterrupt} />);
    await fireEvent.click(screen.getByLabelText('Stop'));
    expect(onInterrupt).toHaveBeenCalled();
  });

  it('disables textarea when disabled', () => {
    render(() => <MessageInput disabled />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
  });

  it('applies custom class', () => {
    render(() => <MessageInput class="custom" />);
    expect(screen.getByTestId('message-input').className).toContain('custom');
  });
});

describe('MessageInput disabled state', () => {
  it('adds disabled class when disabled', () => {
    render(() => <MessageInput disabled />);
    expect(screen.getByTestId('message-input').className).toContain('sk-message-input--disabled');
  });

  it('disables textarea when streaming', () => {
    render(() => <MessageInput isStreaming />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
  });

  it('adds streaming class when streaming', () => {
    render(() => <MessageInput isStreaming />);
    expect(screen.getByTestId('message-input').className).toContain('sk-message-input--streaming');
  });

  it('does not send when disabled', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} disabled />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.click(screen.getByLabelText('Send'));

    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('MessageInput send via Enter', () => {
  it('sends message on Enter key', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSend).toHaveBeenCalledWith('Hello', undefined);
  });

  it('does not send on Shift+Enter (newline)', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send empty text without attachments', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears text after sending', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSend).toHaveBeenCalled();
    // The value should be cleared after send
    expect(textarea.value).toBe('');
  });
});

describe('MessageInput char count', () => {
  it('shows char count when showCharCount is true', async () => {
    const { container } = render(() => <MessageInput showCharCount />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });

    const counter = container.querySelector('.sk-message-input__counter');
    expect(counter).toBeInTheDocument();
    expect(counter?.textContent).toContain('5');
  });

  it('shows max length indicator', async () => {
    const { container } = render(() => <MessageInput maxLength={100} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });

    const counter = container.querySelector('.sk-message-input__counter');
    expect(counter).toBeInTheDocument();
    expect(counter?.textContent).toContain('5/100');
  });

  it('adds warning class near limit', async () => {
    const { container } = render(() => <MessageInput maxLength={10} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '1234567890' } }); // 10 chars at maxLength 10 => 10 > 9 (near) but not > 10 (over)

    const counter = container.querySelector('.sk-message-input__counter');
    expect(counter?.className).toContain('sk-message-input__counter--warning');
  });

  it('adds danger class over limit', async () => {
    const { container } = render(() => <MessageInput maxLength={5} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '123456' } }); // 6 chars > 5

    const counter = container.querySelector('.sk-message-input__counter');
    expect(counter?.className).toContain('sk-message-input__counter--danger');
  });
});

describe('MessageInput file attachments', () => {
  it('shows attach button when enableAttachments is true', () => {
    render(() => <MessageInput enableAttachments />);
    expect(screen.getByLabelText('Attach files')).toBeInTheDocument();
  });

  it('does not show attach button when enableAttachments is false', () => {
    render(() => <MessageInput />);
    expect(screen.queryByLabelText('Attach files')).not.toBeInTheDocument();
  });

  it('shows file input when enableAttachments is true', () => {
    const { container } = render(() => <MessageInput enableAttachments />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('adds accepted file types to file input', () => {
    const { container } = render(() => (
      <MessageInput enableAttachments acceptedFileTypes={['.png', '.jpg']} />
    ));
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('.png,.jpg');
  });

  it('calls onFileError for oversized files', async () => {
    const onFileError = vi.fn();
    const { container } = render(() => (
      <MessageInput enableAttachments maxFileSize={100} onFileError={onFileError} />
    ));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = new File(['x'.repeat(200)], 'big.txt', { type: 'text/plain' });
    Object.defineProperty(bigFile, 'size', { value: 200 });

    await fireEvent.change(fileInput, { target: { files: [bigFile] } });

    expect(onFileError).toHaveBeenCalledWith(expect.stringContaining('exceeds'));
  });

  it('calls onFileError for wrong file type', async () => {
    const onFileError = vi.fn();
    const { container } = render(() => (
      <MessageInput enableAttachments acceptedFileTypes={['.png']} onFileError={onFileError} />
    ));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const wrongFile = new File(['data'], 'doc.txt', { type: 'text/plain' });

    await fireEvent.change(fileInput, { target: { files: [wrongFile] } });

    expect(onFileError).toHaveBeenCalledWith(expect.stringContaining('not accepted'));
  });

  it('calls onFileError when max files exceeded', async () => {
    const onFileError = vi.fn();
    const { container } = render(() => (
      <MessageInput enableAttachments maxFiles={0} onFileError={onFileError} />
    ));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'file.txt', { type: 'text/plain' });

    await fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileError).toHaveBeenCalledWith(expect.stringContaining('Maximum'));
  });

  it('displays attachment chips after adding file', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });

    await fireEvent.change(fileInput, { target: { files: [file] } });

    const chip = container.querySelector('.sk-message-input__file-chip');
    expect(chip).toBeInTheDocument();
    expect(chip?.textContent).toContain('test.txt');
  });

  it('removes attachment chip on remove click', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    const removeBtn = screen.getByLabelText('Remove test.txt');
    await fireEvent.click(removeBtn);

    expect(container.querySelector('.sk-message-input__file-chip')).not.toBeInTheDocument();
  });

  it('sends attachments with message', async () => {
    const onSend = vi.fn();
    const { container } = render(() => <MessageInput enableAttachments onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'See attached' } });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await fireEvent.click(screen.getByLabelText('Send'));

    expect(onSend).toHaveBeenCalledWith(
      'See attached',
      expect.arrayContaining([expect.objectContaining({ name: 'test.txt' })])
    );
  });
});

describe('MessageInput slash commands', () => {
  const commands = [
    { id: '1', name: 'help', description: 'Show help' },
    { id: '2', name: 'clear', description: 'Clear chat' },
    { id: '3', name: 'settings', description: 'Open settings' },
  ];

  it('shows slash command dropdown when typing /', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/' } });

    const dropdown = container.querySelector('.sk-message-input__dropdown');
    expect(dropdown).toBeInTheDocument();
  });

  it('filters commands by query', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/hel' } });

    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    expect(items.length).toBe(1);
    expect(items[0]?.textContent).toContain('help');
  });

  it('closes dropdown on Escape', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/' } });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();

    await fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('calls onSlashCommand when command selected via Enter', async () => {
    const onSlashCommand = vi.fn();
    render(() => <MessageInput slashCommands={commands} onSlashCommand={onSlashCommand} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSlashCommand).toHaveBeenCalledWith(expect.objectContaining({ name: 'help' }));
  });

  it('navigates commands with ArrowDown/ArrowUp', async () => {
    const onSlashCommand = vi.fn();
    const { container } = render(() => (
      <MessageInput slashCommands={commands} onSlashCommand={onSlashCommand} />
    ));

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/' } });

    // First item is highlighted by default
    let highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('help');

    // Move down
    await fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('clear');

    // Move down again
    await fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('settings');

    // Move up
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('clear');
  });

  it('hides dropdown when text does not start with /', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/' } });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();

    await fireEvent.input(textarea, { target: { value: 'hello' } });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });
});

describe('MessageInput mention trigger', () => {
  const mentions = [
    { id: '1', name: 'Alice', avatar: 'A' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie', avatar: 'C' },
  ];

  it('shows mention dropdown when typing @', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@' } });

    const dropdown = container.querySelector('.sk-message-input__dropdown');
    expect(dropdown).toBeInTheDocument();
  });

  it('filters mentions by name', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@Ali' } });

    const items = container.querySelectorAll('.sk-message-input__dropdown-item');
    expect(items.length).toBe(1);
    expect(items[0]?.textContent).toContain('Alice');
  });

  it('navigates mentions with arrow keys', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@' } });

    await fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    const highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('Bob');
  });

  it('closes mention dropdown on Escape', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@' } });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();

    await fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });
});

describe('MessageInput markdown toolbar', () => {
  it('shows markdown toolbar when enabled', () => {
    render(() => <MessageInput enableMarkdownToolbar />);
    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Inline code')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert link')).toBeInTheDocument();
  });

  it('does not show markdown toolbar when not enabled', () => {
    render(() => <MessageInput />);
    expect(screen.queryByLabelText('Bold')).not.toBeInTheDocument();
  });
});

describe('MessageInput markdown keyboard shortcuts', () => {
  it('triggers bold on Ctrl+B', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'text' } });
    await fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });

    // Should wrap with ** markers
    expect((textarea as HTMLTextAreaElement).value).toContain('**');
  });

  it('triggers italic on Ctrl+I', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'text' } });
    await fireEvent.keyDown(textarea, { key: 'i', ctrlKey: true });

    expect((textarea as HTMLTextAreaElement).value).toContain('*');
  });

  it('triggers code on Ctrl+`', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'text' } });
    await fireEvent.keyDown(textarea, { key: '`', ctrlKey: true });

    expect((textarea as HTMLTextAreaElement).value).toContain('`');
  });

  it('triggers link on Ctrl+K', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'text' } });
    await fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });

    expect((textarea as HTMLTextAreaElement).value).toContain('](url)');
  });

  it('does not trigger shortcuts when enableMarkdownToolbar is false', async () => {
    render(() => <MessageInput />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'text' } });
    await fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });

    expect((textarea as HTMLTextAreaElement).value).toBe('text');
  });
});

describe('MessageInput message history', () => {
  it('navigates up through message history', async () => {
    render(() => <MessageInput messageHistory={['first', 'second', 'third']} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;

    // ArrowUp should go to most recent history (third)
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('third');

    // ArrowUp again should go to second
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('second');
  });

  it('navigates down through message history back to empty', async () => {
    render(() => <MessageInput messageHistory={['first', 'second']} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;

    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('second');

    await fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    expect(textarea.value).toBe('');
  });

  it('stores sent messages in internal history', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;

    // Send first message
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    // Send second message
    await fireEvent.input(textarea, { target: { value: 'World' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    // Now navigate up through history
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('World');

    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('Hello');
  });
});

describe('MessageInput mention selection', () => {
  const mentions = [
    { id: '1', name: 'Alice', avatar: 'A' },
    { id: '2', name: 'Bob' },
  ];

  it('selects mention via Enter and inserts name', async () => {
    render(() => <MessageInput mentions={mentions} />);

    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: '@' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });

    // Should replace @query with @Alice (first mention)
    expect(textarea.value).toContain('@Alice');
  });
});

describe('MessageInput drag and drop files', () => {
  it('shows drag overlay on dragOver when attachments enabled', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);

    const pill = container.querySelector('.sk-message-input__pill') as HTMLElement;
    await fireEvent.dragOver(pill);

    const overlay = container.querySelector('.sk-message-input__drag-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay?.textContent).toBe('Drop files here');
  });

  it('hides drag overlay on dragLeave', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);

    const pill = container.querySelector('.sk-message-input__pill') as HTMLElement;
    await fireEvent.dragOver(pill);
    await fireEvent.dragLeave(pill);

    const overlay = container.querySelector('.sk-message-input__drag-overlay');
    expect(overlay).not.toBeInTheDocument();
  });
});

describe('MessageInput focus/blur', () => {
  it('adds focused class on focus', async () => {
    const { container } = render(() => <MessageInput />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.focus(textarea);

    const pill = container.querySelector('.sk-message-input__pill');
    expect(pill?.className).toContain('sk-message-input__pill--focused');
  });

  it('removes focused class on blur', async () => {
    const { container } = render(() => <MessageInput />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.focus(textarea);
    await fireEvent.blur(textarea);

    const pill = container.querySelector('.sk-message-input__pill');
    expect(pill?.className).not.toContain('sk-message-input__pill--focused');
  });
});

describe('MessageInput shortcut hints', () => {
  it('shows hints when focused and empty', async () => {
    const { container } = render(() => <MessageInput />);
    const textarea = screen.getByPlaceholderText('Type a message...');

    await fireEvent.focus(textarea);

    const hints = container.querySelector('.sk-message-input__hints');
    expect(hints).toBeInTheDocument();
  });

  it('hides hints when showShortcutHints is false', async () => {
    const { container } = render(() => <MessageInput showShortcutHints={false} />);
    const textarea = screen.getByPlaceholderText('Type a message...');

    await fireEvent.focus(textarea);

    const hints = container.querySelector('.sk-message-input__hints');
    expect(hints).not.toBeInTheDocument();
  });

  it('hides hints when text is entered', async () => {
    const { container } = render(() => <MessageInput />);
    const textarea = screen.getByPlaceholderText('Type a message...');

    await fireEvent.focus(textarea);
    await fireEvent.input(textarea, { target: { value: 'hello' } });

    const hints = container.querySelector('.sk-message-input__hints');
    expect(hints).not.toBeInTheDocument();
  });
});

describe('MessageInput draft prefill', () => {
  let hostSetDraft: (v: string | undefined) => void;

  const Host = (props: {
    onApplied?: () => void;
    clearOnApply?: boolean;
  }): ReturnType<typeof MessageInput> => {
    const [draft, setDraft] = createSignal<string | undefined>(undefined);
    hostSetDraft = setDraft;
    return (
      <MessageInput
        draft={draft()}
        onDraftApplied={() => {
          props.onApplied?.();
          if (props.clearOnApply !== false) setDraft(undefined);
        }}
      />
    );
  };

  it('applies a draft to the textarea, focuses it, and moves the caret to the end', () => {
    const onApplied = vi.fn();
    render(() => <Host onApplied={onApplied} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    hostSetDraft('draft text');
    expect(textarea.value).toBe('draft text');
    expect(document.activeElement).toBe(textarea);
    expect(textarea.selectionStart).toBe('draft text'.length);
    expect(textarea.selectionEnd).toBe('draft text'.length);
    expect(onApplied).toHaveBeenCalledTimes(1);
  });

  it('applies a draft present at mount time', () => {
    const onApplied = vi.fn();
    render(() => <MessageInput draft="mounted" onDraftApplied={onApplied} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('mounted');
    expect(onApplied).toHaveBeenCalledTimes(1);
  });

  it('ignores empty drafts', () => {
    const onApplied = vi.fn();
    render(() => <Host onApplied={onApplied} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    hostSetDraft('');
    expect(textarea.value).toBe('');
    expect(onApplied).not.toHaveBeenCalled();
  });

  it('re-applies the SAME draft when the host clears it in onDraftApplied', () => {
    const onApplied = vi.fn();
    render(() => <Host onApplied={onApplied} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    hostSetDraft('repeat me');
    expect(textarea.value).toBe('repeat me');
    // User edits the draft away…
    fireEvent.input(textarea, { target: { value: '' } });
    expect(textarea.value).toBe('');
    // …and the host re-sends the identical text.
    hostSetDraft('repeat me');
    expect(textarea.value).toBe('repeat me');
    expect(onApplied).toHaveBeenCalledTimes(2);
  });

  it('replaces (not appends to) an existing draft', () => {
    render(() => <Host />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: 'typed by hand' } });
    hostSetDraft('replacement');
    expect(textarea.value).toBe('replacement');
  });

  it('tolerates a missing onDraftApplied handler', () => {
    render(() => <MessageInput draft="no handler" />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('no handler');
  });
});

describe('MessageInput voice input', () => {
  interface SRResultAlternative {
    transcript: string;
  }
  interface SRResult {
    0: SRResultAlternative;
    isFinal: boolean;
  }
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    onresult: ((e: { resultIndex: number; results: SRResult[] }) => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastSR = this;
    }
  }
  let lastSR: MockSpeechRecognition | undefined;

  const srWindow = window as Window & { SpeechRecognition?: unknown };

  beforeEach(() => {
    lastSR = undefined;
    srWindow.SpeechRecognition = MockSpeechRecognition;
  });

  afterEach(() => {
    delete srWindow.SpeechRecognition;
  });

  it('starts recording on toggle, appends final transcripts, and stops on second toggle', () => {
    const { container } = render(() => <MessageInput enableVoice />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: 'note: ' } });

    const voiceBtn = screen.getByLabelText('Voice input');
    fireEvent.click(voiceBtn);
    expect(lastSR!.start).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.sk-message-input__recording-indicator')).not.toBeNull();

    lastSR!.onresult!({
      resultIndex: 0,
      results: [{ 0: { transcript: 'dictated words' }, isFinal: true }],
    });
    expect(textarea.value).toBe('note: dictated words');

    fireEvent.click(voiceBtn);
    expect(lastSR!.stop).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.sk-message-input__recording-indicator')).toBeNull();
  });
});

describe('MessageInput mention dropdown edge cases', () => {
  const mentions = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  it('closes the dropdown when whitespace ends the mention', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@Ali' } });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();
    await fireEvent.input(textarea, { target: { value: '@Ali x' } });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('wraps the highlight upward with ArrowUp', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@' } });
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    const highlighted = container.querySelector('.sk-message-input__dropdown-item--highlighted');
    expect(highlighted?.textContent).toContain('Bob');
  });
});

describe('MessageInput coverage edges', () => {
  const commands = [
    { id: '1', name: 'clear', description: 'Clear chat' },
    { id: '2', name: 'compact', description: 'Compact context' },
  ];
  const mentions = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  it('uses the computed line-height when the DOM provides one', async () => {
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ lineHeight: '20px' } as CSSStyleDeclaration);
    try {
      render(() => <MessageInput />);
      const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      await fireEvent.input(textarea, { target: { value: 'measure me' } });
      expect(textarea.style.height).toBe('20px');
    } finally {
      spy.mockRestore();
    }
  });

  it('closes the slash dropdown when the input is cleared', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/c' } });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();
    await fireEvent.input(textarea, { target: { value: '' } });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('does not open the mention dropdown when @ is preceded by a non-space character', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: 'x@' } });
    expect(container.querySelector('.sk-message-input__dropdown')).not.toBeInTheDocument();
  });

  it('inserts a mid-text mention triggered after whitespace', async () => {
    render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'hi @Ali' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(textarea.value).toContain('hi @Alice');
  });

  it('selectMention is a no-op when no @ precedes the caret', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: '@' } });
    const item = container.querySelector('.sk-message-input__dropdown-item') as HTMLElement;
    // Move the caret before the @ so the backward scan finds nothing.
    textarea.setSelectionRange(0, 0);
    await fireEvent.click(item);
    expect(textarea.value).toBe('@');
  });

  it('Enter in an empty slash dropdown does nothing', async () => {
    const onSlashCommand = vi.fn();
    const onSend = vi.fn();
    render(() => (
      <MessageInput slashCommands={commands} onSlashCommand={onSlashCommand} onSend={onSend} />
    ));
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: '/zzz' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSlashCommand).not.toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('other keys fall through while the slash dropdown is open', async () => {
    const { container } = render(() => <MessageInput slashCommands={commands} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '/c' } });
    await fireEvent.keyDown(textarea, { key: 'x' });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();
  });

  it('Enter in an empty mention dropdown does nothing', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput mentions={mentions} onSend={onSend} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: '@zzz' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    expect(textarea.value).toBe('@zzz');
  });

  it('other keys fall through while the mention dropdown is open', async () => {
    const { container } = render(() => <MessageInput mentions={mentions} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await fireEvent.input(textarea, { target: { value: '@' } });
    await fireEvent.keyDown(textarea, { key: 'x' });
    expect(container.querySelector('.sk-message-input__dropdown')).toBeInTheDocument();
  });

  it('ArrowUp without any history does nothing', async () => {
    render(() => <MessageInput />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('');
  });

  it('ArrowUp stops at the oldest history entry', async () => {
    render(() => <MessageInput messageHistory={['only one']} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('only one');
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('only one');
  });

  it('ArrowUp/ArrowDown do not navigate history across newlines', async () => {
    render(() => <MessageInput messageHistory={['previous']} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'a\nb' } });
    // Caret at the end: ArrowUp has a newline before it → no history.
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' });
    expect(textarea.value).toBe('a\nb');
    // Caret at the start: ArrowDown has a newline after it → no history.
    textarea.setSelectionRange(0, 0);
    await fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    expect(textarea.value).toBe('a\nb');
  });

  it('Enter does not send while disabled', async () => {
    const onSend = vi.fn();
    render(() => <MessageInput disabled onSend={onSend} />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'hi' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('meta-key markdown shortcuts work like ctrl', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: 'b', metaKey: true });
    expect(textarea.value).toBe('**bold text**');
  });

  it('clicking the markdown toolbar buttons formats the draft', async () => {
    render(() => <MessageInput enableMarkdownToolbar />);
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await fireEvent.click(screen.getByLabelText('Bold'));
    expect(textarea.value).toBe('**bold text**');
    await fireEvent.input(textarea, { target: { value: '' } });
    await fireEvent.click(screen.getByLabelText('Italic'));
    expect(textarea.value).toBe('*italic text*');
    await fireEvent.input(textarea, { target: { value: '' } });
    await fireEvent.click(screen.getByLabelText('Inline code'));
    expect(textarea.value).toBe('`code`');
    await fireEvent.input(textarea, { target: { value: '' } });
    await fireEvent.click(screen.getByLabelText('Insert link'));
    expect(textarea.value).toBe('[text](url)');
  });

  it('drag events are inert when attachments are disabled', async () => {
    const { container } = render(() => <MessageInput />);
    const pill = container.querySelector('.sk-message-input__pill') as HTMLElement;
    await fireEvent.dragOver(pill);
    expect(container.querySelector('.sk-message-input__drag-overlay')).not.toBeInTheDocument();
    await fireEvent.dragLeave(pill);
    await fireEvent.drop(pill);
    expect(container.querySelector('.sk-message-input__pill--dragging')).not.toBeInTheDocument();
  });

  it('drop is handled when attachments are enabled', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);
    const pill = container.querySelector('.sk-message-input__pill') as HTMLElement;
    await fireEvent.drop(pill, { dataTransfer: { files: [] } });
    expect(container.querySelector('.sk-message-input__drag-overlay')).not.toBeInTheDocument();
  });

  it('the attach button opens the hidden file input', async () => {
    const { container } = render(() => <MessageInput enableAttachments />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');
    await fireEvent.click(screen.getByLabelText('Attach files'));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the voice divider when voice and markdown toolbar are both enabled', () => {
    const srWindow = window as Window & { SpeechRecognition?: unknown };
    srWindow.SpeechRecognition = class {
      start = vi.fn();
      stop = vi.fn();
    };
    try {
      const { container } = render(() => <MessageInput enableVoice enableMarkdownToolbar />);
      expect(container.querySelectorAll('.sk-message-input__divider').length).toBe(1);
    } finally {
      delete srWindow.SpeechRecognition;
    }
  });

  it('sends attachments without any text', async () => {
    const onSend = vi.fn();
    const { container } = render(() => <MessageInput enableAttachments onSend={onSend} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    await fireEvent.change(fileInput);
    await fireEvent.click(screen.getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]![0]).toBe('');
    expect(onSend.mock.calls[0]![1]).toHaveLength(1);
  });
});
