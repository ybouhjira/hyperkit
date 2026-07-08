import { type JSX, type Component, splitProps, For, Show } from 'solid-js';
import type { FormFieldDef, PollOption } from '../types';

export interface FormFieldsProps {
  id: string;
  label?: string;
  fields: FormFieldDef[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

const updateField = (
  current: Record<string, unknown>,
  fieldId: string,
  value: unknown,
  onChange: (values: Record<string, unknown>) => void
) => {
  onChange({ ...current, [fieldId]: value });
};

export const FormFields: Component<FormFieldsProps> = (props) => {
  const [local, _rest] = splitProps(props, [
    'id',
    'label',
    'fields',
    'values',
    'onChange',
    'class',
    'style',
  ]);

  const fieldValue = (fieldId: string): unknown => local.values[fieldId];

  const handleChange = (fieldId: string, value: unknown) => {
    updateField(local.values, fieldId, value, local.onChange);
  };

  return (
    <div id={local.id} class={`sk-report-form ${local.class ?? ''}`} style={local.style}>
      <Show when={local.label}>
        <div class="sk-report-form__label">{local.label}</div>
      </Show>
      <div class="sk-report-form__fields">
        <For each={local.fields}>
          {(field) => (
            <div class="sk-report-form__field">
              <label class="sk-report-form__field-label" for={`${local.id}-${field.id}`}>
                {field.label}
                {field.type !== 'checkbox' && 'required' in field && field.required && (
                  <span class="sk-report-form__required" aria-label="required">
                    *
                  </span>
                )}
              </label>
              <Show when={field.type === 'text'}>
                <input
                  id={`${local.id}-${field.id}`}
                  type="text"
                  class="sk-report-form__input"
                  placeholder={(field as Extract<FormFieldDef, { type: 'text' }>).placeholder}
                  required={(field as Extract<FormFieldDef, { type: 'text' }>).required}
                  value={(fieldValue(field.id) as string) ?? ''}
                  onInput={(e) => handleChange(field.id, e.currentTarget.value)}
                />
              </Show>
              <Show when={field.type === 'number'}>
                {(() => {
                  const f = field as Extract<FormFieldDef, { type: 'number' }>;
                  return (
                    <input
                      id={`${local.id}-${field.id}`}
                      type="number"
                      class="sk-report-form__input"
                      min={f.min}
                      max={f.max}
                      required={f.required}
                      value={(fieldValue(field.id) as string) ?? ''}
                      onInput={(e) => handleChange(field.id, e.currentTarget.valueAsNumber)}
                    />
                  );
                })()}
              </Show>
              <Show when={field.type === 'select'}>
                {(() => {
                  const f = field as Extract<FormFieldDef, { type: 'select' }>;
                  return (
                    <select
                      id={`${local.id}-${field.id}`}
                      class="sk-report-form__input sk-report-form__select"
                      required={f.required}
                      value={(fieldValue(field.id) as string) ?? ''}
                      onChange={(e) => handleChange(field.id, e.currentTarget.value)}
                    >
                      <option value="">— Select —</option>
                      <For each={f.options}>
                        {(opt: PollOption) => <option value={opt.id}>{opt.label}</option>}
                      </For>
                    </select>
                  );
                })()}
              </Show>
              <Show when={field.type === 'checkbox'}>
                <div class="sk-report-form__checkbox-wrap">
                  <input
                    id={`${local.id}-${field.id}`}
                    type="checkbox"
                    class="sk-report-form__checkbox"
                    checked={(fieldValue(field.id) as boolean) ?? false}
                    onChange={(e) => handleChange(field.id, e.currentTarget.checked)}
                  />
                </div>
              </Show>
              <Show when={field.type === 'textarea'}>
                <textarea
                  id={`${local.id}-${field.id}`}
                  class="sk-report-form__input sk-report-form__textarea"
                  placeholder={(field as Extract<FormFieldDef, { type: 'textarea' }>).placeholder}
                  required={(field as Extract<FormFieldDef, { type: 'textarea' }>).required}
                  value={(fieldValue(field.id) as string) ?? ''}
                  onInput={(e) => handleChange(field.id, e.currentTarget.value)}
                />
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
