import { For } from 'solid-js';
import { Card, Stack, Separator } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { IssueRow } from './IssueRow';

export const IssueTable = (props: { data: IssueData[]; fields: BlueprintField[] }) => (
  <Card variant="outlined" padding="none">
    <Stack gap="none">
      <For each={props.data}>
        {(issue, i) => (
          <>
            <IssueRow data={issue} fields={props.fields} />
            {i() < props.data.length - 1 && <Separator />}
          </>
        )}
      </For>
    </Stack>
  </Card>
);
