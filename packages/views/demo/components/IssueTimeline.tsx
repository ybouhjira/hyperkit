import { For } from 'solid-js';
import { Stack, Text, Flex, Badge } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { formatTime, statusVariant } from '../helpers/utils';

export const IssueTimeline = (props: { data: IssueData[]; fields: BlueprintField[] }) => (
  <Stack gap="lg" style={{ 'padding-left': '20px', 'border-left': '2px solid var(--sk-border)' }}>
    <For each={props.data}>
      {(issue) => (
        <Flex gap="md" align="start" style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '-28px',
            width: '12px',
            height: '12px',
            'border-radius': '50%',
            background: 'var(--sk-accent)',
            border: '2px solid var(--sk-bg-primary)',
          }} />
          <Stack gap="xs" style={{ flex: '1' }}>
            <Flex align="center" gap="sm">
              <Text size="sm" weight="medium">{issue.title}</Text>
              <Badge variant={statusVariant(issue.status)}>{issue.status}</Badge>
            </Flex>
            <Text size="xs" color="muted">{formatTime(issue.updatedAt)}</Text>
          </Stack>
        </Flex>
      )}
    </For>
  </Stack>
);
