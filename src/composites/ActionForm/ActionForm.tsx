import {
  type Component,
  type JSX,
  createSignal,
  createMemo,
  createEffect,
  For,
  Show,
  splitProps,
} from 'solid-js';
import {
  getNavigable,
  dispatchAction,
  type DispatchResult,
} from '../../navigation/NavigableRegistry';
import '@ybouhjira/hyperkit-styles/composites/ActionForm/ActionForm.css';

// ── JSON Schema field extraction helpers ──────────────────────────────────────

type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

interface JsonSchemaProperty {
  type?: JsonSchemaType | JsonSchemaType[];
  description?: string;
  enum?: unknown[];
  default?: unknown;
  title?: string;
}

interface ParsedSchema {
  /** Property key */
  name: string;
  type: JsonSchemaType;
  description?: string;
  enum?: string[];
  default?: unknown;
  required: boolean;
}

function extractType(prop: JsonSchemaProperty): JsonSchemaType {
  if (Array.isArray(prop.type)) {
    const nonNull = prop.type.find((t) => t !== 'null');
    return (nonNull as JsonSchemaType | undefined) ?? 'string';
  }
  return prop.type ?? 'string';
}

function parseSchema(paramsSchema: Record<string, unknown>): ParsedSchema[] {
  const properties = paramsSchema['properties'];
  if (properties === undefined || properties === null || typeof properties !== 'object') return [];

  const required: string[] = Array.isArray(paramsSchema['required'])
    ? (paramsSchema['required'] as string[])
    : [];

  return Object.entries(properties as Record<string, unknown>).map(([name, rawProp]) => {
    const prop = (rawProp ?? {}) as JsonSchemaProperty;
    const type = extractType(prop);
    const enumValues = Array.isArray(prop.enum) ? prop.enum.map((v) => String(v)) : undefined;

    return {
      name,
      type,
      description: prop.description ?? prop.title,
      enum: enumValues,
      default: prop.default,
      required: required.includes(name),
    };
  });
}

function defaultValueFor(field: ParsedSchema): unknown {
  if (field.default !== undefined) return field.default;
  if (field.type === 'boolean') return false;
  if (field.type === 'number' || field.type === 'integer') return '';
  return '';
}

// ── ActionForm component ───────────────────────────────────────────────────────

export interface ActionFormProps {
  /** The navigable ID to target */
  target: string;
  /** The action name to dispatch */
  action: string;
  /** Called after a successful dispatch with the result */
  onSubmit?: (result: DispatchResult) => void;
  /** Called when dispatch returns ok:false */
  onError?: (error: string) => void;
  /** Custom label for the submit button */
  submitLabel?: string;
  /** Additional CSS class */
  class?: string;
  /** Inline styles */
  style?: JSX.CSSProperties;
}

