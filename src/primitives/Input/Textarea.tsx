import { type Component, splitProps, createEffect, onMount } from 'solid-js';
import './Input.css';

export interface TextareaProps {
  /** Placeholder text displayed when the textarea is empty. */
  placeholder?: string;
  /** Current textarea value. */
  value?: string;
  /** Callback fired when textarea value changes. */
  onInput?: (value: string) => void;
  /** Auto-resize height to fit content between minRows and maxRows. */
  autoResize?: boolean;
  /** Minimum number of visible rows.
   * @default 2 */
  minRows?: number;
  /** Maximum number of visible rows when autoResize is enabled.
   * @default 10 */
  maxRows?: number;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Error message displayed below the textarea. */
  error?: string;
  /** Additional CSS class name. */
  class?: string;
  /** Textarea element ID for label association. */
  id?: string;
  /** Textarea element name for form submission. */
  name?: string;
  /** Mark the field as required.
   * @default false */
  required?: boolean;
  /** Accessible label for screen readers when no visible label is present. */
  'aria-label'?: string;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, [
    'placeholder',
    'value',
    'onInput',
    'autoResize',
    'minRows',
    'maxRows',
    'disabled',
    'error',
    'class',
    'id',
    'name',
    'required',
    'aria-label',
    'unstyled',
  ]);

  let textareaRef: HTMLTextAreaElement | undefined;

  const adjustHeight = () => {
    if (textareaRef == null || !local.autoResize) return;
    textareaRef.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(textareaRef).lineHeight, 10);
    const validLineHeight = isNaN(lineHeight) ? 20 : lineHeight;
    const minHeight = (local.minRows ?? 2) * validLineHeight;
    const maxHeight = (local.maxRows ?? 10) * validLineHeight;
    const scrollHeight = textareaRef.scrollHeight;
    textareaRef.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  };

  createEffect(() => {
    const _ = local.value;
    adjustHeight();
  });

  const handleInput = (e: InputEvent) => {
    const target = e.currentTarget as HTMLTextAreaElement;
    local.onInput?.(target.value);
    adjustHeight();
  };

  // Expose programmatic setValue on the DOM element for browser automation compatibility
  onMount(() => {
    if (textareaRef != null) {
      const handler = local.onInput;
      (textareaRef as HTMLTextAreaElement & { __setValue: (value: string) => void }).__setValue = (
        value: string
      ) => {
        handler?.(value);
      };
    }
  });

  return (
    <div class={local.unstyled ? (local.class ?? '') : 'sk-input-wrapper'}>
      <textarea
        ref={textareaRef}
        placeholder={local.placeholder}
        value={local.value ?? ''}
        on:input={handleInput}
        disabled={local.disabled}
        id={local.id}
        name={local.name}
        required={local.required}
        aria-label={local['aria-label']}
        rows={local.minRows ?? 2}
        class={
          local.unstyled
            ? ''
            : `sk-textarea${local.error ? ' sk-textarea--error' : ''} ${local.class ?? ''}`
        }
        aria-invalid={local.error ? true : undefined}
        {...others}
      />
      {local.error && (
        <span class={local.unstyled ? '' : 'sk-input__error'} role="alert">
          {local.error}
        </span>
      )}
    </div>
  );
};
