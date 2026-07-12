import { type Component, splitProps, Show, createSignal, createEffect } from 'solid-js';
import { Icon } from '../../icons';
import { Kbd } from '../Kbd';
import '@ybouhjira/hyperkit-styles/primitives/SearchInput/SearchInput.css';

/** Props for the SearchInput component. */
export interface SearchInputProps {
  /** Controlled input value. */
  value?: string;
  /** Placeholder text.
   * @default 'Search...' */
  placeholder?: string;
  /** Keyboard shortcut hint displayed when empty. */
  shortcut?: string;
  /** Callback when Enter key is pressed. */
  onSearch?: (value: string) => void;
  /** Callback when input value changes. */
  onChange?: (value: string) => void;
  /** Callback when clear button is clicked. */
  onClear?: () => void;
  /** Additional CSS classes. */
  class?: string;
  /** Auto-focus the input on mount.
   * @default false */
  autofocus?: boolean;
  /** Disable the input.
   * @default false */
  disabled?: boolean;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Search input with icon, clear button, and keyboard shortcut hint.
 *
 * @example
 * ```tsx
 * import { SearchInput, Stack, Table } from "@ybouhjira/hyperkit";
 * import { createSignal, createMemo } from "solid-js";
 *
 * // Filterable data table header
 * const [query, setQuery] = createSignal("");
 * const filtered = createMemo(() =>
 *   users.filter((u) => u.name.toLowerCase().includes(query().toLowerCase()))
 * );
 * <Stack gap="md">
 *   <SearchInput
 *     value={query()}
 *     onChange={setQuery}
 *     onClear={() => setQuery("")}
 *     placeholder="Search users..."
 *     shortcut="⌘F"
 *   />
 *   <Table data={filtered()} columns={columns} getRowKey={(u) => u.id} />
 * </Stack>
 *
 * // Autofocused search with Enter handler
 * <SearchInput
 *   autofocus
 *   placeholder="Search documentation..."
 *   onSearch={(q) => navigate(`/docs?q=${encodeURIComponent(q)}`)}
 * />
 * ```
 *
 * @see Input - for general text input
 * @see CommandPalette - for command search with keyboard navigation
 */
export const SearchInput: Component<SearchInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'placeholder',
    'shortcut',
    'onSearch',
    'onChange',
    'onClear',
    'class',
    'autofocus',
    'disabled',
    'unstyled',
  ]);

  const [internalValue, setInternalValue] = createSignal('');

  // Sync prop value to internal state
  createEffect(() => {
    if (local.value !== undefined) {
      setInternalValue(local.value);
    }
  });

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    setInternalValue(target.value);
    local.onChange?.(target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    local.onClear?.();
    local.onChange?.('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      local.onSearch?.(internalValue());
    }
  };

  const currentValue = () => local.value ?? internalValue();
  const hasValue = () => currentValue().length > 0;

  return (
    <div
      role="search"
      class={local.unstyled ? (local.class ?? '') : `sk-search-input ${local.class ?? ''}`}
      data-disabled={local.disabled || undefined}
      {...others}
    >
      <Icon name="search" size="sm" class={local.unstyled ? '' : 'sk-search-input__icon'} />
      <input
        class={local.unstyled ? '' : 'sk-search-input__field'}
        type="text"
        aria-label="Search"
        value={currentValue()}
        placeholder={local.placeholder ?? 'Search...'}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        autofocus={local.autofocus}
        disabled={local.disabled}
      />
      <Show when={hasValue()}>
        <button
          class={local.unstyled ? '' : 'sk-search-input__clear'}
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <Icon name="close" size="sm" />
        </button>
      </Show>
      <Show when={!hasValue() && local.shortcut}>
        <Kbd class={local.unstyled ? '' : 'sk-search-input__shortcut'}>{local.shortcut}</Kbd>
      </Show>
    </div>
  );
};
