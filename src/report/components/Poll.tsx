import { type JSX, type Component, splitProps, For } from 'solid-js';
import type { PollOption } from '../types';

export interface PollProps {
  id: string;
  label: string;
  multiple?: boolean;
  options: PollOption[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

export const Poll: Component<PollProps> = (props) => {
  const [local, _rest] = splitProps(props, [
    'id',
    'label',
    'multiple',
    'options',
    'selected',
    'onSelect',
    'class',
    'style',
  ]);

  const isSelected = (optionId: string): boolean => local.selected.includes(optionId);

  const handleSelect = (optionId: string) => {
    if (local.multiple) {
      const next = isSelected(optionId)
        ? local.selected.filter((id) => id !== optionId)
        : [...local.selected, optionId];
      local.onSelect(next);
    } else {
      local.onSelect(isSelected(optionId) ? [] : [optionId]);
    }
  };

  return (
    <div
      id={local.id}
      class={`sk-report-poll ${local.class ?? ''}`}
      style={local.style}
      role="group"
      aria-labelledby={`${local.id}-label`}
    >
      <div id={`${local.id}-label`} class="sk-report-poll__label">
        {local.label}
      </div>
      <div class="sk-report-poll__options">
        <For each={local.options}>
          {(option) => {
            const selected = () => isSelected(option.id);
            return (
              <button
                type="button"
                class={`sk-report-poll__option${selected() ? ' sk-report-poll__option--selected' : ''}`}
                onClick={() => handleSelect(option.id)}
                aria-pressed={selected()}
              >
                <span
                  class={`sk-report-poll__indicator${selected() ? ' sk-report-poll__indicator--selected' : ''}`}
                  aria-hidden="true"
                >
                  {selected() ? '●' : '○'}
                </span>
                <span class="sk-report-poll__option-label">{option.label}</span>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};
