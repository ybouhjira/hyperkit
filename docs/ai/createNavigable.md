# createNavigable

> SolidJS primitive that registers a component as a **navigable** — a target any external agent (MCP, WS, DevTools, Claude) can invoke by ID + action name. Auto-unregisters on the owner's `onCleanup`, so the usual case is zero-teardown.

## Import

```ts
import { createNavigable } from '@ybouhjira/hyperkit';
import type {
  NavigableHandle,
  CreateNavigableOptions,
  NavigableActionConfig,
} from '@ybouhjira/hyperkit';
```

## Signature

```ts
function createNavigable(options: CreateNavigableOptions): NavigableHandle;
```

## Options (`CreateNavigableOptions`)

| Field          | Type                       | Required | Description                                                                              |
| -------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `id`           | `string`                   | Yes      | Globally unique ID. Duplicates overwrite + log a `console.warn` in DEV.                  |
| `label`        | `string`                   | Yes      | Human label shown in DevTools / inspector output.                                        |
| `category`     | `string`                   | No       | Free-form grouping (`'panel'`, `'widget'`, `'dialog'`, …). Shown by DevTools.            |
| `actions`      | `NavigableActionConfig[]`  | Yes      | Initial action set. `addAction` / `removeAction` on the handle edit at runtime.          |
| `getState`     | `() => unknown`            | No       | Returns a **serializable** snapshot. Used by `inspectNavigables` + `captureGlobalState`. |
| `restoreState` | `(state: unknown) => void` | No       | Inverse of `getState`. Used by `restoreGlobalState` + replay.                            |

### `NavigableActionConfig<P, R>`

| Field         | Type                                 | Notes                                                                           |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `name`        | `string`                             | Unique within this navigable. Duplicate `addAction` overwrites.                 |
| `description` | `string`                             | Shown in MCP tool list + DevTools. **Write it for Claude, not for humans.**     |
| `params`      | `Record<string, unknown>` (optional) | JSON Schema for params. Consumed by `generateMCPTools` to produce typed tools.  |
| `handler`     | `(params: P) => R \| Promise<R>`     | Sync or async. Thrown errors become `{ ok: false, error }` in `DispatchResult`. |

## Handle (`NavigableHandle`)

| Member              | Signature                                      | Notes                                                               |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `id`                | `string`                                       | Echoes `options.id`.                                                |
| `addAction`         | `<P,R>(a: NavigableActionConfig<P,R>) => void` | Overwrites any existing action with the same name.                  |
| `removeAction`      | `(name: string) => void`                       | Safe to call for unknown names.                                     |
| `notifyStateChange` | `() => void`                                   | Call after mutating state to fire `onStateChange` listeners.        |
| `dispose`           | `() => void`                                   | Idempotent manual unregister. Called automatically via `onCleanup`. |

## Example

```tsx
function ReportsList() {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  createNavigable({
    id: 'reports-list',
    label: 'Reports List',
    category: 'panel',
    actions: [
      {
        name: 'select',
        description: 'Select a report by index',
        params: { type: 'object', properties: { index: { type: 'number' } }, required: ['index'] },
        handler: (p: { index: number }) => setSelectedIndex(p.index),
      },
      {
        name: 'next',
        description: 'Advance to the next report',
        handler: () => setSelectedIndex((i) => i + 1),
      },
    ],
    getState: () => ({ selectedIndex: selectedIndex() }),
    restoreState: (s) => setSelectedIndex((s as { selectedIndex: number }).selectedIndex),
  });

  return <div>…</div>;
}
```

## Behavior notes

- **Not reactive.** Changing `options.actions` after the first call has no effect — use `addAction`/`removeAction` on the handle.
- **Must be called inside a reactive owner** (component body, `createRoot`, etc.) for auto-cleanup to work. Calling at module scope leaks the registration.
- **`getState` must return JSON-serializable data.** It's stringified in `diffState` and over the wire by transport adapters.
- **`params` JSON Schema is optional but recommended** — `generateMCPTools` uses it to type MCP tool inputs for Claude.

## Related

- [`inspectNavigables`](./inspectNavigables.md) — snapshot every registered navigable.
- [`dispatchAction`](./dispatchAction.md) — invoke an action by ID + name.
- [`checkNavigableHealth`](./checkNavigableHealth.md) — per-navigable error-rate + activity health.
- [`captureGlobalState`](./captureGlobalState.md) — batch-snapshot every `getState`.
- [`useNavigable`](./useNavigable.md) — hook-style wrapper over this primitive.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
