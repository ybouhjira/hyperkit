import { Title } from '@solidjs/meta';
import { createSignal, For, onMount, Show } from 'solid-js';
import { Box, Button, Card, Input, Text, useThemeContext } from '@ybouhjira/hyperkit';

export default function Home() {
  const { theme, setTheme, themes } = useThemeContext();
  const [mounted, setMounted] = createSignal(false);
  const [name, setName] = createSignal('');

  onMount(() => setMounted(true));

  return (
    <main>
      <Title>SolidKit + Solid Start SSR Example</Title>
      <Box padding="xl" style={{ 'min-height': '100vh' }}>
        <Card padding="lg" style={{ 'max-width': '800px', margin: '0 auto' }}>
          <Text size="2xl" weight="bold" style={{ 'margin-bottom': '16px' }}>
            SolidKit + Solid Start SSR
          </Text>
          <Text size="base" color="secondary" style={{ 'margin-bottom': '32px' }}>
            This example demonstrates server-side rendering with SolidKit. Theme CSS variables are
            injected during SSR to prevent FOUC (Flash of Unstyled Content).
          </Text>

          <Box style={{ 'margin-bottom': '24px' }}>
            <Text size="sm" weight="semibold" style={{ 'margin-bottom': '8px' }}>
              Current Theme: {theme().name}
            </Text>
            <Show when={mounted()}>
              <select
                value={theme().id}
                onChange={(e) => setTheme(e.currentTarget.value)}
                style={{
                  padding: '8px 12px',
                  'border-radius': 'var(--sk-radius-md)',
                  border: '1px solid var(--sk-border)',
                  background: 'var(--sk-bg-secondary)',
                  color: 'var(--sk-text-primary)',
                  'font-family': 'var(--sk-font-ui)',
                  'font-size': 'var(--sk-font-size-base)',
                }}
              >
                <For each={themes}>
                  {(t) => <option value={t.id}>{t.name}</option>}
                </For>
              </select>
            </Show>
          </Box>

          <Box style={{ 'margin-bottom': '24px' }}>
            <Text size="sm" weight="semibold" style={{ 'margin-bottom': '8px' }}>
              Try the Input component:
            </Text>
            <Input
              placeholder="Enter your name..."
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
            />
            <Show when={name()}>
              <Text size="sm" color="muted" style={{ 'margin-top': '8px' }}>
                Hello, {name()}!
              </Text>
            </Show>
          </Box>

          <Box style={{ display: 'flex', gap: '12px', 'flex-wrap': 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </Box>

          <Box style={{ 'margin-top': '32px', 'padding-top': '24px', 'border-top': '1px solid var(--sk-border)' }}>
            <Text size="sm" weight="semibold" style={{ 'margin-bottom': '8px' }}>
              Features Demonstrated:
            </Text>
            <ul style={{ 'padding-left': '20px', margin: 0 }}>
              <li>
                <Text size="sm" color="secondary">
                  SSR-friendly theming with CSS variables
                </Text>
              </li>
              <li>
                <Text size="sm" color="secondary">
                  No FOUC - theme applied during initial render
                </Text>
              </li>
              <li>
                <Text size="sm" color="secondary">
                  Client-side theme switching after hydration
                </Text>
              </li>
              <li>
                <Text size="sm" color="secondary">
                  All SolidKit components work with SSR
                </Text>
              </li>
            </ul>
          </Box>
        </Card>
      </Box>
    </main>
  );
}
