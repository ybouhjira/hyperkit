import { Card, Badge, Text, Flex } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { statusVariant } from '../helpers/utils';

export const IssueCompactCard = (props: { data: IssueData; fields: BlueprintField[] }) => (
  <Card variant="outlined" padding="sm">
    <Flex justify="between" align="center" gap="sm">
      <Text size="sm" weight="medium" truncate style={{ flex: '1', 'min-width': '0' }}>
        {props.data.title}
      </Text>
      <Badge variant={statusVariant(props.data.status)}>{props.data.status}</Badge>
      <Text size="xs" color="muted">{props.data.commentCount} comments</Text>
    </Flex>
  </Card>
);
