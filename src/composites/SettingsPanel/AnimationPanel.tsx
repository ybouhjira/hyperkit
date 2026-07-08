import { createSignal, For, type Component } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Box } from '../../primitives/Box';
import type { AnimationPanelProps } from './types';

export const AnimationPanel: Component<AnimationPanelProps> = (props) => {
  const [isAnimating, setIsAnimating] = createSignal(false);

  const speedMultipliers = {
    slow: 2,
    normal: 1,
    fast: 0.5,
  };

  const playPreview = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000 * speedMultipliers[props.settings.speed]);
  };

  return (
    <Stack gap="lg">
      {/* Enable/Disable Toggle */}
      <Flex justify="between" align="center">
        <Stack gap="xs">
          <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Enable Animations</Text>
          <Text style={{ 'font-size': '0.75rem', color: 'var(--color-text-secondary, #666)' }}>
            Turn animations on or off globally
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
            checked={props.settings.enabled}
            onChange={(e) =>
              props.onChange({ ...props.settings, enabled: e.currentTarget.checked })
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
              'background-color': props.settings.enabled
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
                left: props.settings.enabled ? '26px' : '3px',
                bottom: '3px',
                'background-color': 'var(--sk-text-on-accent)',
                'border-radius': '50%',
                transition: 'left 0.2s',
              }}
            />
          </Box>
        </label>
      </Flex>

      {/* Speed Selector */}
      <Stack gap="sm">
        <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Animation Speed</Text>
        <Flex gap="sm">
          <For each={['slow', 'normal', 'fast'] as const}>
            {(speed) => (
              <Box
                onClick={() => props.onChange({ ...props.settings, speed })}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  border: `2px solid ${
                    props.settings.speed === speed
                      ? 'var(--color-primary, #007bff)'
                      : 'var(--color-border, #e0e0e0)'
                  }`,
                  'border-radius': '0.375rem',
                  cursor: 'pointer',
                  'background-color':
                    props.settings.speed === speed
                      ? 'var(--color-primary-light, #e3f2fd)'
                      : 'var(--color-background, white)',
                  'text-align': 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Text
                  style={{
                    'font-size': '0.875rem',
                    'font-weight': '500',
                    'text-transform': 'capitalize',
                  }}
                >
                  {speed}
                </Text>
              </Box>
            )}
          </For>
        </Flex>
      </Stack>

      {/* Preview Button */}
      <Stack gap="sm">
        <Text style={{ 'font-weight': '600', 'font-size': '0.875rem' }}>Preview</Text>
        <button
          onClick={playPreview}
          disabled={!props.settings.enabled}
          style={{
            padding: '0.75rem',
            'background-color': props.settings.enabled
              ? 'var(--color-primary, #007bff)'
              : 'var(--color-border, #ccc)',
            color: 'var(--sk-text-on-accent)',
            border: 'none',
            'border-radius': '0.375rem',
            cursor: props.settings.enabled ? 'pointer' : 'not-allowed',
            'font-weight': '500',
            'font-size': '0.875rem',
          }}
        >
          Play Animation
        </button>
        {props.settings.enabled && (
          <Box
            style={{
              width: '48px',
              height: '48px',
              'background-color': 'var(--color-primary, #007bff)',
              'border-radius': '0.5rem',
              transform: isAnimating()
                ? 'translateX(200px) rotate(360deg)'
                : 'translateX(0) rotate(0)',
              transition: `all ${1 * speedMultipliers[props.settings.speed]}s ease-in-out`,
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};
