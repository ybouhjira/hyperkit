import { type JSX, type Component, splitProps, For } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/SuggestionChips/SuggestionChips.css';

/** Configuration for a single suggestion chip. */
export interface SuggestionChip {
  /** Unique identifier. */
  id: string;
  /** Label text displayed on the chip. */
  label: string;
  /** Optional icon element. */
  icon?: JSX.Element;
  /** Optional description for accessibility. */
  description?: string;
}

/** Props for the SuggestionChips component. */
export interface SuggestionChipsProps {
  /** Array of suggestion chips to display. */
  chips: SuggestionChip[];
  /** Callback when a chip is clicked. */
  onSelect: (chip: SuggestionChip) => void;
  /** Additional CSS classes. */
  class?: string;
}

/** Horizontal list of clickable suggestion chips with optional icons. */
export const SuggestionChips: Component<SuggestionChipsProps> = (props) => {
  const [local, others] = splitProps(props, ['chips', 'onSelect', 'class']);

  const handleClick = (chip: SuggestionChip) => {
    local.onSelect(chip);
  };

  return (
    <div class={`sk-suggestion-chips ${local.class ?? ''}`} {...others}>
      <For each={local.chips}>
        {(chip) => (
          <button
            type="button"
            class="sk-suggestion-chips__chip"
            onClick={() => handleClick(chip)}
            aria-label={chip.description ?? chip.label}
          >
            {chip.icon != null && <span class="sk-suggestion-chips__icon">{chip.icon}</span>}
            <span class="sk-suggestion-chips__label">{chip.label}</span>
          </button>
        )}
      </For>
    </div>
  );
};
