# captureGlobalState

> Walks the navigable registry and serializes `getState()` for every navigable that defined one. The result is a versioned `AppStateSnapshot` — safe to persist to disk, ship over the wire, or diff against a later snapshot.

## Import

```ts
import { captureGlobalState, restoreGlobalState, diffState } from '@ybouhjira/hyperkit';
import type { AppStateSnapshot } from '@ybouhjira/hyperkit';
```

## Signature

```ts
function captureGlobalState(): AppStateSnapshot;

interface AppStateSnapshot {
  timestamp: number; // Date.now() at capture
  version: number; // current snapshot schema = 1
  navigables: Record<string, unknown>; // id → whatever getState() returned
}
```

## Behavior

- **Synchronous.** Invokes every `getState` inline — keep them cheap.
- **Skips navigables without `getState`.** They simply do not appear in `navigables`.
- **Opaque values.** Each entry is `unknown` — the contract is whatever the source navigable defined. Always round-tripped through `JSON.stringify` by `diffState`, so **keep state JSON-serializable** (no `Date`, `Map`, `Set`, class instances, functions).
- **Point in time.** Re-call for a fresh snapshot; there is no live subscription.

## Example — autosave

```ts
// Every 10s, persist a snapshot to localStorage
setInterval(() => {
  localStorage.setItem('app-state', JSON.stringify(captureGlobalState()));
}, 10_000);

// On boot
const raw = localStorage.getItem('app-state');
if (raw) restoreGlobalState(JSON.parse(raw) as AppStateSnapshot);
```

## Example — diff two snapshots

```ts
const a = captureGlobalState();
await dispatchAction('reports-list', 'select', { index: 3 });
const b = captureGlobalState();

const changed = diffState(a, b);
// { 'reports-list': { before: { selectedIndex: 0 }, after: { selectedIndex: 3 } } }
```

## `restoreGlobalState(snapshot)`

Walks `snapshot.navigables` and calls `restoreState(value)` on every matching navigable that defined one. Navigables present in the snapshot but missing from the registry (e.g. not yet mounted) are silently skipped — this is intentional so partial reloads don't throw.

## `diffState(a, b)`

Compares two snapshots by stringified JSON per key. Returns `{ [id]: { before, after } }` only for changed entries. Keys present in one snapshot but not the other appear with `undefined` on the missing side.

## Versioning

`version` is currently `1`. Treat it as a forward-compatibility hook — when the snapshot shape changes you can gate `restoreGlobalState` on the version field and migrate.

## Related

- [`createNavigable`](./createNavigable.md) — supply `getState` / `restoreState` to participate.
- [`inspectNavigables`](./inspectNavigables.md) — richer per-navigable info (schema + state together) but NOT designed for persistence.
- [`enableStatePersistence`](./enableStatePersistence.md) — higher-level: auto-snapshot + restore via a `LocalStorageAdapter` / `BroadcastChannelAdapter`.
- [`startActionRecording`](./startActionRecording.md) / [`replaySession`](./replaySession.md) — capture _transitions_, not states.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
