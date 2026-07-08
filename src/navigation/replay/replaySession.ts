import { dispatchAction, restoreGlobalState } from '../NavigableRegistry';
import type { ActionRecording, ReplayHandle, ReplayOptions } from './types';

/**
 * Replay a previously recorded action session.
 *
 * Actions are replayed at their original relative timing, adjusted by the
 * `speed` multiplier. If `restoreInitialState` is true (the default), the
 * navigable state snapshot captured at recording start is restored before
 * the first action fires.
 *
 * @param input - An {@link ActionRecording} object or its JSON-serialized string
 * @param options - {@link ReplayOptions} controlling speed, callbacks, etc.
 * @returns A {@link ReplayHandle} for pausing, resuming, and stopping the replay
 */
export function replaySession(
  input: ActionRecording | string,
  options: ReplayOptions = {}
): ReplayHandle {
  let recording: ActionRecording;
  if (typeof input === 'string') {
    try {
      recording = JSON.parse(input) as ActionRecording;
    } catch (e) {
      throw new Error(
        `replaySession: failed to parse JSON input — ${e instanceof Error ? e.message : String(e)}`
      );
    }
  } else {
    recording = input;
  }
  const { speed = 1, onAction, onComplete, restoreInitialState = true } = options;

  if (restoreInitialState) {
    restoreGlobalState({
      timestamp: recording.startedAt,
      version: 1,
      navigables: recording.initialState,
    });
  }

  const events = recording.events;
  let currentIndex = 0;
  let playing = events.length > 0;
  let paused = false;
  let stopped = false;
  let completed = false;
  let currentTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /** Remaining delay (ms) when the replay was paused */
  let remainingDelay = 0;
  /** Wall-clock time when the current timeout was started */
  let timeoutStartedAt = 0;

  function completeOnce(): void {
    if (!completed) {
      completed = true;
      onComplete?.();
    }
  }

  function scheduleNext(delay: number): void {
    timeoutStartedAt = Date.now();
    currentTimeoutId = setTimeout(() => {
      currentTimeoutId = null;
      void dispatchNextAction();
    }, delay);
  }

  async function dispatchNextAction(): Promise<void> {
    if (stopped || paused) return;

    const event = events[currentIndex];
    if (event === undefined) {
      // All events exhausted
      playing = false;
      completeOnce();
      return;
    }

    const index = currentIndex;
    currentIndex++;

    onAction?.(event, index);

    try {
      await dispatchAction(event.target, event.action, event.params);
    } catch {
      // Dispatch failure should not silently swallow errors — stop replay and propagate
      stopped = true;
      playing = false;
      return;
    }

    // Guard: check stopped/paused AFTER the await resolves
    if (stopped || paused) return;

    const nextEvent = events[currentIndex];
    if (nextEvent === undefined) {
      playing = false;
      completeOnce();
      return;
    }

    // Delay until the next event relative to the current one
    const rawDelay = nextEvent.relativeTime - event.relativeTime;
    const delay = Math.max(0, rawDelay) / speed;
    scheduleNext(delay);
  }

  // Kick off the first action
  if (events.length > 0) {
    // The first action fires after its own relativeTime from t=0
    const firstDelay = Math.max(0, events[0]?.relativeTime ?? 0) / speed;
    scheduleNext(firstDelay);
  } else {
    playing = false;
    // Empty recording — fire onComplete synchronously
    completeOnce();
  }

  return {
    pause(): void {
      if (stopped || paused || !playing) return;
      paused = true;
      playing = false;
      if (currentTimeoutId !== null) {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
        remainingDelay = Math.max(0, remainingDelay - (Date.now() - timeoutStartedAt));
      }
    },

    resume(): void {
      if (stopped || !paused) return;
      paused = false;
      playing = true;
      scheduleNext(remainingDelay);
      remainingDelay = 0;
    },

    stop(): void {
      if (stopped) return;
      stopped = true;
      playing = false;
      paused = false;
      if (currentTimeoutId !== null) {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
      }
    },

    isPlaying(): boolean {
      return playing && !paused && !stopped;
    },

    isPaused(): boolean {
      return paused && !stopped;
    },

    progress(): number {
      return currentIndex;
    },
  };
}
