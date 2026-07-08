# SessionService

> Effect-TS service — CRUD + active-session tracking for chat sessions. Exposed via `Context.GenericTag`, so consumers depend on the tag and supply a Layer implementation (in-memory, Tauri, HTTP, etc.).

## Import

```ts
import { SessionService, type Session, type CreateSessionParams } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';
```

## Types

```ts
interface Session {
  readonly id: string;
  readonly name: string;
  readonly workingDirectory: string;
  readonly createdAt: Date;
  readonly model?: string;
}

interface CreateSessionParams {
  readonly name: string;
  readonly workingDirectory: string;
  readonly model?: string;
}
```

## Service interface

```ts
interface SessionService {
  readonly create: (params: CreateSessionParams) => Effect.Effect<Session, SessionCreationError>;
  readonly get: (id: string) => Effect.Effect<Session, SessionNotFoundError>;
  readonly list: Effect.Effect<ReadonlyArray<Session>>;
  readonly remove: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly setActive: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly getActive: Effect.Effect<Session | null>;
}

const SessionService = Context.GenericTag<SessionService>('SessionService');
```

## Errors

- [`SessionCreationError`](./SessionCreationError.md) — thrown by `create`.
- [`SessionNotFoundError`](./SessionNotFoundError.md) — thrown by `get` / `remove` / `setActive`.

`list` and `getActive` never fail.

## Consumer pattern

```ts
import { Effect } from 'effect';
import { SessionService } from '@ybouhjira/hyperkit';

const openNew = (name: string, cwd: string) =>
  Effect.gen(function* () {
    const svc = yield* SessionService;
    const session = yield* svc.create({ name, workingDirectory: cwd });
    yield* svc.setActive(session.id);
    return session;
  });
```

## Providing a Layer

HyperKit intentionally does not ship a Layer — pick the one that fits your environment:

```ts
import { Layer, Effect, Ref } from 'effect';
import { SessionService, type Session } from '@ybouhjira/hyperkit';

// Minimal in-memory implementation (for tests, dev tooling)
export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const store = yield* Ref.make<Map<string, Session>>(new Map());
    const active = yield* Ref.make<string | null>(null);
    // … implement create/get/list/remove/setActive/getActive
    return SessionService.of({
      /* … */
    });
  })
);
```

For a real-world backend (file watcher, WS bridge, SQLite), swap the Ref for service calls — the tag contract is unchanged.

## Related

- [`SessionManager`](./SessionManager.md) — UI panel rendering the list.
- [`SessionTabs`](./SessionTabs.md) — active-session tab switcher.
- [`SessionSearch`](./SessionSearch.md) — search across sessions.
- [`SessionIndicator`](./SessionIndicator.md) — per-session status pill.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
