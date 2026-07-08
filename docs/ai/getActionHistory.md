# getActionHistory

> Read the in-memory ring buffer of recent dispatched actions. Every call to `dispatchAction` (success or failure) appends one `ActionEvent` here before resolving.

## Import

```ts
import { getActionHistory } from '@ybouhjira/hyperkit';
import type { ActionEvent } from '@ybouhjira/hyperkit';
```

## Signature

```ts
function getActionHistory(limit?: number): ActionEvent[];

interface ActionEvent {
  id: string; // monotonic counter as string, resets via clearNavigables()
  target: string;
  action: string;
  params: unknown;
  result: DispatchResult; // { ok, data?, error? }
  timestamp: number; // Date.now() at dispatch completion
  duration: number; // performance.now() delta, ms
}
```

## Behavior

- **Ring buffer, capacity 100.** Older events are silently evicted. Capacity is not currently configurable.
- **Returns a copy.** Mutating the result is safe and doesn't affect the buffer.
- **`limit` returns the last N** (`slice(-limit)`), not the first N.
- Includes **failed** dispatches (check `result.ok`).
- Chronological order, oldest first.

## Example — last 20 events, DevTools table

```tsx
<For each={getActionHistory(20)}>
  {(e) => (
    <tr>
      <td>{e.target}</td>
      <td>{e.action}</td>
      <td>{e.result.ok ? '✓' : '✗'}</td>
      <td>{e.duration.toFixed(1)}ms</td>
    </tr>
  )}
</For>
```

## Example — slow-action audit

```ts
const slow = getActionHistory().filter((e) => e.duration > 100);
```

## Live stream vs polling

Polling `getActionHistory` works for a DevTools tab the user just opened. For a long-lived observer, subscribe once via [`onActionDispatched`](./onActionDispatched.md) — zero polling cost and you catch every event (no eviction race).

## Related

- [`onActionDispatched`](./onActionDispatched.md) — push-based listener for the same stream.
- [`clearActionHistory`](./clearActionHistory.md) — reset the buffer (tests).
- [`checkNavigableHealth`](./checkNavigableHealth.md) — derives per-navigable health from this buffer.
- [`startActionRecording`](./startActionRecording.md) — persistent capture for replay (not ring-limited).

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
