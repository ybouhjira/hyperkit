import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal, For } from 'solid-js';
import { useHaptic } from './useHaptic';
import { Button } from '../primitives';
import { Text } from '../primitives/Text';

const HapticDemo = () => {
  const haptic = useHaptic();
  const [customPattern, setCustomPattern] = createSignal('100,50,100');

  const handleCustomVibrate = () => {
    const pattern = customPattern()
      .split(',')
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v));

    if (pattern.length > 0) {
      haptic.custom(pattern);
    }
  };

  const intensities = [
    { name: 'Light', description: '10ms - Button taps', action: haptic.light },
    { name: 'Medium', description: '25ms - Important actions', action: haptic.medium },
    { name: 'Heavy', description: '50-30-50ms - Errors/warnings', action: haptic.heavy },
  ];

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: 'var(--sk-space-lg)',
        'align-items': 'stretch',
        'max-width': '600px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-sm)',
          'align-items': 'flex-start',
        }}
      >
        <Text size="xl" weight="bold">
          Haptic Feedback Demo
        </Text>
        <Text size="sm" color="secondary">
          Test vibration feedback on your mobile device
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-xs)',
          'align-items': 'flex-start',
        }}
        class="p-4 bg-surface-2 rounded-lg"
      >
        <Text size="sm" weight="medium">
          Device Support
        </Text>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'row',
            gap: 'var(--sk-space-sm)',
            'align-items': 'center',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              'border-radius': '50%',
              background: haptic.supported ? 'var(--color-success)' : 'var(--color-error)',
            }}
          />
          <Text size="sm" color="secondary">
            {haptic.supported ? 'Vibration API supported' : 'Vibration API not supported'}
          </Text>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-xs)',
          'align-items': 'flex-start',
        }}
        class="p-4 bg-surface-2 rounded-lg"
      >
        <Text size="sm" weight="medium">
          Settings
        </Text>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'row',
            gap: 'var(--sk-space-sm)',
            'align-items': 'center',
          }}
        >
          <input
            type="checkbox"
            id="haptic-enabled"
            checked={haptic.enabled()}
            onChange={(e) => haptic.setEnabled(e.currentTarget.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label for="haptic-enabled">
            <Text size="sm">Enable haptic feedback</Text>
          </label>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-md)',
          'align-items': 'stretch',
        }}
      >
        <Text size="sm" weight="medium">
          Intensity Levels
        </Text>
        <For each={intensities}>
          {(intensity) => (
            <div
              style={{
                display: 'flex',
                'flex-direction': 'column',
                gap: 'var(--sk-space-xs)',
                'align-items': 'stretch',
              }}
            >
              <Button
                onClick={intensity.action}
                variant="outlined"
                size="md"
                disabled={!haptic.enabled()}
                style={{ width: '100%' }}
              >
                {intensity.name}
              </Button>
              <Text size="xs" color="secondary" style={{ 'padding-left': '8px' }}>
                {intensity.description}
              </Text>
            </div>
          )}
        </For>
      </div>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-md)',
          'align-items': 'stretch',
        }}
        class="p-4 bg-surface-2 rounded-lg"
      >
        <Text size="sm" weight="medium">
          Custom Pattern
        </Text>
        <Text size="xs" color="secondary">
          Enter comma-separated values (ms). Example: 100,50,100
        </Text>
        <input
          type="text"
          value={customPattern()}
          onInput={(e) => setCustomPattern(e.currentTarget.value)}
          placeholder="100,50,100"
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            'border-radius': '6px',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            'font-size': '14px',
          }}
        />
        <Button
          onClick={handleCustomVibrate}
          variant="primary"
          size="md"
          disabled={!haptic.enabled()}
        >
          Test Custom Pattern
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sk-space-xs)',
          'align-items': 'flex-start',
        }}
        class="p-4 bg-surface-2 rounded-lg"
      >
        <Text size="xs" weight="medium" color="secondary">
          Note:
        </Text>
        <Text size="xs" color="secondary">
          Vibration only works on devices that support the Vibration API (most mobile devices).
          Desktop browsers typically don't support this feature.
        </Text>
      </div>
    </div>
  );
};

const meta = {
  title: 'Hooks/useHaptic',
  component: HapticDemo,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HapticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
