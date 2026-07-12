import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  For,
  Show,
  createMemo,
} from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/TagInput/TagInput.css';

export interface TagInputProps {
  /**
   * Controlled tags array
   */
  value?: string[];
  /**
   * Default tags (uncontrolled)
   */
  defaultValue?: string[];
  /**
   * Callback when tags change
   */
  onChange?: (tags: string[]) => void;
  /**
   * Autocomplete suggestions
   */
  suggestions?: string[];
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Maximum number of tags allowed
   */
  maxTags?: number;
  /**
   * Allow duplicate tags
   */
  allowDuplicates?: boolean;
  /**
   * Disable all interaction
   */
  disabled?: boolean;
  /**
   * Label text
   */
  label?: string;
  /**
   * Additional CSS classes
   */
  class?: string;
  /**
   * Custom styles
   */
  style?: JSX.CSSProperties;
  /**
   * Remove sk-* styling classes
   */
  unstyled?: boolean;
}

/** Tag input with autocomplete suggestions, duplicate prevention, and keyboard shortcuts. */
export const TagInput: Component<TagInputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'suggestions',
    'placeholder',
    'maxTags',
    'allowDuplicates',
    'disabled',
    'label',
    'class',
    'style',
    'unstyled',
  ]);

  // Internal state for uncontrolled mode
  const [internalTags, setInternalTags] = createSignal<string[]>(local.defaultValue ?? []);
  const [inputValue, setInputValue] = createSignal('');
  const [showSuggestions, setShowSuggestions] = createSignal(false);

  let inputRef: HTMLInputElement | undefined;

  // Use controlled value if provided, otherwise use internal state
  const tags = createMemo(() => local.value ?? internalTags());

  // Filtered suggestions based on current input
  const filteredSuggestions = createMemo(() => {
    if (!local.suggestions || !inputValue()) return [];
    const input = inputValue().toLowerCase();
    return local.suggestions.filter((s) => s.toLowerCase().includes(input) && !tags().includes(s));
  });

  const updateTags = (newTags: string[]) => {
    if (local.value === undefined) {
      setInternalTags(newTags);
    }
    local.onChange?.(newTags);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    const currentTags = tags();

    // Check duplicates
    if (!local.allowDuplicates && currentTags.includes(trimmed)) return;

    // Check max tags
    if (local.maxTags !== undefined && currentTags.length >= local.maxTags) return;

    updateTags([...currentTags, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    if (local.disabled) return;
    const currentTags = tags();
    updateTags(currentTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue());
    } else if (e.key === 'Backspace' && !inputValue()) {
      e.preventDefault();
      const currentTags = tags();
      if (currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    }
  };

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
    setShowSuggestions(!!target.value && (local.suggestions?.length ?? 0) > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef?.focus();
  };

  const handleWrapperClick = () => {
    if (!local.disabled) {
      inputRef?.focus();
    }
  };

  const handleInputBlur = () => {
    // Delay to allow suggestion clicks to register
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (inputValue() && (local.suggestions?.length ?? 0) > 0) {
      setShowSuggestions(true);
    }
  };

  const isMaxReached = createMemo(
    () => local.maxTags !== undefined && tags().length >= local.maxTags
  );

  return (
    <div class={local.unstyled ? '' : 'sk-tag-input-container'} style={local.style}>
      <Show when={local.label}>
        <label class={local.unstyled ? '' : 'sk-tag-input-label'}>{local.label}</label>
      </Show>
      <div
        class={
          local.unstyled
            ? (local.class ?? '')
            : `sk-tag-input ${local.disabled ? 'sk-tag-input--disabled' : ''} ${local.class ?? ''}`
        }
        onClick={handleWrapperClick}
        {...rest}
      >
        <For each={tags()}>
          {(tag, index) => (
            <div class={local.unstyled ? '' : 'sk-tag-input__tag'}>
              <span class={local.unstyled ? '' : 'sk-tag-input__tag-text'}>{tag}</span>
              <button
                type="button"
                class={local.unstyled ? '' : 'sk-tag-input__remove'}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index());
                }}
                disabled={local.disabled}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </div>
          )}
        </For>
        <Show when={!isMaxReached()}>
          <input
            ref={inputRef}
            type="text"
            class={local.unstyled ? '' : 'sk-tag-input__input'}
            value={inputValue()}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={tags().length === 0 ? (local.placeholder ?? 'Add tag...') : ''}
            disabled={local.disabled}
          />
        </Show>
      </div>
      <Show when={showSuggestions() && filteredSuggestions().length > 0}>
        <div class={local.unstyled ? '' : 'sk-tag-input__suggestions'}>
          <For each={filteredSuggestions()}>
            {(suggestion) => (
              <button
                type="button"
                class={local.unstyled ? '' : 'sk-tag-input__suggestion'}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
