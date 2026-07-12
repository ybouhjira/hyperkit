/* eslint-disable no-console */
import { createSignal, createMemo, createEffect, Show, For, type JSX, mergeProps } from 'solid-js';
import { zedDarkTheme } from '../../theme/presets';
import type { ThemeConfig, ThemeColors } from '../../theme/types';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ThemeBuilderPreview } from './ThemeBuilderPreview';
import { normalizeColor, generateThemeCode, colorGroups } from './themeBuilderUtils';
import '@ybouhjira/hyperkit-styles/composites/ThemeBuilder/ThemeBuilder.css';

export interface ThemeBuilderProps {
  initialTheme?: Partial<ThemeConfig>;
  onThemeChange?: (theme: ThemeConfig) => void;
  onExport?: (code: string) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

export function ThemeBuilder(props: ThemeBuilderProps) {
  const merged = mergeProps(
    {
      initialTheme: {} as Partial<ThemeConfig>,
    },
    props
  );

  const defaultTheme: ThemeConfig = {
    ...zedDarkTheme,
    id: 'custom-theme',
    name: 'Custom Theme',
  };

  const [workingTheme, setWorkingTheme] = createSignal<ThemeConfig>({
    ...defaultTheme,
    ...merged.initialTheme,
  });

  const [importText, setImportText] = createSignal('');
  const [showImport, setShowImport] = createSignal(false);

  const fullTheme = createMemo(() => workingTheme());

  createEffect(() => {
    const theme = fullTheme();
    props.onThemeChange?.(theme);
  });

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setWorkingTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const updateRadius = (key: 'sm' | 'md' | 'lg' | 'xl', value: number) => {
    setWorkingTheme((prev) => ({
      ...prev,
      radius: {
        ...prev.radius,
        [key]: `${value}px`,
      },
    }));
  };

  const updateFont = (key: 'ui' | 'code' | 'mono', value: string) => {
    setWorkingTheme((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [key]: value,
      },
    }));
  };

  const updateFontSize = (key: keyof typeof defaultTheme.fontSizes, value: string) => {
    setWorkingTheme((prev) => ({
      ...prev,
      fontSizes: {
        ...prev.fontSizes,
        [key]: value,
      },
    }));
  };

  const handleExport = () => {
    const code = generateThemeCode(fullTheme());
    props.onExport?.(code);
    void navigator.clipboard.writeText(code);
  };

  const handleImport = () => {
    try {
      const imported = JSON.parse(importText()) as Partial<ThemeConfig>;
      setWorkingTheme({
        ...defaultTheme,
        ...imported,
        id: imported.id || 'imported-theme',
        name: imported.name || 'Imported Theme',
      });
      setShowImport(false);
      setImportText('');
    } catch (e) {
      console.error('Failed to import theme:', e);
    }
  };

  return (
    <Box class={`sk-theme-builder ${props.class || ''}`} style={props.style}>
      <Box class="sk-theme-builder__header">
        <Text size="xl" weight="semibold">
          Theme Builder
        </Text>
      </Box>

      <Box class="sk-theme-builder__content">
        <Box class="sk-theme-builder__controls">
          <Stack gap="lg">
            {/* Colors Section */}
            <Box class="sk-theme-builder__section">
              <Text size="sm" weight="semibold" style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                Colors
              </Text>
              <Stack gap="md">
                <For each={colorGroups}>
                  {(group) => (
                    <Box>
                      <Text
                        size="xs"
                        style={{
                          color: 'var(--sk-text-secondary)',
                          'margin-bottom': 'var(--sk-space-sm)',
                          'text-transform': 'uppercase',
                          'letter-spacing': '0.05em',
                        }}
                      >
                        {group.label}
                      </Text>
                      <Box class="sk-theme-builder__color-grid">
                        <For each={group.colors}>
                          {(color) => (
                            <Box class="sk-theme-builder__color-item">
                              <label class="sk-theme-builder__color-label">
                                <input
                                  type="color"
                                  class="sk-theme-builder__color-input"
                                  value={normalizeColor(workingTheme().colors[color.key])}
                                  onInput={(e) => updateColor(color.key, e.currentTarget.value)}
                                />
                                <Text size="sm">{color.label}</Text>
                              </label>
                            </Box>
                          )}
                        </For>
                      </Box>
                    </Box>
                  )}
                </For>
              </Stack>
            </Box>

            {/* Radius Section */}
            <Box class="sk-theme-builder__section">
              <Text size="sm" weight="semibold" style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                Border Radius
              </Text>
              <Stack gap="sm">
                <For each={['sm', 'md', 'lg', 'xl'] as const}>
                  {(size) => (
                    <Box>
                      <Flex
                        justify="between"
                        align="center"
                        style={{ 'margin-bottom': 'var(--sk-space-xs)' }}
                      >
                        <Text size="sm">{size.toUpperCase()}</Text>
                        <Text size="xs" style={{ color: 'var(--sk-text-secondary)' }}>
                          {workingTheme().radius[size]}
                        </Text>
                      </Flex>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={parseInt(workingTheme().radius[size])}
                        onInput={(e) => updateRadius(size, parseInt(e.currentTarget.value))}
                        style={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </For>
              </Stack>
            </Box>

            {/* Typography Section */}
            <Box class="sk-theme-builder__section">
              <Text size="sm" weight="semibold" style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                Typography
              </Text>
              <Stack gap="sm">
                <Box>
                  <Text size="sm" style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
                    UI Font
                  </Text>
                  <Input
                    value={workingTheme().fonts.ui}
                    onInput={(value) => updateFont('ui', value)}
                  />
                </Box>
                <Box>
                  <Text size="sm" style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
                    Code Font
                  </Text>
                  <Input
                    value={workingTheme().fonts.code}
                    onInput={(value) => updateFont('code', value)}
                  />
                </Box>
                <Box>
                  <Text size="sm" style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
                    Mono Font
                  </Text>
                  <Input
                    value={workingTheme().fonts.mono}
                    onInput={(value) => updateFont('mono', value)}
                  />
                </Box>
                <Box>
                  <Text size="sm" style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
                    Base Font Size
                  </Text>
                  <Input
                    value={workingTheme().fontSizes.base}
                    onInput={(value) => updateFontSize('base', value)}
                  />
                </Box>
                <Box>
                  <Text size="sm" style={{ 'margin-bottom': 'var(--sk-space-xs)' }}>
                    Large Font Size
                  </Text>
                  <Input
                    value={workingTheme().fontSizes.lg}
                    onInput={(value) => updateFontSize('lg', value)}
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <ThemeBuilderPreview theme={fullTheme()} />
      </Box>

      <Box class="sk-theme-builder__actions">
        <Flex gap="sm" justify="between" align="center">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(!showImport())}>
            {showImport() ? 'Cancel Import' : 'Import JSON'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            Copy Theme Config
          </Button>
        </Flex>

        <Show when={showImport()}>
          <Box style={{ 'margin-top': 'var(--sk-space-md)' }}>
            <textarea
              class="sk-theme-builder__import-textarea"
              placeholder="Paste ThemeConfig JSON here..."
              value={importText()}
              onInput={(e) => setImportText(e.currentTarget.value)}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleImport}
              style={{ 'margin-top': 'var(--sk-space-sm)' }}
            >
              Apply Import
            </Button>
          </Box>
        </Show>
      </Box>
    </Box>
  );
}
