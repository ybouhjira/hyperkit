import { Accessor } from 'solid-js';

export interface MarkdownFormatters {
  wrapSelection: (before: string, after: string, placeholder: string) => void;
  handleBold: () => void;
  handleItalic: () => void;
  handleCode: () => void;
  handleLink: () => void;
}

export function createMarkdownFormatters(
  textareaRef: { current: HTMLTextAreaElement | undefined },
  value: Accessor<string>,
  setValue: (v: string) => void,
  adjustHeight: () => void
): MarkdownFormatters {
  const wrapSelection = (before: string, after: string, placeholder: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = value();
    const selected = text.substring(start, end);

    const insert = selected || placeholder;
    const newText = text.substring(0, start) + before + insert + after + text.substring(end);
    const cursorEnd = start + before.length + insert.length;

    setValue(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      if (selected) {
        textareaRef.current?.setSelectionRange(cursorEnd + after.length, cursorEnd + after.length);
      } else {
        textareaRef.current?.setSelectionRange(start + before.length, cursorEnd);
      }
      adjustHeight();
    }, 0);
  };

  return {
    wrapSelection,
    handleBold: () => wrapSelection('**', '**', 'bold text'),
    handleItalic: () => wrapSelection('*', '*', 'italic text'),
    handleCode: () => wrapSelection('`', '`', 'code'),
    handleLink: () => wrapSelection('[', '](url)', 'text'),
  };
}
