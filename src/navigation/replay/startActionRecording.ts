import { captureGlobalState, onActionDispatched } from '../NavigableRegistry';
import type { ActionRecording, RecordingHandle } from './types';

/**
 * Start recording all navigable action dispatches.
 *
 * Captures the current global state snapshot as `initialState`, then subscribes
 * to every subsequent action dispatch until {@link RecordingHandle.stop} is called.
 *
 * @returns A {@link RecordingHandle} that lets you stop the recording and retrieve the data.
 */
export function startActionRecording(): RecordingHandle {
  const startedAt = Date.now();
  const initialStateSnapshot = captureGlobalState();
  const events: ActionRecording['events'] = [];
  let recording = true;

  const unsubscribe = onActionDispatched((event) => {
    if (!recording) return;
    events.push({
      relativeTime: event.timestamp - startedAt,
      target: event.target,
      action: event.action,
      params: event.params,
    });
  });

  return {
    stop(): ActionRecording {
      recording = false;
      unsubscribe();
      return {
        startedAt,
        endedAt: Date.now(),
        events: [...events],
        initialState: initialStateSnapshot.navigables,
      };
    },

    isRecording(): boolean {
      return recording;
    },

    eventCount(): number {
      return events.length;
    },
  };
}
