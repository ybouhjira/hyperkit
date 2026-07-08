import { For, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Box } from '../../primitives/Box';
import type { AppearancePanelProps } from './types';

export const AppearancePanel: Component<AppearancePanelProps> = (props) => {
  // Move to reactive context by using it directly in JSX
  return (
    <Stack gap="lg">
      {/* Theme Selector */}
      <Stack gap="sm">
        <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Theme</Text>
        <Box
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <For
            each={
              props.availableThemes ?? [
                { id: 'light', name: 'Light' },
                { id: 'dark', name: 'Dark' },
              ]
            }
          >
            {(theme) => (
              <Box
                onClick={() => props.onChange({ ...props.settings, themeId: theme.id })}
                style={{
                  padding: '0.75rem',
                  border: `2px solid ${
                    props.settings.themeId === theme.id
                      ? 'var(--color-primary, #007bff)'
                      : 'var(--color-border, #e0e0e0)'
                  }`,
                  'border-radius': '0.5rem',
                  cursor: 'pointer',
                  'background-color':
                    props.settings.themeId === theme.id
                      ? 'var(--color-primary-light, #e3f2fd)'
                      : 'var(--color-background, white)',
                  transition: 'all 0.2s ease',
                  'text-align': 'center',
                }}
              >
                <Text style={{ 'font-size': '0.875rem', 'font-weight': '500' }}>{theme.name}</Text>
              </Box>
            )}
          </For>
        </Box>
      </Stack>

      {/* Font Size Slider */}
      <Stack gap="sm">
        <Flex justify="between" align="center">
          <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Font Size</Text>
          <Text
            style={{
              'font-size': '0.875rem',
              color: 'var(--color-text-secondary, #666)',
            }}
          >
            {props.settings.fontSize}px
          </Text>
        </Flex>
        <input
          type="range"
          min="12"
          max="20"
          step="1"
          value={props.settings.fontSize}
          onInput={(e) =>
            props.onChange({
              ...props.settings,
              fontSize: parseInt(e.currentTarget.value),
            })
          }
          style={{
            width: '100%',
            'accent-color': 'var(--color-primary, #007bff)',
          }}
        />
        <Flex justify="between">
          <Text style={{ 'font-size': '0.75rem', color: 'var(--color-text-secondary, #666)' }}>
            12px
          </Text>
          <Text style={{ 'font-size': '0.75rem', color: 'var(--color-text-secondary, #666)' }}>
            20px
          </Text>
        </Flex>
      </Stack>
    </Stack>
  );
};
