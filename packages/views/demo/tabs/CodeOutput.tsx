import { Text, Stack, Card, CardContent } from '@ybouhjira/hyperkit';

export const CodeOutput = () => {
  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Text as="h2" size="2xl" weight="bold">Code Output</Text>
          <Text size="base" color="secondary">
            Generated TypeScript code for your views
          </Text>
        </Stack>

        {/* Code output */}
        <Card variant="outlined">
          <CardContent>
            <pre style={{
              'font-family': 'var(--sk-font-mono)',
              'font-size': '13px',
              'white-space': 'pre-wrap',
              color: 'var(--sk-text-secondary)',
              'line-height': '1.6',
            }}>
{`// Generated view components from your blueprint

import { Card, Badge, Text, Flex } from '@ybouhjira/hyperkit';
import type { Issue } from './schema';

export const IssueCardView = (props: { data: Issue }) => (
  <Card variant="outlined" hoverable>
    <CardHeader>
      <Text weight="bold">{props.data.title}</Text>
      <Badge variant="success">{props.data.status}</Badge>
    </CardHeader>
    <CardContent>
      <Flex gap="sm">
        <Text size="sm">#{props.data.number}</Text>
        <Text size="sm">{props.data.commentCount} comments</Text>
      </Flex>
    </CardContent>
  </Card>
);

// 7 more shape components generated...`}
            </pre>
          </CardContent>
        </Card>
      </Stack>
    </div>
  );
};
