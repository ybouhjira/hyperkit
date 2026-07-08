import { createContext, createSignal, onCleanup, onMount, useContext } from 'solid-js';
import type { JSX } from 'solid-js';
import { onActionDispatched } from '@ybouhjira/hyperkit';
import type { TimelineEntry, TimelineProviderProps, TimelineState } from './types';

const DEFAULT_MAX_ENTRIES = 10_000;

const TimelineContext = createContext<TimelineState>();

export function TimelineProvider(props: TimelineProviderProps): JSX.Element {
  const [entries, setEntries] = createSignal<readonly TimelineEntry[]>([]);
  const [isPaused, setIsPaused] = createSignal(false);
  const [activeEntryId, setActiveEntryId] = createSignal<string | null>(null);

  const cap = (): number => props.maxEntries ?? DEFAULT_MAX_ENTRIES;

  const record = (entry: TimelineEntry): void => {
    if (isPaused()) return;
    setEntries((prev) => {
      const next = prev.length >= cap() ? prev.slice(prev.length - cap() + 1) : prev.slice();
      next.push(entry);
      return next;
    });
  };

  onMount(() => {
    if (props.autoSubscribe === false) return;
    const unsubscribe = onActionDispatched((event) => record(event));
    onCleanup(unsubscribe);
  });

  const state: TimelineState = {
    entries,
    isPaused,
    activeEntryId,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    clear: () => {
      setEntries([]);
      setActiveEntryId(null);
    },
    setActiveEntry: (id) => setActiveEntryId(id),
    record,
  };

  return <TimelineContext.Provider value={state}>{props.children}</TimelineContext.Provider>;
}

export function useTimeline(): TimelineState {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error('useTimeline must be used within a <TimelineProvider>');
  }
  return ctx;
}
