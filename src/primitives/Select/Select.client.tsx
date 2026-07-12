// This file is ONLY imported on the client (via lazy() in Select.tsx).
// It is safe to import @kobalte/core/select here.
import { type Component, splitProps, createMemo } from 'solid-js';
import { Select as KobalteSelect } from '@kobalte/core/select';
import type { SelectProps, SelectOption } from './Select';
import '@ybouhjira/hyperkit-styles/primitives/Select/Select.css';

export const SelectClient: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, [
    'options',
    'value',
    'onChange',
    'placeholder',
    'disabled',
    'class',
    'unstyled',
  ]);

  const selectedOption = createMemo(() => local.options.find((o) => o.value === local.value));

  return (
    <KobalteSelect<SelectOption>
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      // `value` stays ALWAYS present (null = no selection) so Kobalte resolves
      // the single-selection overload; omitting it falls back to the MULTIPLE
      // variant (which requires `multiple`). null satisfies exactOptional where
      // `undefined` would not.
      value={selectedOption() ?? null}
      onChange={(option) => option && local.onChange?.(option.value)}
      placeholder={local.placeholder ?? 'Select...'}
      {...(local.disabled !== undefined ? { disabled: local.disabled } : {})}
      itemComponent={(itemProps) => (
        <KobalteSelect.Item item={itemProps.item} class={local.unstyled ? '' : 'sk-select__item'}>
          <KobalteSelect.ItemLabel>{itemProps.item.rawValue.label}</KobalteSelect.ItemLabel>
          <KobalteSelect.ItemIndicator class={local.unstyled ? '' : 'sk-select__item-check'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </KobalteSelect.ItemIndicator>
        </KobalteSelect.Item>
      )}
      {...others}
    >
      <KobalteSelect.Trigger
        class={
          local.unstyled
            ? (local.class ?? '')
            : `sk-select__trigger${local.class ? ` ${local.class}` : ''}`
        }
      >
        <KobalteSelect.Value<SelectOption>>
          {(state) => state.selectedOption().label}
        </KobalteSelect.Value>
        <KobalteSelect.Icon class={local.unstyled ? '' : 'sk-select__icon'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </KobalteSelect.Icon>
      </KobalteSelect.Trigger>
      <KobalteSelect.Portal>
        <KobalteSelect.Content class={local.unstyled ? '' : 'sk-select__content'}>
          <KobalteSelect.Listbox />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  );
};
