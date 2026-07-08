import type { ActionEvent } from '@ybouhjira/hyperkit';
import type { Accessor } from 'solid-js';

export type TimelineEntry = ActionEvent;

export interface TimelineState {
  readonly entries: Accessor<readonly TimelineEntry[]>;
  readonly isPaused: Accessor<boolean>;
  readonly activeEntryId: Accessor<string | null>;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly clear: () => void;
  readonly setActiveEntry: (id: string | null) => void;
  readonly record: (entry: TimelineEntry) => void;
}

export interface TimelineProviderProps {
  readonly maxEntries?: number;
  readonly autoSubscribe?: boolean;
  readonly children: import('solid-js').JSX.Element;
}
