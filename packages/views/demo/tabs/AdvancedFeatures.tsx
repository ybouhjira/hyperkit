import { createSignal, For } from 'solid-js';
import { Text, Flex, Stack, Slider, Card, CardContent, Badge } from '@ybouhjira/hyperkit';
import { sampleIssue } from '../helpers/data';
import { blueprint } from '../helpers/state';
import { KIND_COLORS } from '../helpers/utils';
import { IssueCard } from '../components/IssueCard';

export const AdvancedFeatures = () => {
  const [priorityThreshold, setPriorityThreshold] = createSignal(4);

  // Filter fields by priority
  const visibleFields = () => blueprint().filter(f => f.annotation.priority <= priorityThreshold());

  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Text as="h2" size="2xl" weight="bold">Advanced Features</Text>
          <Text size="base" color="secondary">
            Priority-based field visibility and more
          </Text>
        </Stack>

        {/* Priority slider section */}
        <Stack gap="lg" style={{ 'max-width': '800px' }}>
          <Text size="lg" weight="semibold">Priority-Based Field Visibility</Text>

          <Stack gap="md">
            <Flex justify="between" align="center">
              <Text size="sm" color="secondary">
                Drag left for mobile view, right for desktop view
              </Text>
              <Badge variant="primary" style={{ 'font-size': '16px', padding: '8px 16px' }}>
                Priority ≤ {priorityThreshold()}
              </Badge>
            </Flex>

            <Slider
              value={priorityThreshold()}
              onChange={(value) => setPriorityThreshold(value)}
              min={1}
              max={4}
              step={1}
            />

            <Flex gap="sm" justify="between" style={{ 'padding-top': '8px' }}>
              <Text size="xs" color="muted">Mobile (P1)</Text>
              <Text size="xs" color="muted">Tablet (P2)</Text>
              <Text size="xs" color="muted">Desktop (P3)</Text>
              <Text size="xs" color="muted">Full Detail (P4)</Text>
            </Flex>
          </Stack>

          {/* Live preview */}
          <div
            style={{
              transition: 'opacity 0.3s ease',
            }}
          >
            <IssueCard data={sampleIssue} fields={visibleFields()} />
          </div>

          {/* Visible fields list */}
          <Card variant="outlined">
            <CardContent>
              <Stack gap="sm">
                <Text size="sm" weight="semibold">
                  Visible Fields ({visibleFields().length}/{blueprint().length})
                </Text>
                <Flex gap="xs" style={{ 'flex-wrap': 'wrap' }}>
                  <For each={visibleFields()}>
                    {(field) => (
                      <Badge
                        variant="default"
                        style={{
                          background: KIND_COLORS[field.annotation.kind],
                          color: 'white',
                          opacity: 1,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        {field.name} (P{field.annotation.priority})
                      </Badge>
                    )}
                  </For>
                </Flex>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </div>
  );
};
