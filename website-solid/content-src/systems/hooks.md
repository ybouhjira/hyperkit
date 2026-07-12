---
title: Hooks
sidebar_position: 6
description: Reactive state, animation, gesture, audio, event bus, and Effect bridge hooks.
---

# Hooks

All hooks are included in the `@ybouhjira/hyperkit` package:

```bash
npm install @ybouhjira/hyperkit
```

---

## Reactive State Hooks

### `useBreakpoint`

Returns a reactive accessor for the current breakpoint based on window width. Automatically updates on resize.

**Signature:**

```typescript
function useBreakpoint(): Accessor<'phone' | 'tablet' | 'desktop' | 'wide' | 'tv'>;
```

**Breakpoints:**

| Value     | Min Width |
| --------- | --------- |
| `phone`   | 0px       |
| `tablet`  | 640px     |
| `desktop` | 1024px    |
| `wide`    | 1440px    |
| `tv`      | 1920px    |

**Usage:**

```typescript
import { useBreakpoint } from '@ybouhjira/hyperkit';

function Layout() {
  const breakpoint = useBreakpoint();

  return (
    <Show when={breakpoint() !== 'phone'}>
      <Sidebar />
    </Show>
  );
}
```

---

### `useMode`

Manages UI mode state with localStorage persistence. Modes control the overall UI density and feature visibility.

**Signature:**

```typescript
type Mode = 'developer' | 'focus' | 'tv' | 'distraction-free';

function useMode(initial?: Mode): UseModeReturn;

interface UseModeReturn {
  readonly mode: Accessor<Mode>;
  readonly setMode: (mode: Mode) => void;
  readonly getModeDefinition: (mode: Mode) => ModeDefinition;
}
```

**Usage:**

```typescript
import { useMode } from '@ybouhjira/hyperkit';

function App() {
  const { mode, setMode } = useMode('developer');

  return <button onClick={() => setMode('focus')}>{mode()}</button>;
}
```

---

### `useScrollProgress`

Tracks scroll position as a normalized 0–1 signal for scroll-linked animations. Throttled via `requestAnimationFrame`.

**Signature:**

```typescript
interface UseScrollProgressOptions {
  target?: HTMLElement | null; // defaults to window
  axis?: 'x' | 'y'; // default: 'y'
  throttle?: number; // ms between updates, default: 16
}

interface UseScrollProgressReturn {
  readonly progress: Accessor<number>; // 0 (top) to 1 (bottom)
  readonly scrollPosition: Accessor<number>; // raw px offset
  readonly scrollLength: Accessor<number>; // max scrollable px
  readonly direction: Accessor<'up' | 'down' | 'none'>;
}

function useScrollProgress(options?: UseScrollProgressOptions): UseScrollProgressReturn;
```

**Usage:**

```typescript
import { useScrollProgress } from '@ybouhjira/hyperkit';

function ScrollBar() {
  const { progress } = useScrollProgress();

  return <div style={{ width: `${progress() * 100}%` }} />;
}
```

---

## Animation / Physics Hooks

### `useSpring`

Physics-based spring animation using a damped harmonic oscillator. Driven by `requestAnimationFrame`, stops automatically when at rest.

**Signature:**

```typescript
interface SpringConfig {
  stiffness?: number; // default: 170
  damping?: number; // default: 26
  mass?: number; // default: 1
  precision?: number; // convergence threshold, default: 0.01
}

interface UseSpringReturn {
  readonly value: Accessor<number>;
  readonly set: (target: number) => void;
  readonly velocity: Accessor<number>;
  readonly isAnimating: Accessor<boolean>;
  readonly jump: (value: number) => void; // snap without animation
}

function useSpring(initialValue?: number, config?: SpringConfig): UseSpringReturn;
```

**Usage:**

```typescript
import { useSpring } from '@ybouhjira/hyperkit';

function Card() {
  const spring = useSpring(0, { stiffness: 200, damping: 20 });

  return (
    <div
      style={{ transform: `translateX(${spring.value()}px)` }}
      onMouseEnter={() => spring.set(10)}
      onMouseLeave={() => spring.set(0)}
    />
  );
}
```

---

### `useMotionValue`

Timed animation of a numeric value with configurable duration and CSS easing. Unlike `useSpring`, this has a deterministic duration suitable for UI transitions.

**Signature:**

```typescript
interface MotionValueOptions {
  duration?: number; // ms, default: 200
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'; // default: 'ease-out'
}

interface UseMotionValueReturn {
  readonly value: Accessor<number>;
  readonly set: (target: number, options?: MotionValueOptions) => void;
  readonly get: () => number; // non-reactive snapshot
  readonly jump: (value: number) => void;
  readonly isAnimating: Accessor<boolean>;
}

function useMotionValue(
  initial?: number,
  defaultOptions?: MotionValueOptions
): UseMotionValueReturn;
```

