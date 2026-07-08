import { Badge, Text, Flex } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { statusVariant } from '../helpers/utils';

export const IssuePin = (props: { data: IssueData; fields: BlueprintField[] }) => (
  <Flex align="center" gap="sm" style={{ padding: '8px 12px', background: 'var(--sk-bg-secondary)', 'border-radius': 'var(--sk-radius-md)' }}>
    <Text size="sm" weight="medium" truncate>{props.data.title}</Text>
    <Badge variant={statusVariant(props.data.status)}>{props.data.status}</Badge>
  </Flex>
);
