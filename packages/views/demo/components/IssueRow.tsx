import { Badge, Text, Flex } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { statusVariant, formatTime } from '../helpers/utils';

export const IssueRow = (props: { data: IssueData; fields: BlueprintField[] }) => (
  <Flex
    align="center"
    gap="md"
    style={{
      padding: '12px 16px',
      background: 'var(--sk-bg-primary)',
      'min-height': '44px',
    }}
  >
    <Text size="sm" color="muted" style={{ 'min-width': '70px', 'flex-shrink': '0' }}>
      #{props.data.number}
    </Text>
    <Text size="sm" weight="medium" truncate style={{ flex: '1', 'min-width': '0' }}>
      {props.data.title}
    </Text>
    <Badge variant={statusVariant(props.data.status)}>{props.data.status}</Badge>
    <Badge variant="default">{props.data.labels[0]?.name}</Badge>
    <img
      src={props.data.assignee?.avatar}
      alt={props.data.assignee?.name}
      style={{ width: '20px', height: '20px', 'border-radius': '50%', 'flex-shrink': '0' }}
    />
    <Text size="xs" color="muted" style={{ 'min-width': '60px', 'text-align': 'right', 'flex-shrink': '0' }}>
      {formatTime(props.data.updatedAt)}
    </Text>
  </Flex>
);
