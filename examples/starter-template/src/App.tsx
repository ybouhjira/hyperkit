import { createSignal } from 'solid-js';
import {
  ThemeProvider,
  themePresets,
  Box,
  Card,
  Button,
  Input,
  Text,
  Flex,
  ThemePicker,
} from '@ybouhjira/hyperkit';
import type { ThemeConfig } from '@ybouhjira/hyperkit';

function App() {
  const [theme, setTheme] = createSignal<ThemeConfig>(themePresets.dark);
  const [inputValue, setInputValue] = createSignal('');

  return (
    <ThemeProvider theme={theme()}>
      <Box padding="xl" style={{ 'min-height': '100vh' }}>
        <Flex direction="column" gap="lg" style={{ 'max-width': '800px', margin: '0 auto' }}>
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Text size="2xl" weight="bold">
              SolidKit Starter
            </Text>
            <ThemePicker value={theme()} onChange={setTheme} />
          </Flex>

          {/* Welcome Card */}
          <Card padding="lg">
            <Flex direction="column" gap="md">
              <Text size="xl" weight="semibold">
                Welcome to SolidKit
              </Text>
              <Text size="md" style={{ opacity: 0.8 }}>
                A modern, type-safe component library for SolidJS with built-in theming and
                accessibility.
              </Text>
            </Flex>
          </Card>

          {/* Interactive Demo */}
          <Card padding="lg">
            <Flex direction="column" gap="md">
              <Text size="lg" weight="semibold">
                Interactive Demo
              </Text>

              <Box>
                <Text size="sm" weight="medium" style={{ 'margin-bottom': '8px' }}>
                  Input Field
                </Text>
                <Input
                  value={inputValue()}
                  onInput={(e) => setInputValue(e.currentTarget.value)}
                  placeholder="Type something..."
                />
              </Box>

              {inputValue() && (
                <Text size="sm" style={{ opacity: 0.7 }}>
                  You typed: <strong>{inputValue()}</strong>
                </Text>
              )}

              <Box>
                <Text size="sm" weight="medium" style={{ 'margin-bottom': '8px' }}>
                  Button Variants
                </Text>
                <Flex gap="sm" wrap="wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                </Flex>
              </Box>
            </Flex>
          </Card>

          {/* Features Card */}
          <Card padding="lg">
            <Flex direction="column" gap="sm">
              <Text size="lg" weight="semibold">
                Features
              </Text>
              <Text size="sm">✓ Type-safe components with TypeScript</Text>
              <Text size="sm">✓ Built-in theme system with presets</Text>
              <Text size="sm">✓ Accessible components via Kobalte</Text>
              <Text size="sm">✓ CSS variables for easy customization</Text>
              <Text size="sm">✓ Responsive layout primitives</Text>
            </Flex>
          </Card>

          {/* Footer */}
          <Flex justify="center" style={{ 'margin-top': '24px', opacity: 0.6 }}>
            <Text size="sm">Built with SolidJS + SolidKit</Text>
          </Flex>
        </Flex>
      </Box>
    </ThemeProvider>
  );
}

export default App;
