import { For } from 'solid-js';
import { Stack } from '@ybouhjira/hyperkit';
import type { BlueprintField } from '../../../src/annotation';
import type { IssueData } from '../helpers/data';
import { IssueCard } from './IssueCard';

export const IssueBoard = (props: { data: IssueData[]; fields: BlueprintField[] }) => (
  <Stack gap="md">
    <For each={props.data}>
      {(issue) => <IssueCard data={issue} fields={props.fields} />}
    </For>
  </Stack>
);
