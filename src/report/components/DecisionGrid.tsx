import { type JSX, type Component, splitProps, For, Show } from 'solid-js';
import type { DecisionGridOption } from '../types';

export interface DecisionGridProps {
  id: string;
  label: string;
  description?: string;
  multiple?: boolean;
  options: DecisionGridOption[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

export const DecisionGrid: Component<DecisionGridProps> = (props) => {
  const [local, _rest] = splitProps(props, [
    'id',
    'label',
    'description',
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
      class={`sk-report-decision-grid ${local.class ?? ''}`}
      style={local.style}
      role="group"
      aria-labelledby={`${local.id}-label`}
    >
      <div class="sk-report-decision-grid__header">
        <div id={`${local.id}-label`} class="sk-report-decision-grid__label">
          {local.label}
        </div>
        <Show when={local.description}>
          <div class="sk-report-decision-grid__desc">{local.description}</div>
        </Show>
      </div>
      <div class="sk-report-decision-grid__options">
        <For each={local.options}>
          {(option) => {
            const selected = () => isSelected(option.id);
            return (
              <button
                type="button"
                class={`sk-report-decision-card${selected() ? ' sk-report-decision-card--selected' : ''}`}
                onClick={() => handleSelect(option.id)}
                aria-pressed={selected()}
              >
                <div class="sk-report-decision-card__top">
                  <Show when={option.icon}>
                    <div class="sk-report-decision-card__icon">{option.icon}</div>
                  </Show>
                  <Show when={selected()}>
                    <div class="sk-report-decision-card__check" aria-hidden="true">
                      ✓
                    </div>
                  </Show>
                </div>
                <div class="sk-report-decision-card__label">{option.label}</div>
                <Show when={option.description}>
                  <div class="sk-report-decision-card__desc">{option.description}</div>
                </Show>
                <Show when={option.tags && option.tags.length > 0}>
                  <div class="sk-report-decision-card__tags">
                    <For each={option.tags}>
                      {(tag) => <span class="sk-report-decision-card__tag">{tag}</span>}
                    </For>
                  </div>
                </Show>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};
