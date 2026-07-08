export interface RecordedAction {
  /** Milliseconds elapsed from recording start when this action was dispatched */
  relativeTime: number;
  /** The navigable ID that was targeted */
  target: string;
  /** The action name that was dispatched */
  action: string;
  /** The params passed to the action */
  params: unknown;
}

export interface ActionRecording {
  /** Unix timestamp (ms) when recording started */
  startedAt: number;
  /** Unix timestamp (ms) when recording was stopped (undefined if still recording) */
  endedAt?: number;
  /** Ordered list of recorded actions */
  events: RecordedAction[];
  /** Snapshot of all navigable states at the moment recording started */
  initialState: Record<string, unknown>;
}

export interface ReplayOptions {
  /** Playback speed multiplier — 2 means 2× speed (half the delay). Default: 1 */
  speed?: number;
  /** Called just before each action is dispatched during replay */
  onAction?: (event: RecordedAction, index: number) => void;
  /** Called once when all actions have been replayed */
  onComplete?: () => void;
  /** Whether to restore the recorded initial state before replaying. Default: true */
  restoreInitialState?: boolean;
}

export interface RecordingHandle {
  /** Stop recording and return the frozen session data */
  stop(): ActionRecording;
  /** Returns true while recording is still active */
  isRecording(): boolean;
  /** Returns the number of events captured so far */
  eventCount(): number;
}

export interface ReplayHandle {
  /** Pause replay — can be resumed later */
  pause(): void;
  /** Resume a paused replay */
  resume(): void;
  /** Stop replay entirely — cannot be resumed */
  stop(): void;
  /** Returns true while actively playing (not paused, not stopped) */
  isPlaying(): boolean;
  /** Returns true while paused */
  isPaused(): boolean;
  /** Returns the index of the next action to be dispatched (0 = not started, events.length = done) */
  progress(): number;
}