**Usage:**

```typescript
import { useMotionValue } from '@ybouhjira/hyperkit';

function FadeIn() {
  const opacity = useMotionValue(0, { duration: 300, easing: 'ease-out' });
  opacity.set(1);

  return <div style={{ opacity: opacity.value() }} />;
}
```

---

## Gesture & Input Hooks

### `useGesture`

Detects drag and swipe gestures using the Pointer Events API. Handles mouse, touch, and stylus unified. Velocity is sampled between consecutive `pointermove` events.

**Signature:**

```typescript
interface UseGestureOptions {
  drag?: boolean; // enable drag detection (default: true)
  swipe?: boolean; // enable swipe detection on drag end (default: true)
  swipeThreshold?: number; // min px distance to classify as swipe (default: 50)
  swipeVelocity?: number; // min px/ms velocity for swipe (default: 0.3)
  onDragStart?: (state: GestureState) => void;
  onDrag?: (state: GestureState) => void;
  onDragEnd?: (state: GestureState) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

interface GestureState {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  velocityX: number; // px/ms
  velocityY: number; // px/ms
  distance: number; // Euclidean distance from drag start
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

interface UseGestureReturn {
  ref: (el: HTMLElement) => void; // assign to the target element
  state: Accessor<GestureState>;
}

function useGesture(options?: UseGestureOptions): UseGestureReturn;
```

**Usage:**

```typescript
import { useGesture } from '@ybouhjira/hyperkit';

function Swipeable() {
  const gesture = useGesture({
    onSwipe: (dir) => console.log('swiped', dir),
    swipeThreshold: 80,
  });

  return <div ref={gesture.ref}>swipe me</div>;
}
```

---

### `useHaptic`

Haptic feedback via the Vibration API. Provides preset intensities (`light`, `medium`, `heavy`) and a custom pattern method.

**Signature:**

```typescript
interface HapticOptions {
  enabled?: boolean; // default: true
}

interface HapticReturn {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  custom: (pattern: number | number[]) => void;
  supported: boolean;
  enabled: () => boolean;
  setEnabled: (value: boolean) => void;
}

function useHaptic(options?: HapticOptions): HapticReturn;
```

**Usage:**

```typescript
import { useHaptic } from '@ybouhjira/hyperkit';

function SubmitButton() {
  const haptic = useHaptic();

  return <button onClick={() => haptic.medium()}>Submit</button>;
}
```

---

### `createHaptic`

Non-hook version of `useHaptic` for use outside of component context. Returns the same API minus reactive signals.

**Signature:**

```typescript
function createHaptic(options?: HapticOptions): {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  custom: (pattern: number | number[]) => void;
  supported: boolean;
  enabled: boolean; // plain boolean, not a signal
};
```

---

## Audio & Notification Hooks

### `useNotificationSound`

Plays a notification tone via the Web Audio API. Only plays when the browser tab is inactive (`document.hidden`). Returns reactive signals for `enabled` and `volume`.

**Signature:**

```typescript
interface NotificationSoundOptions {
  enabled?: boolean; // default: true
  volume?: number; // 0–1, default: 0.5
  frequency?: number; // Hz, default: 880 (A5)
  duration?: number; // ms, default: 150
}

interface NotificationSoundReturn {
  play: () => void;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  enabled: () => boolean;
  volume: () => number;
}

function useNotificationSound(options?: NotificationSoundOptions): NotificationSoundReturn;
```

**Usage:**

```typescript
import { useNotificationSound } from '@ybouhjira/hyperkit';

function ChatApp() {
  const sound = useNotificationSound({ volume: 0.3 });

  // Trigger when a new message arrives
  return <button onClick={() => sound.play()}>Test sound</button>;
}
```

---

### `createNotificationSound`

Non-hook version of `useNotificationSound` for use outside of component context. Uses plain variables instead of reactive signals.

**Signature:**

```typescript
function createNotificationSound(options?: NotificationSoundOptions): NotificationSoundReturn;
```

---

## Event Bus Hooks

### `createEventBus`

Creates a typed event bus with wildcard, `once`, and multi-subscriber support. Framework-agnostic — no SolidJS dependency.

**Signature:**

