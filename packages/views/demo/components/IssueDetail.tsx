import { For } from 'solid-js';
import { Card, CardContent, Badge, Text, Flex, Stack, Separator } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { statusVariant, formatTime } from '../helpers/utils';

export const IssueDetail = (props: { data: IssueData; fields: BlueprintField[] }) => (
  <Card variant="outlined">
    <CardContent>
      <Stack gap="md">
        <Text size="xs" color="muted">#{props.data.number}</Text>
        <Text as="h2" size="xl" weight="bold">{props.data.title}</Text>
        <Flex gap="sm" align="center">
          <Badge variant={statusVariant(props.data.status)}>{props.data.status}</Badge>
          <For each={props.data.labels}>
            {(label) => <Badge variant="default" style={{ background: label.color }}>{label.name}</Badge>}
          </For>
        </Flex>
        <Separator />
        <Flex align="center" gap="sm">
          <img
            src={props.data.assignee?.avatar}
            alt={props.data.assignee?.name}
            style={{ width: '32px', height: '32px', 'border-radius': '50%' }}
          />
          <Stack gap="xs">
            <Text size="sm" weight="medium">{props.data.assignee?.name}</Text>
            <Text size="xs" color="muted">Assignee</Text>
          </Stack>
        </Flex>
        <Separator />
        <Text size="sm" color="secondary">{props.data.body}</Text>
        <Flex justify="between" align="center">
          <Text size="sm" color="muted">{props.data.commentCount} comments</Text>
        </Flex>
        <Text size="xs" color="muted">Updated {formatTime(props.data.updatedAt)}</Text>
      </Stack>
    </CardContent>
  </Card>
);
