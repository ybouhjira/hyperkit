import { For, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Box } from '../../primitives/Box';
import type { LayoutPanelProps } from './types';

export const LayoutPanel: Component<LayoutPanelProps> = (props) => {
  return (
    <Stack gap="lg">
      {/* Sidebar Default State */}
      <Flex justify="between" align="center">
        <Stack gap="xs">
          <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>
            Sidebar Open by Default
          </Text>
          <Text style={{ 'font-size': '0.75rem', color: 'var(--color-text-secondary, #666)' }}>
            Show sidebar when app loads
          </Text>
        </Stack>
        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={props.settings.sidebarOpen}
            onChange={(e) =>
              props.onChange({ ...props.settings, sidebarOpen: e.currentTarget.checked })
            }
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              'background-color': props.settings.sidebarOpen
                ? 'var(--color-primary, #007bff)'
                : 'var(--color-border, #ccc)',
              'border-radius': '24px',
              transition: 'background-color 0.2s',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: props.settings.sidebarOpen ? '26px' : '3px',
                bottom: '3px',
                'background-color': 'var(--sk-text-on-accent)',
                'border-radius': '50%',
                transition: 'left 0.2s',
              }}
            />
          </Box>
        </label>
      </Flex>

      {/* Density Selector */}
      <Stack gap="sm">
        <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Layout Density</Text>
        <Text style={{ 'font-size': '0.75rem', color: 'var(--color-text-secondary, #666)' }}>
          Control spacing between elements
        </Text>
        <Stack gap="sm">
          <For each={['compact', 'normal', 'comfortable'] as const}>
            {(density) => (
              <Box
                onClick={() => props.onChange({ ...props.settings, density })}
                style={{
                  padding: '0.75rem 1rem',
                  border: `2px solid ${
                    props.settings.density === density
                      ? 'var(--color-primary, #007bff)'
                      : 'var(--color-border, #e0e0e0)'
                  }`,
                  'border-radius': '0.375rem',
                  cursor: 'pointer',
                  'background-color':
                    props.settings.density === density
                      ? 'var(--color-primary-light, #e3f2fd)'
                      : 'var(--color-background, white)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Flex justify="between" align="center">
                  <Stack gap="xs">
                    <Text
                      style={{
                        'font-size': '0.875rem',
                        'font-weight': '500',
                        'text-transform': 'capitalize',
                      }}
                    >
                      {density}
                    </Text>
                    <Text
                      style={{
                        'font-size': '0.75rem',
                        color: 'var(--color-text-secondary, #666)',
                      }}
                    >
                      {density === 'compact' && 'Minimal spacing'}
                      {density === 'normal' && 'Default spacing'}
                      {density === 'comfortable' && 'Generous spacing'}
                    </Text>
                  </Stack>
                  {props.settings.density === density && (
                    <Box
                      style={{
                        width: '20px',
                        height: '20px',
                        'border-radius': '50%',
                        'background-color': 'var(--color-primary, #007bff)',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                      }}
                    >
                      <Text style={{ color: 'var(--sk-text-on-accent)', 'font-size': '0.75rem' }}>
                        ✓
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Box>
            )}
          </For>
        </Stack>
      </Stack>
    </Stack>
  );
};