```typescript
interface EventBus<Events extends Record<string, unknown>> {
  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void;
  on<K extends keyof Events & string>(event: K, handler: (payload: Events[K]) => void): () => void;
  once<K extends keyof Events & string>(
    event: K,
    handler: (payload: Events[K]) => void
  ): () => void;
  onAny(handler: (event: string, payload: unknown) => void): () => void;
  off<K extends keyof Events & string>(event: K, handler: (payload: Events[K]) => void): void;
  clear(): void;
}

function createEventBus<Events extends Record<string, unknown>>(): EventBus<Events>;
```

**Usage:**

```typescript
import { createEventBus } from '@ybouhjira/hyperkit';

type AppEvents = {
  'message:received': { id: string; text: string };
  'session:ended': void;
};

const bus = createEventBus<AppEvents>();
bus.on('message:received', ({ id, text }) => console.log(id, text));
bus.emit('message:received', { id: '1', text: 'hello' });
```

---

### `useEventBus`

SolidJS hook that wraps an `EventBus` and automatically unsubscribes all listeners on component cleanup.

**Signature:**

```typescript
function useEventBus<Events extends Record<string, unknown>>(
  bus: EventBus<Events>
): {
  emit: EventBus<Events>['emit'];
  on: <K extends keyof Events & string>(event: K, handler: (payload: Events[K]) => void) => void;
};
```

**Usage:**

```typescript
import { createEventBus, useEventBus } from '@ybouhjira/hyperkit';

const bus = createEventBus<{ ping: string }>();

function Component() {
  const { on, emit } = useEventBus(bus);

  on('ping', (msg) => console.log('received', msg));

  return <button onClick={() => emit('ping', 'hello')}>Ping</button>;
}
```

---

## Logging Hook

### `useLogger`

Consumes an Effect `Stream<LogEntry>` and feeds entries into SolidJS reactive signals. Cleans up the fiber on component unmount.

**Signature:**

```typescript
interface UseLoggerOptions {
  maxItems?: number; // max entries to keep, default: 500
  onEntry?: (entry: LogEntry) => void; // called for each new entry
}

interface UseLoggerResult {
  readonly entries: () => ReadonlyArray<LogEntry>;
  readonly latest: () => LogEntry | undefined;
  readonly active: () => boolean;
  readonly stop: () => void;
}

function useLogger(stream: Stream.Stream<LogEntry>, options?: UseLoggerOptions): UseLoggerResult;
```

**Usage:**

```typescript
import { useLogger } from '@ybouhjira/hyperkit';
import { LoggingService } from '@ybouhjira/hyperkit';

function LogPanel() {
  // Obtain the stream from LoggingService
  const log = useLogger(loggingService.stream, { maxItems: 100 });

  return (
    <ul>
      <For each={log.entries()}>
        {(entry) => <li>{entry.message}</li>}
      </For>
      <button onClick={() => log.stop()}>Stop</button>
    </ul>
  );
}
```

---

## Media Hook

### `useVideoPreview`

Extracts thumbnail, duration, and dimensions from a video source URL using a hidden `<video>` element and Canvas API. Reacts to `src` changes.

**Signature:**

```typescript
interface UseVideoPreviewReturn {
  readonly thumbnail: Accessor<string | undefined>; // Object URL (blob:)
  readonly duration: Accessor<number>; // seconds
  readonly width: Accessor<number>; // pixels
  readonly height: Accessor<number>; // pixels
  readonly loading: Accessor<boolean>;
  readonly error: Accessor<string | undefined>;
}

function useVideoPreview(src: Accessor<string | undefined>): UseVideoPreviewReturn;
```

**Usage:**

```typescript
import { useVideoPreview } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function VideoCard() {
  const [src, setSrc] = createSignal<string | undefined>();
  const preview = useVideoPreview(src);

  return (
    <Show when={preview.thumbnail()}>
      <img src={preview.thumbnail()} alt="thumbnail" />
      <p>{preview.duration()}s — {preview.width()}×{preview.height()}</p>
    </Show>
  );
}
```

---

## LLM Hook

### `createLLMUIController`

Manages an LLM conversation with tool/action support. Connects an `LLMAdapter` (e.g. OpenAI, Claude) to a reactive message list and a registry of UI actions the model can invoke.

**Signature:**

```typescript
interface LLMUIControllerOptions {
  adapter: LLMAdapter; // backend integration
  systemPrompt?: string;
}

interface LLMUIControllerReturn {
  messages: Accessor<LLMMessage[]>;
  isProcessing: Accessor<boolean>;
  error: Accessor<string | null>;
  sendMessage: (content: string) => Promise<void>;
  registerAction: (action: UIAction) => void;
  unregisterAction: (name: string) => void;
  clearMessages: () => void;
  registeredActions: Accessor<UIAction[]>;
}

function createLLMUIController(options: LLMUIControllerOptions): LLMUIControllerReturn;
```

