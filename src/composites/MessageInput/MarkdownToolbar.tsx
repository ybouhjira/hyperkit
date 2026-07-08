import { Component } from 'solid-js';
import { Tooltip } from '../../primitives/Tooltip';
import { BoldIcon, ItalicIcon, CodeIcon, LinkIcon } from './icons';

export interface MarkdownToolbarProps {
  disabled?: boolean;
  onBold: () => void;
  onItalic: () => void;
  onCode: () => void;
  onLink: () => void;
}

export const MarkdownToolbar: Component<MarkdownToolbarProps> = (props) => {
  return (
    <>
      <Tooltip content="Bold (Ctrl+B)" placement="top">
        <button
          class="sk-message-input__icon-btn"
          onClick={() => props.onBold()}
          disabled={props.disabled}
          type="button"
          aria-label="Bold"
        >
          <BoldIcon />
        </button>
      </Tooltip>
      <Tooltip content="Italic (Ctrl+I)" placement="top">
        <button
          class="sk-message-input__icon-btn"
          onClick={() => props.onItalic()}
          disabled={props.disabled}
          type="button"
          aria-label="Italic"
        >
          <ItalicIcon />
        </button>
      </Tooltip>
      <Tooltip content="Code (Ctrl+`)" placement="top">
        <button
          class="sk-message-input__icon-btn"
          onClick={() => props.onCode()}
          disabled={props.disabled}
          type="button"
          aria-label="Inline code"
        >
          <CodeIcon />
        </button>
      </Tooltip>
      <Tooltip content="Link (Ctrl+K)" placement="top">
        <button
          class="sk-message-input__icon-btn"
          onClick={() => props.onLink()}
          disabled={props.disabled}
          type="button"
          aria-label="Insert link"
        >
          <LinkIcon />
        </button>
      </Tooltip>
    </>
  );
};
