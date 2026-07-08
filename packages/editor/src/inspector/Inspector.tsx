/**
 * Inspector panel — shows editable props for the selected node.
 * Uses direct prop editing (not ActionForm's navigable dispatch)
 * because props need to update live as you type.
 */

import { type Component, For, Show, createMemo } from 'solid-js';
import { Stack, Text, Input, Separator } from '@ybouhjira/hyperkit';
import type { EditorStore } from '../store';
import { findNode } from '../store';
import { COMPONENT_SCHEMAS } from '../schemas';
import type { SupportedComponent, NodePropValue } from '../types';

export interface InspectorProps {
  store: EditorStore;
}

export const Inspector: Component<InspectorProps> = (props) => {
  const selectedNode = createMemo(() => {
    const id = props.store.state.selectedId;
    if (!id) return null;
    return findNode(props.store.state.tree, id);
  });

  const schema = createMemo(() => {
    const node = selectedNode();
    if (!node) return null;
    return COMPONENT_SCHEMAS[node.component as SupportedComponent] ?? null;
  });

  return (
    <Stack
      gap="sm"
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 'var(--sk-space-sm)',
        background: 'var(--sk-bg-secondary)',
        'border-left': '1px solid var(--sk-border)',
        'min-width': '200px',
      }}
    >
      <Text size="xs" weight="semibold" color="muted">
        INSPECTOR
      </Text>

      <Show
        when={selectedNode()}
        fallback={
          <Text size="sm" color="muted">
            Select a node to inspect its props.
          </Text>
        }
      >
        {(node) => (
          <Stack gap="sm">
            <Stack gap="2xs">
              <Text size="xs" color="muted">
                Component
              </Text>
              <Text size="sm" weight="semibold">
                {node().component}
              </Text>
              <Text size="xs" color="muted">
                ID: {node().id}
              </Text>
            </Stack>

            <Separator />

            <Show when={schema()} fallback={<Text size="sm" color="muted">No schema</Text>}>
              {(s) => (
                <Stack gap="sm">
                  <Text size="xs" color="muted" weight="semibold">
                    PROPS
                  </Text>
                  <For each={Object.entries(s())}>
                    {([key, propSchema]) => {
                      const currentValue = () => node().props[key];

                      const handleChange = (value: string): void => {
                        let coerced: NodePropValue;
                        if (propSchema.type === 'boolean') {
                          coerced = value === 'true';
                        } else if (propSchema.type === 'number') {
                          const n = parseFloat(value);
                          coerced = isNaN(n) ? undefined : n;
                        } else {
                          coerced = value;
                        }
                        props.store.updateProp(node().id, key, coerced);
                      };

                      return (
                        <Stack gap="2xs">
                          <Text size="xs" color="muted">
                            {propSchema.description}
                          </Text>

                          <Show
                            when={propSchema.enum}
                            fallback={
                              <Show
                                when={propSchema.type === 'boolean'}
                                fallback={
                                  <Input
                                    value={String(currentValue() ?? propSchema.default ?? '')}
                                    onInput={handleChange}
                                    placeholder={String(propSchema.default ?? '')}
                                  />
                                }
                              >
                                {/* Boolean toggle */}
                                <select
                                  value={String(currentValue() ?? propSchema.default ?? 'false')}
                                  onChange={(e) => handleChange(e.currentTarget.value)}
                                  style={{
                                    width: '100%',
                                    padding: 'var(--sk-space-xs)',
                                    background: 'var(--sk-bg-primary)',
                                    border: '1px solid var(--sk-border)',
                                    'border-radius': 'var(--sk-radius-sm)',
                                    color: 'var(--sk-text-primary)',
                                    'font-size': 'var(--sk-font-size-sm)',
                                  }}
                                >
                                  <option value="true">true</option>
                                  <option value="false">false</option>
                                </select>
                              </Show>
                            }
                          >
                            {(enumValues) => (
                              <select
                                value={String(currentValue() ?? propSchema.default ?? '')}
                                onChange={(e) => handleChange(e.currentTarget.value)}
                                style={{
                                  width: '100%',
                                  padding: 'var(--sk-space-xs)',
                                  background: 'var(--sk-bg-primary)',
                                  border: '1px solid var(--sk-border)',
                                  'border-radius': 'var(--sk-radius-sm)',
                                  color: 'var(--sk-text-primary)',
                                  'font-size': 'var(--sk-font-size-sm)',
                                }}
                              >
                                <For each={enumValues()}>
                                  {(opt) => <option value={opt}>{opt}</option>}
                                </For>
                              </select>
                            )}
                          </Show>
                        </Stack>
                      );
                    }}
                  </For>
                </Stack>
              )}
            </Show>
          </Stack>
        )}
      </Show>
    </Stack>
  );
};
