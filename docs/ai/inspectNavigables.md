# inspectNavigables

> Returns a serializable, handler-free dump of every currently registered navigable. This is the primary **read** surface for any external agent (MCP server, DevTools, Claude) — cheap (~1-2 KB typical), wire-safe, and always current.

## Import

```ts
import { inspectNavigables } from '@ybouhjira/hyperkit';
import type { NavigableInfo, NavigableActionSchema } from '@ybouhjira/hyperkit';
```

## Signature

```ts
function inspectNavigables(): NavigableInfo[];
```

## Return type

```ts
interface NavigableInfo {
  id: string;
  label: string;
  category?: string;
  actions: NavigableActionSchema[]; // handlers stripped
  state?: unknown; // result of getState() if defined
}

interface NavigableActionSchema {
  name: string;
  description: string;
  params?: Record<string, unknown>; // JSON Schema, if declared
}
```

## Behavior

- **Synchronous.** Calls every definition's `getState()` inline — keep those functions cheap and pure (no I/O, no heavy compute).
- **Handlers stripped.** The returned array is safe to `JSON.stringify` and send over any transport.
- **Insertion order preserved.** Reflects the order navigables mounted.
- **`state` only present when `getState` is defined** on the source navigable. Don't assume it exists.
- **No live binding.** The snapshot is plain data; call again for a fresh view.

## Example — MCP bridge

```ts
// Claude asks "what's on screen?" → hand it the registry
app.get('/api/registry', (_req, res) => {
  res.json(inspectNavigables());
});
```

## Example — in-process index

```ts
const allActions = inspectNavigables().flatMap((n) =>
  n.actions.map((a) => ({ id: n.id, action: a.name, desc: a.description }))
);
```

## Why this over `getAllNavigables()`

`getAllNavigables()` returns the raw `NavigableDefinition[]` **including live `Map<string, handler>` entries** — it is **not** wire-safe and won't round-trip JSON. Reserve it for in-process tooling that invokes handlers directly. For every external surface, use `inspectNavigables`.

## Related

- [`dispatchAction`](./dispatchAction.md) — the write counterpart.
- [`createNavigable`](./createNavigable.md) — register targets.
- [`checkNavigableHealth`](./checkNavigableHealth.md) — health overlay for the same registry.
- [`captureGlobalState`](./captureGlobalState.md) — snapshot only the `state` fields (different shape).

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
