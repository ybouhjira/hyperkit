/**
 * Controls — the interactive prop panel for HyperDocs live examples.
 *
 * `extractControls` (pure) turns a story's argTypes + args into a typed list of
 * controls; `Controls` renders them with HyperKit inputs. Together they let a
 * developer tweak props and watch the live preview update.
 */

import { For, Show, type Component } from 'solid-js';
import { Switch } from '../primitives/Switch';
import { Select } from '../primitives/Select';
import { NumberInput } from '../primitives/NumberInput';
import { Input } from '../primitives/Input';
import type { CsfStory } from './csf.js';
import '@ybouhjira/hyperkit-styles/live-docs/controls.css';

export type ControlKind = 'boolean' | 'select' | 'number' | 'text';

export interface ControlDef {
  readonly name: string;
  readonly kind: ControlKind;
  readonly value: string | number | boolean;
  readonly options?: readonly string[];
}

interface ArgType {
  readonly control?: string | { readonly type?: string };
  readonly options?: readonly string[];
}

export interface CsfMeta {
  readonly component?: unknown;
  readonly args?: Record<string, unknown>;
  readonly argTypes?: Record<string, ArgType>;
}

/** Derive editable controls from a story's argTypes + (meta+story) args. */
export function extractControls(meta: CsfMeta, story: CsfStory): ControlDef[] {
  const argTypes = meta.argTypes ?? {};
  const args = { ...(meta.args ?? {}), ...(story.args ?? {}) };
  const names = [...new Set([...Object.keys(argTypes), ...Object.keys(args)])];
  const out: ControlDef[] = [];

  for (const name of names) {
    const at: ArgType | undefined = argTypes[name];
    const control = typeof at?.control === 'string' ? at.control : at?.control?.type;
    const val = args[name];

    if (control === 'select' && Array.isArray(at?.options)) {
      const options = at.options;
      out.push({
        name,
        kind: 'select',
        options,
        value: typeof val === 'string' ? val : (options[0] ?? ''),
      });
    } else if (control === 'boolean' || typeof val === 'boolean') {
      out.push({ name, kind: 'boolean', value: typeof val === 'boolean' ? val : false });
    } else if (typeof val === 'number') {
      out.push({ name, kind: 'number', value: val });
    } else if (typeof val === 'string') {
      out.push({ name, kind: 'text', value: val });
    }
  }
  return out;
}

export interface ControlsProps {
  readonly controls: readonly ControlDef[];
  readonly values: Record<string, unknown>;
  readonly onChange: (name: string, value: unknown) => void;
}

export const Controls: Component<ControlsProps> = (props) => {
  // One shared handler so every input routes through the same (testable) path.
  // `change(name)` returns an event handler — props.onChange is a stable
  // callback, not reactive state, so the reactivity warning is a false positive.
  // eslint-disable-next-line solid/reactivity
  const change = (name: string) => (value: unknown) => props.onChange(name, value);

  return (
    <div class="sk-controls" role="group" aria-label="Props">
      <For each={props.controls}>
        {(control) => (
          <div class="sk-controls__row">
            <span class="sk-controls__label">{control.name}</span>
            <div class="sk-controls__input">
              <Show when={control.kind === 'boolean'}>
                <Switch
                  checked={Boolean(props.values[control.name])}
                  onChange={change(control.name)}
                />
              </Show>
              <Show when={control.kind === 'select'}>
                <Select
                  options={(control.options ?? []).map((o) => ({ value: o, label: o }))}
                  value={String(props.values[control.name] ?? '')}
                  onChange={change(control.name)}
                />
              </Show>
              <Show when={control.kind === 'number'}>
                <NumberInput
                  value={Number(props.values[control.name] ?? 0)}
                  onChange={change(control.name)}
                />
              </Show>
              <Show when={control.kind === 'text'}>
                <Input
                  value={String(props.values[control.name] ?? '')}
                  onInput={change(control.name)}
                />
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
