import { For } from 'solid-js';
import { Text, Flex, Stack, Button, useTheme } from '@ybouhjira/hyperkit';
import { sampleIssue } from '../helpers/data';
import { blueprint } from '../helpers/state';
import { resolveVisibleFields } from '../../src';
import { IssueCard } from '../components/IssueCard';

const DEMO_THEMES = [
  { id: 'github-light', label: 'GitHub Light' },
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'zed-dark', label: 'Zed Dark' },
  { id: 'linear', label: 'Linear' },
  { id: 'material-light', label: 'Material Light' },
  { id: 'ocean', label: 'Ocean' },
];

export const ThemePlayground = () => {
  const { theme, setTheme } = useTheme();
  const fields = resolveVisibleFields(blueprint(), 'card', 'browse');

  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Text as="h2" size="2xl" weight="bold">Theme Playground</Text>
          <Text size="base" color="secondary">
            Switch themes to see the same view adapt
          </Text>
        </Stack>

        {/* Theme selector */}
        <Flex gap="sm" style={{ 'flex-wrap': 'wrap' }}>
          <For each={DEMO_THEMES}>
            {(t) => (
              <Button
                variant={theme().id === t.id ? 'primary' : 'outline'}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </Button>
            )}
          </For>
        </Flex>

        {/* Preview */}
        <div style={{ 'max-width': '600px' }}>
          <IssueCard data={sampleIssue} fields={fields} />
        </div>
      </Stack>
    </div>
  );
};
