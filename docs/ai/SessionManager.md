# SessionManager

> Composite component — session list panel grouped by project, status, or model. Each card exposes view/pause/resume/stop actions and renders embedded task progress + subagent tree.

## Import

```ts
import {
  SessionManager,
  type SessionInfo,
  type TaskProgress,
  type SessionSubagentInfo,
} from '@ybouhjira/hyperkit';
```

## Props (`SessionManagerProps`)

| Prop         | Type                               | Required | Default     | Description                                                                                      |
| ------------ | ---------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `sessions`   | `readonly SessionInfo[]`           | Yes      | —           | The full session set. Rendered grouped per `groupBy`.                                            |
| `groupBy`    | `'project' \| 'status' \| 'model'` | No       | `undefined` | `undefined` → single "All Sessions" bucket, group heading hidden. Any value → groups + headings. |
| `onViewChat` | `(sessionId: string) => void`      | No       | —           | Forwarded to each `SessionCard`. Called when user opens a session's chat view.                   |
| `onPause`    | `(sessionId: string) => void`      | No       | —           | Called for active sessions.                                                                      |
| `onResume`   | `(sessionId: string) => void`      | No       | —           | Called for paused sessions.                                                                      |
| `onStop`     | `(sessionId: string) => void`      | No       | —           | Terminate regardless of state.                                                                   |

## Types

```ts
interface SessionInfo {
  readonly id: string;
  readonly prompt: string;
  readonly status: 'active' | 'paused' | 'completed' | 'failed';
  readonly model: string; // 'opus' | 'sonnet' | 'haiku' | any string
  readonly project: string; // group key when groupBy='project'
  readonly startedAt: string; // ISO 8601
  readonly duration: number; // seconds
  readonly cost: number; // USD
  readonly tasks: readonly TaskProgress[];
  readonly subagents: readonly SessionSubagentInfo[];
}

interface TaskProgress {
  readonly id: string;
  readonly subject: string;
  readonly status: 'pending' | 'in_progress' | 'completed';
}

interface SessionSubagentInfo {
  readonly id: string;
  readonly model: 'opus' | 'sonnet' | 'haiku';
  readonly status: 'running' | 'waiting' | 'completed';
  readonly description: string;
  readonly startedAt: string; // ISO 8601
  readonly parentId: string | null; // null → top-level subagent
}
```

## Behavior

- Grouping is computed via `createMemo`; reordering `sessions` is cheap.
- When `groupBy` is omitted, the single "All Sessions" bucket renders **without** a heading (so the panel can be embedded in a section that already has a title).
- Each session renders as a `SessionCard` internally — the card handles the action buttons, task list, and subagent tree. The manager is a thin grouping/header layer.
- Subagents with `parentId === null` are top-level; others nest under their parent via `SubagentTreeNode`.

## Examples

### Minimal (no grouping)

```tsx
<SessionManager sessions={sessions()} onViewChat={openChat} />
```

### Grouped by status, with full controls

```tsx
<SessionManager
  sessions={sessions()}
  groupBy="status"
  onViewChat={(id) => router.push(`/chat/${id}`)}
  onPause={(id) => api.pause(id)}
  onResume={(id) => api.resume(id)}
  onStop={(id) => api.stop(id)}
/>
```

### Driven by `SessionService` (Effect)

```tsx
import { SessionService } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';

// `list` returns ReadonlyArray<Session>; map into SessionInfo in your adapter.
const load = Effect.gen(function* () {
  const svc = yield* SessionService;
  return yield* svc.list;
});
```

## Related

- [`SessionCard`](./SessionCard.md) — single-session row (rendered internally).
- [`SessionTabs`](./SessionTabs.md) — horizontal tab switcher for active sessions.
- [`SessionService`](./SessionService.md) — Effect service for CRUD + active-session tracking.
- [`SessionSearch`](./SessionSearch.md) — fuzzy search across sessions and their messages.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