export const ActionForm: Component<ActionFormProps> = (props) => {
  const [local, others] = splitProps(props, [
    'target',
    'action',
    'onSubmit',
    'onError',
    'submitLabel',
    'class',
    'style',
  ]);

  const schema = createMemo((): ParsedSchema[] | null => {
    const def = getNavigable(local.target);
    if (!def) return null;
    const entry = def.actions.get(local.action);
    if (!entry?.params) return [];
    return parseSchema(entry.params as Record<string, unknown>);
  });

  const navigableExists = createMemo(() => getNavigable(local.target) !== undefined);

  // Initialise form values from schema defaults
  const [values, setValues] = createSignal<Record<string, unknown>>({});
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitError, setSubmitError] = createSignal<string | undefined>(undefined);
  const [loading, setLoading] = createSignal(false);

  // Initialise/reinitialise values when schema becomes available
  const initialValues = createMemo(() => {
    const fields = schema();
    if (!fields) return {};
    const init: Record<string, unknown> = {};
    for (const field of fields) {
      init[field.name] = defaultValueFor(field);
    }
    return init;
  });

  // Keep values in sync with initialValues lazily (only when schema changes)
  createEffect(() => {
    // Access schema() as a dependency so this re-runs when schema changes
    schema();
    setValues(initialValues());
    setErrors({});
    setSubmitError(undefined);
  });

  function updateValue(name: string, value: unknown): void {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function validate(): boolean {
    const fields = schema();
    if (!fields) return false;

    const newErrors: Record<string, string> = {};
    const current = values();

    for (const field of fields) {
      if (!field.required) continue;
      const val = current[field.name];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (field.type === 'number' || field.type === 'integer' ? val === '' : false);
      if (isEmpty) {
        newErrors[field.name] = `${field.description ?? field.name} is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    setSubmitError(undefined);

    const fields = schema();
    if (fields === null) {
      setSubmitError(`Navigable "${local.target}" is not registered`);
      local.onError?.(`Navigable "${local.target}" is not registered`);
      return;
    }

    if (!validate()) return;

    // Coerce values to correct types before dispatch
    const coerced: Record<string, unknown> = {};
    const current = values();
    for (const field of fields) {
      const raw = current[field.name];
      if (field.type === 'number' || field.type === 'integer') {
        coerced[field.name] = raw === '' ? undefined : Number(raw);
      } else if (field.type === 'boolean') {
        coerced[field.name] = Boolean(raw);
      } else {
        coerced[field.name] = raw;
      }
    }

    const params = fields.length === 0 ? undefined : coerced;

    setLoading(true);
    try {
      const result = await dispatchAction(local.target, local.action, params);
      if (result.ok) {
        local.onSubmit?.(result);
      } else {
        const msg = result.error ?? 'Dispatch failed';
        setSubmitError(msg);
        local.onError?.(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Show
      when={navigableExists()}
      fallback={
        <div
          class={`sk-action-form sk-action-form--not-found${local.class ? ` ${local.class}` : ''}`}
          style={local.style}
          {...others}
        >
          <p class="sk-action-form__error">
            Navigable &quot;{local.target}&quot; is not registered.
          </p>
        </div>
      }
    >
      <form
        class={`sk-action-form${local.class ? ` ${local.class}` : ''}`}
        style={local.style}
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        {...others}
      >
        <For each={schema() ?? []}>
          {(field) => {
            const fieldId = `sk-af-${local.target}-${local.action}-${field.name}`;
            const fieldError = () => errors()[field.name];

            return (
              <div
                class={`sk-action-form__field${fieldError() ? ' sk-action-form__field--invalid' : ''}`}
              >
                <label class="sk-action-form__label" for={fieldId}>
                  {field.description ?? field.name}
                  <Show when={field.required}>
                    <span class="sk-action-form__required" aria-hidden="true">
                      *
                    </span>
                  </Show>
                </label>

                <Show when={field.enum !== undefined}>
                  <select
                    id={fieldId}
                    class="sk-action-form__select"
                    value={String(values()[field.name] ?? '')}
                    onChange={(e) => updateValue(field.name, e.currentTarget.value)}
                    aria-required={field.required || undefined}
                    aria-invalid={fieldError() ? true : undefined}
                    aria-describedby={fieldError() ? `${fieldId}-error` : undefined}
                    disabled={loading()}
                  >
                    <option value="">— Select —</option>
                    <For each={field.enum ?? []}>{(opt) => <option value={opt}>{opt}</option>}</For>
                  </select>
                </Show>

                <Show when={field.enum === undefined && field.type === 'boolean'}>
                  <input
                    id={fieldId}
                    type="checkbox"
                    class="sk-action-form__checkbox"
                    checked={Boolean(values()[field.name])}
                    onChange={(e) => updateValue(field.name, e.currentTarget.checked)}
                    aria-required={field.required || undefined}
                    aria-invalid={fieldError() ? true : undefined}
                    aria-describedby={fieldError() ? `${fieldId}-error` : undefined}
                    disabled={loading()}
                  />
                </Show>

                <Show
                  when={
                    field.enum === undefined &&
                    field.type !== 'boolean' &&
                    (field.type === 'number' || field.type === 'integer')
                  }
                >
                  <input
                    id={fieldId}
                    type="number"
                    class="sk-action-form__input"
                    value={String(values()[field.name] ?? '')}
                    onInput={(e) => updateValue(field.name, e.currentTarget.value)}
                    aria-required={field.required || undefined}
                    aria-invalid={fieldError() ? true : undefined}
                    aria-describedby={fieldError() ? `${fieldId}-error` : undefined}
                    disabled={loading()}
                  />
                </Show>

                <Show
                  when={
                    field.enum === undefined &&
                    field.type !== 'boolean' &&
                    field.type !== 'number' &&
                    field.type !== 'integer'
                  }
                >
                  <input
                    id={fieldId}
                    type="text"
                    class="sk-action-form__input"
                    value={String(values()[field.name] ?? '')}
                    onInput={(e) => updateValue(field.name, e.currentTarget.value)}
                    aria-required={field.required || undefined}
                    aria-invalid={fieldError() ? true : undefined}
                    aria-describedby={fieldError() ? `${fieldId}-error` : undefined}
                    disabled={loading()}
                  />
                </Show>

                <Show when={fieldError()}>
                  <span id={`${fieldId}-error`} class="sk-action-form__field-error" role="alert">
                    {fieldError()}
                  </span>
                </Show>
              </div>
            );
          }}
        </For>

        <Show when={submitError()}>
          <div class="sk-action-form__error" role="alert">
            {submitError()}
          </div>
        </Show>

        <button
          type="submit"
          class="sk-action-form__submit"
          disabled={loading()}
          aria-busy={loading()}
        >
          <Show when={loading()} fallback={local.submitLabel ?? 'Execute'}>
            Loading…
          </Show>
        </button>
      </form>
    </Show>
  );
};