**Usage:**

```typescript
import { createLLMUIController } from '@ybouhjira/hyperkit';

function Chat() {
  const ctrl = createLLMUIController({ adapter: myAdapter, systemPrompt: 'You are helpful.' });

  ctrl.registerAction({
    name: 'openFile',
    description: 'Open a file in the editor',
    parameters: { path: { type: 'string', description: 'File path', required: true } },
    handler: ({ path }) => openFile(String(path)),
  });

  return <ChatWindow messages={ctrl.messages()} onSend={ctrl.sendMessage} />;
}
```

---

## Effect-SolidJS Bridge Hooks

### `createEffectResource`

Wraps an Effect program into a SolidJS reactive resource pattern. Automatically runs the effect on mount and provides reactive signals for data, error, and loading states.

**Usage:**

```typescript
import { createEffectResource } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';

function UserProfile() {
  const user = createEffectResource(
    () => Effect.promise(() => fetch('/api/user').then(r => r.json())),
    {
      onSuccess: (data) => console.log('User loaded:', data),
      onError: (err) => console.error('Failed to load user:', err),
    }
  );

  return (
    <div>
      {user.loading() && <p>Loading...</p>}
      {user.error() && <p>Error: {user.error()}</p>}
      {user.data() && <h1>Hello, {user.data().name}!</h1>}
      <button onClick={() => user.refetch()}>Reload</button>
    </div>
  );
}
```

**API:**

```typescript
interface EffectResourceOptions<A, E> {
  onSuccess?: (value: A) => void;
  onError?: (error: E) => void;
}

interface EffectResourceResult<A, E> {
  readonly data: () => A | undefined;
  readonly error: () => E | undefined;
  readonly loading: () => boolean;
  readonly refetch: () => void;
}

function createEffectResource<A, E>(
  effectFn: () => Effect.Effect<A, E>,
  options?: EffectResourceOptions<A, E>
): EffectResourceResult<A, E>;
```

### `createEffectStream`

Subscribes to an Effect Stream and feeds values into SolidJS signals. Useful for real-time data, WebSocket streams, or any continuous data flow.

**Usage:**

```typescript
import { createEffectStream } from '@ybouhjira/hyperkit';
import { Stream, Effect } from 'effect';

function LiveFeed() {
  const feed = createEffectStream(
    Stream.fromAsyncIterable(
      new WebSocket('wss://api.example.com/feed'),
      (err) => err
    ),
    {
      onItem: (msg) => console.log('New message:', msg),
      onComplete: () => console.log('Stream ended'),
    }
  );

  return (
    <div>
      <h2>Live Messages ({feed.items().length})</h2>
      {feed.error() && <p>Error: {feed.error()}</p>}
      <ul>
        <For each={feed.items()}>
          {(item) => <li>{item}</li>}
        </For>
      </ul>
      {feed.active() && <p>Connected...</p>}
      <button onClick={() => feed.stop()}>Disconnect</button>
    </div>
  );
}
```

**API:**

```typescript
interface EffectStreamOptions<A, E> {
  onItem?: (item: A) => void;
  onError?: (error: E) => void;
  onComplete?: () => void;
}

interface EffectStreamResult<A, E> {
  readonly items: () => ReadonlyArray<A>;
  readonly latest: () => A | undefined;
  readonly error: () => E | undefined;
  readonly active: () => boolean;
  readonly stop: () => void;
}

function createEffectStream<A, E>(
  stream: Stream.Stream<A, E>,
  options?: EffectStreamOptions<A, E>
): EffectStreamResult<A, E>;
```

## Features

- **Automatic cleanup**: Both hooks clean up fibers on component unmount
- **Cancellation**: `createEffectResource` cancels previous runs when refetching
- **Type-safe**: Full TypeScript support with proper Effect types
- **Reactive**: Integrates seamlessly with SolidJS reactivity system
- **Tested**: Comprehensive test coverage with Vitest

## Testing

All hooks include comprehensive tests:

```bash
npm test src/hooks/
```

Test coverage includes:

- Success and error cases
- Loading states
- Callbacks (onSuccess, onError, onItem, onComplete)
- Cleanup and cancellation
- Stream stopping

## Architecture

These hooks follow SolidJS conventions:

- Return stable references (no object creation on every render)
- Use signals for reactive state
- Integrate with `onCleanup` for proper disposal
- Follow the `createX` naming pattern

The Effect integration:

- Uses `Effect.runFork` for non-blocking execution
- Properly handles fiber interruption for cleanup
- Supports the full Effect type system (errors, context, etc.)
