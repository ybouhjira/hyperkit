---
title: Navigation Framework
sidebar_position: 2
description: A navigable registry with action dispatch, middleware, transports, persistence, and replay.
---

# Navigation Framework

The navigation framework (55+ exports) turns your UI into an addressable system: components register themselves as **navigables**, and anything — keyboard shortcuts, command palettes, remote processes, or an LLM — can dispatch typed actions to them. It includes middleware, transport adapters, persistence, state subscriptions, recording/replay, and DevTools.

## Core Registry

| Export                                      | Description                                              |
| ------------------------------------------- | -------------------------------------------------------- |
| `registerNavigable` / `unregisterNavigable` | Register/unregister a navigable component                |
| `getNavigable` / `getAllNavigables`         | Look up navigables by id or get all                      |
| `inspectNavigables`                         | Returns `NavigableInfo[]` — serializable registry dump   |
| `dispatchAction(target, action, params?)`   | Dispatch action to a navigable, returns `DispatchResult` |
| `clearNavigables`                           | Clear registry (testing)                                 |

## createNavigable

The SolidJS primitive. It auto-registers on mount and unregisters on cleanup:

```tsx
import { createNavigable, dispatchAction } from '@ybouhjira/hyperkit';

function TodoList() {
  const handle = createNavigable({
    id: 'todo-list',
    actions: {
      addItem: (params) => addTodo(String(params?.text ?? '')),
      clear: () => setTodos([]),
    },
  });

  // handle.addAction / handle.removeAction / handle.notifyStateChange
  return <ul>{/* ... */}</ul>;
}

// Anywhere else in the app (or from a server / MCP tool):
await dispatchAction('todo-list', 'addItem', { text: 'Ship docs' });
```

## Middleware

Five built-in middlewares intercept every dispatch:

| Export                        | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| `createPermissionMiddleware`  | read/write/admin permission levels per action                               |
| `createUndoRedoMiddleware`    | State capture, undo/redo stack with `UndoRedoHandle`                        |
| `createLoggingMiddleware`     | `console.group` with timing per action                                      |
| `createAnalyticsMiddleware`   | Action counts, durations, error rates (`AnalyticsMiddlewareHandle`)         |
| `createRateLimitMiddleware`   | Token bucket + debounce per rule set                                        |

Register with `addActionMiddleware`; configure permissions with `setActionPermission`.

## State Subscriptions & Snapshots

```ts
import { onStateChange, captureGlobalState, restoreGlobalState, diffState } from '@ybouhjira/hyperkit';

onStateChange('todo-list', (state) => console.log('todo state', state));

const snapshot = captureGlobalState(); // AppStateSnapshot of all navigables
restoreGlobalState(snapshot);
const changes = diffState(before, after);
```

`onActionDispatched(listener)` subscribes to the global action event stream; `getActionHistory()` returns the recorded history.

## Transport Adapters

Connect the registry to other processes with `connectTransport(adapter)`:

| Adapter                       | Use case                                     |
| ----------------------------- | -------------------------------------------- |
| `WebSocketTransportAdapter`   | Auto-reconnecting JSON over WebSocket        |
| `MessagePortTransportAdapter` | Worker/iframe communication via MessagePort  |
| `TauriIPCAdapter`             | Tauri desktop bridge                         |

## Persistence

| Export                                        | Description                                  |
| --------------------------------------------- | -------------------------------------------- |
| `LocalStorageAdapter`                         | Serializes state to localStorage with prefix |
| `MemoryStorageAdapter`                        | In-memory — for testing/SSR                  |
| `BroadcastChannelAdapter`                     | Cross-tab state sync                         |
| `enableStatePersistence(adapter, options)`    | Wire persistence into the registry           |
| `serializeGlobalState` / `hydrateGlobalState` | Manual serialization helpers                 |

## Transactions & Composite Actions

`dispatchTransaction(steps)` runs a multi-step dispatch atomically and returns a `TransactionResult`. `registerCompositeAction` names a reusable action sequence.

## Recording & Replay

```ts
import { startActionRecording, replaySession } from '@ybouhjira/hyperkit';

const recording = startActionRecording();
// ... user interacts ...
const session = recording.stop();

const replay = replaySession(session, { speed: 2 });
replay.start();
```

## Server Utilities

Expose the registry over HTTP or MCP:

| Export                  | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `createNavigableRouter` | Express/Hono-compatible router for navigable actions     |
| `generateMCPTools`      | Generate MCP tool definitions from the navigable registry |
| `routeMCPToolCall`      | Route an incoming MCP tool call to the correct navigable |
| `buildToolName`         | Construct an MCP tool name from navigable + action       |

This is what makes HyperKit apps AI-controllable: `generateMCPTools` turns every registered navigable action into an MCP tool an assistant can call. See the [LLM UI Controller guide](../guides/llm-ui-controller.md).

## DevTools, Health, Testing

- `createNavigableDevTools()` / `useDevTools()` — action log, state tree, filter UI
- `checkNavigableHealth()` — `NavigableHealth[]` with per-navigable status
- `TestNavigableRegistry` / `createTestRegistry` — isolated registries for tests

## Components & Hooks

| Export               | Description                            |
| -------------------- | -------------------------------------- |
| `NavigationProvider` | App-level navigation context           |
| `NavigationMenu`     | Auto-generated nav from the registry   |
| `PanelContentSlot`   | Renders registered content in a panel  |
| `useNavigation()`    | Access `NavigationContextValue`        |
| `useNavigable()`     | Register the current component         |
