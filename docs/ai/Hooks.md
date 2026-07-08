# Hooks

> Custom hooks for effects, streams, breakpoints, and UI control

## Available Hooks

- **createEffectResource** — Effect-based resource fetching
- **createEffectStream** — Effect-based streaming
- **useBreakpoint** — Responsive breakpoint detection
- **useMode** — Light/dark mode management
- **useHaptic** — Haptic feedback (mobile/desktop)
- **createLLMUIController** — LLM chat UI state controller

## createEffectResource

Fetch data using Effect library with resource pattern.

```typescript
import { createEffectResource } from '@ybouhjira/hyperkit/hooks';
import { Effect } from 'effect';

function UserProfile(props: { userId: string }) {
  const [user] = createEffectResource(
    () => props.userId,
    (id) => Effect.tryPromise(() => fetchUser(id))
  );

  return (
    <Show when={!user.loading} fallback={<Skeleton />}>
      <Text>{user()?.name}</Text>
    </Show>
  );
}
```

## createEffectStream

Stream data from Effect-based generators.

```typescript
import { createEffectStream } from '@ybouhjira/hyperkit/hooks';

function StreamingChat() {
  const [messages, addMessage] = createSignal<string[]>([]);

  const stream = createEffectStream(
    () => streamChatResponse(query()),
    (chunk) => addMessage((prev) => [...prev, chunk])
  );

  return <MessageList messages={messages()} />;
}
```

## useBreakpoint

Detect current responsive breakpoint.

```typescript
import { useBreakpoint } from '@ybouhjira/hyperkit/hooks';

function ResponsiveLayout() {
  const bp = useBreakpoint();

  return (
    <Show when={bp() === 'mobile'} fallback={<DesktopLayout />}>
      <MobileLayout />
    </Show>
  );
}
```

**Breakpoints:**

- `mobile`: < 640px
- `tablet`: 640px - 1024px
- `desktop`: > 1024px

## useMode

Manage light/dark mode with system preference detection.

```typescript
import { useMode } from '@ybouhjira/hyperkit/hooks';

function ThemeToggle() {
  const [mode, setMode] = useMode();

  return (
    <Button onClick={() => setMode(mode() === 'dark' ? 'light' : 'dark')}>
      {mode() === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
```

## useHaptic

Trigger haptic feedback for touch interactions.

```typescript
import { useHaptic } from '@ybouhjira/hyperkit/hooks';

function InteractiveButton() {
  const haptic = useHaptic();

  const handleClick = () => {
    haptic('medium'); // or 'light', 'heavy'
    performAction();
  };

  return <Button onClick={handleClick}>Click Me</Button>;
}
```

## createLLMUIController

State controller for LLM chat interfaces.

```typescript
import { createLLMUIController } from '@ybouhjira/hyperkit/hooks';

function ChatInterface() {
  const controller = createLLMUIController({
    onSend: async (message) => {
      return await sendToLLM(message);
    },
    onStream: (chunk) => {
      console.log('Received:', chunk);
    }
  });

  return (
    <div>
      <MessageList messages={controller.messages()} />
      <MessageInput
        value={controller.input()}
        onChange={controller.setInput}
        onSend={controller.send}
        loading={controller.isStreaming()}
      />
    </div>
  );
}
```

## Gotchas

- **Effect library required**: createEffectResource and createEffectStream require Effect library
- **useBreakpoint uses window**: Only works in browser environment (not SSR)
- **useMode syncs with system**: Automatically detects and respects OS dark mode preference
- **Haptics may not work everywhere**: Desktop browsers may ignore haptic feedback calls

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
