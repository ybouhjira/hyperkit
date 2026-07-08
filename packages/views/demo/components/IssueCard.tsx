import { For } from 'solid-js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Text, Flex } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { statusVariant, formatTime } from '../helpers/utils';

export const IssueCard = (props: { data: IssueData; fields: BlueprintField[] }) => (
  <Card variant="outlined" hoverable>
    <CardHeader>
      <Flex justify="between" align="center">
        <CardTitle>{props.data.title}</CardTitle>
        <Badge variant={statusVariant(props.data.status)}>{props.data.status}</Badge>
      </Flex>
      <CardDescription>#{props.data.number}</CardDescription>
    </CardHeader>
    <CardContent>
      <Flex align="center" gap="sm">
        <img
          src={props.data.assignee?.avatar}
          alt={props.data.assignee?.name}
          style={{ width: '24px', height: '24px', 'border-radius': '50%' }}
        />
        <Text size="sm" color="secondary">{props.data.assignee?.name}</Text>
      </Flex>
      <Flex gap="xs" style={{ 'margin-top': '8px', 'flex-wrap': 'wrap' }}>
        <For each={props.data.labels}>
          {(label) => <Badge variant="default" style={{ background: label.color }}>{label.name}</Badge>}
        </For>
      </Flex>
    </CardContent>
    <CardFooter>
      <Flex justify="between" align="center" style={{ width: '100%' }}>
        <Text size="sm" color="muted">{props.data.commentCount} comments</Text>
        <Text size="sm" color="muted">{formatTime(props.data.updatedAt)}</Text>
      </Flex>
    </CardFooter>
  </Card>
);
