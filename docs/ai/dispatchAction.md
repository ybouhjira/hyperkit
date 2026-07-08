# dispatchAction

> Invoke a registered action on a navigable by **ID + action name**. This is the primary **write** surface for external agents. The function **never throws** — every error path (missing target, missing action, handler exception, middleware rejection) resolves to `{ ok: false, error }`.

## Import

```ts
import { dispatchAction } from '@ybouhjira/hyperkit';
import type { DispatchResult } from '@ybouhjira/hyperkit';
```

## Signature

```ts
function dispatchAction(target: string, action: string, params?: unknown): Promise<DispatchResult>;

interface DispatchResult {
  ok: boolean;
  data?: unknown; // handler return value (when ok)
  error?: string; // error message (when !ok)
}
```

## Behavior

- **Always async, always resolves.** No thrown errors reach the caller — handler throws become `{ ok: false, error: err.message }`.
- **Middleware pipeline runs first.** Registered middlewares (permissions, rate-limit, logging, analytics, undo/redo) execute around `coreDispatch`. Rejection from a middleware short-circuits with `ok: false`.
- **Always emits an `ActionEvent`** on the event stream (incl. failures) with `duration` in ms — subscribe via `onActionDispatched` or read the ring buffer via `getActionHistory`. Duration uses `performance.now()`.
- **Handlers are awaited.** `Promise.resolve(handler(params))` normalizes sync + async handlers.
- **Unknown IDs** resolve to `{ ok: false, error: 'Navigable "<id>" is not registered' }`.
- **Unknown action names** resolve to `{ ok: false, error: 'Action "<name>" not found on navigable "<id>"' }`.

## Example — direct invocation

```ts
const res = await dispatchAction('reports-list', 'select', { index: 3 });
if (!res.ok) console.error(res.error);
```

## Example — MCP bridge

```ts
app.post('/api/action', async (req, res) => {
  const { target, action, params } = req.body;
  const result = await dispatchAction(target, action, params);
  res.status(result.ok ? 200 : 400).json(result);
});
```

## Example — transaction (multi-step atomic)

Use [`dispatchTransaction`](./dispatchTransaction.md) when several actions must all succeed or all roll back. `dispatchAction` alone has no rollback.

## Gotchas

- `params` is `unknown` at runtime — validation is **your handler's job** unless you declared a `params` JSON Schema and wire `generateMCPTools` (which validates at the MCP boundary).
- `data` is also `unknown` — the caller must narrow it. If the handler is async and returns nothing, `data` is `undefined`.
- For high-frequency dispatches (scroll, drag), attach a rate-limit middleware — the event-stream ring buffer is 100 entries and will evict older events.

## Related

- [`createNavigable`](./createNavigable.md) — register the targets.
- [`inspectNavigables`](./inspectNavigables.md) — discover targets + their action schemas.
- [`dispatchTransaction`](./dispatchTransaction.md) — atomic multi-step variant.
- [`onActionDispatched`](./onActionDispatched.md) / [`getActionHistory`](./getActionHistory.md) — observe dispatches.
- [`addActionMiddleware`](./addActionMiddleware.md) — inject permissions / logging / analytics around dispatch.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
