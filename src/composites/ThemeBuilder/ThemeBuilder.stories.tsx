import type { Meta, StoryObj } from 'storybook-solidjs';
import { ThemeBuilder } from './ThemeBuilder';
import { createSignal, Show } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { CodeBlock } from '../../primitives/CodeBlock';

const meta = {
  title: 'Composites/ThemeBuilder',
  component: ThemeBuilder,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [exportedCode, setExportedCode] = createSignal('');
    return (
      <Stack gap="md" style={{ height: '800px' }}>
        <ThemeBuilder onExport={setExportedCode} />
        <Show when={exportedCode()}>
          <Box overflow="auto" style={{ 'max-height': '300px' }}>
            <CodeBlock code={exportedCode()} language="typescript" />
          </Box>
        </Show>
      </Stack>
    );
  },
};

export const WithInitialTheme: Story = {
  render: () => (
    <Box style={{ height: '800px' }}>
      <ThemeBuilder
        initialTheme={{
          colors: {
            accent: '#e11d48',
            bgPrimary: '#0f172a',
            textPrimary: '#f8fafc',
            bgSecondary: '#1e293b',
            bgTertiary: '#334155',
            bgElevated: '#1e293b',
            textSecondary: '#cbd5e1',
            textMuted: '#94a3b8',
            accentHover: '#be123c',
            accentMuted: 'rgba(225, 29, 72, 0.12)',
            border: 'rgba(255, 255, 255, 0.1)',
            borderSubtle: 'rgba(255, 255, 255, 0.05)',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            textOnAccent: '#ffffff',
          },
        }}
      />
    </Box>
  ),
};

export const WithChangeHandler: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = createSignal<string>('');

    return (
      <Stack gap="md" style={{ height: '800px' }}>
        <ThemeBuilder
          onThemeChange={(theme) => {
            setCurrentTheme(theme.name);
          }}
        />
        <Show when={currentTheme()}>
          <Box px="md" py="sm" bg="secondary" borderRadius="md">
            <Text>
              Current theme:{' '}
              <Text as="span" weight="semibold">
                {currentTheme()}
              </Text>
            </Text>
          </Box>
        </Show>
      </Stack>
    );
  },
};

export const Compact: Story = {
  render: () => (
    <Box style={{ height: '500px' }}>
      <ThemeBuilder />
    </Box>
  ),
};
