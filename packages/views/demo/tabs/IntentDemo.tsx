import { For, createSignal } from 'solid-js';
import { Text, Flex, Stack, Button } from '@ybouhjira/hyperkit';
import { sampleIssue } from '../helpers/data';
import { blueprint } from '../helpers/state';
import { resolveVisibleFields } from '../../src';
import { IssueCard } from '../components/IssueCard';
import type { Intent } from '../../src/types';

const INTENTS: Intent[] = ['browse', 'edit', 'pick'];

export const IntentDemo = () => {
  const [currentIntent, setCurrentIntent] = createSignal<Intent>('browse');

  const fields = () => resolveVisibleFields(blueprint(), 'card', currentIntent());

  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Text as="h2" size="2xl" weight="bold">Intent & Interaction</Text>
          <Text size="base" color="secondary">
            Different intents reveal different interactions
          </Text>
        </Stack>

        {/* Intent selector */}
        <Flex gap="sm">
          <For each={INTENTS}>
            {(intent) => (
              <Button
                variant={currentIntent() === intent ? 'primary' : 'outline'}
                onClick={() => setCurrentIntent(intent)}
                style={{ 'text-transform': 'capitalize' }}
              >
                {intent}
              </Button>
            )}
          </For>
        </Flex>

        {/* Preview */}
        <div style={{ 'max-width': '600px' }}>
          <IssueCard data={sampleIssue} fields={fields()} />
        </div>

        {/* Intent description */}
        <Stack gap="md" style={{ 'max-width': '700px' }}>
          <Text size="sm" color="secondary">
            {currentIntent() === 'browse' && 'Browse intent: Read-only view for scanning content.'}
            {currentIntent() === 'edit' && 'Edit intent: Inline editing enabled for quick updates.'}
            {currentIntent() === 'pick' && 'Pick intent: Selection UI for choosing items.'}
          </Text>
        </Stack>
      </Stack>
    </div>
  );
};
