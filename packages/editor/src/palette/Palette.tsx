/**
 * Palette panel — lists draggable HyperKit components grouped by category.
 */

import { type Component, For, createMemo } from 'solid-js';
import { Stack, Text, Separator } from '@ybouhjira/hyperkit';
import { COMPONENT_CATEGORIES } from '../schemas';
import { PaletteItem } from './PaletteItem';

export const Palette: Component = () => {
  // Group entries by group label
  const groups = createMemo(() => {
    const map = new Map<string, typeof COMPONENT_CATEGORIES[number]['component'][]>();
    for (const entry of COMPONENT_CATEGORIES) {
      const existing = map.get(entry.group) ?? [];
      existing.push(entry.component);
      map.set(entry.group, existing);
    }
    return [...map.entries()];
  });

  return (
    <Stack
      gap="sm"
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 'var(--sk-space-sm)',
        background: 'var(--sk-bg-secondary)',
        'border-right': '1px solid var(--sk-border)',
      }}
    >
      <Text size="xs" weight="semibold" color="muted">
        COMPONENTS
      </Text>
      <For each={groups()}>
        {([group, components]) => (
          <Stack gap="xs">
            <Text size="xs" color="muted">
              {group}
            </Text>
            <Stack gap="2xs">
              <For each={components}>
                {(component) => <PaletteItem component={component} />}
              </For>
            </Stack>
            <Separator />
          </Stack>
        )}
      </For>
    </Stack>
  );
};
