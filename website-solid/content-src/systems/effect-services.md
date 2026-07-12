---
title: Effect Services
sidebar_position: 7
description: Typed Effect-TS services for logging, sessions, WebSocket, file system, and clipboard.
---

# Effect Services

HyperKit ships first-class [Effect](https://effect.website/) services for common runtime concerns. Each service is a typed layer you compose into your Effect runtime — no singletons, no hidden globals, and every failure mode is a typed error.

| Service             | What it does                                                               |
| ------------------- | -------------------------------------------------------------------------- |
| `LoggingService`    | Structured log stream with transports, enrichment, redaction, and sampling |
| `SessionService`    | Create, list, activate, and remove named sessions                          |
| `WebSocketService`  | Auto-reconnecting WebSocket with typed message stream                      |
| `FileSystemService` | Directory listing, parent resolution, and `isDirectory` checks             |
| `ClipboardService`  | Copy/paste with typed `ClipboardError`                                     |

Exported error types: `WebSocketError`, `WebSocketConnectionError`, `SessionNotFoundError`, `SessionCreationError`, `FileSystemError`, `DirectoryNotFoundError`, `ClipboardError`, `ApiError`.

## LoggingService

```ts
interface LoggingService {
  readonly stream: Stream.Stream<LogEntry>;
  readonly getHistory: Effect.Effect<ReadonlyArray<LogEntry>>;
  readonly clear: Effect.Effect<void>;
}
```

Create a layer with `makeLoggingLayer`:

```ts
import { makeLoggingLayer, ConsoleTransport, HttpTransport } from '@ybouhjira/hyperkit';

const LoggingLayer = makeLoggingLayer({
  maxHistory: 500,
  context: { app: 'my-app', env: 'production' },
  redact: ['token', 'password'], // masked as [REDACTED]
  sampling: { rate: 0.1 }, // 10% of sessions sent to external transports
  transports: [
    ConsoleTransport({ format: 'pretty' }),
    HttpTransport({ url: 'https://logs.example.com/ingest' }),
  ],
});
```

The pipeline runs enrichment → redaction → sampling before entries reach transports.

**Built-in transports:** `ConsoleTransport` (pretty / json / logfmt), `HttpTransport` (batched POST), `BeaconTransport` (`navigator.sendBeacon` on page unload), `SentryTransport` (accepts any `SentryLike` interface). Build custom transports with the `SimpleTransport` / `ScopedTransport` wrappers.

`LogEntry` fields: `id`, `timestamp`, `level`, `message`, `fiberId`, `spans`, `annotations`, `cause`.

Subscribe from SolidJS components with `useLogger`:

```ts
import { useLogger } from '@ybouhjira/hyperkit';

const { entries, latest, active, stop } = useLogger(loggingService.stream);
```

## SessionService

```ts
interface SessionService {
  readonly create: (params: CreateSessionParams) => Effect.Effect<Session, SessionCreationError>;
  readonly get: (id: string) => Effect.Effect<Session, SessionNotFoundError>;
  readonly list: Effect.Effect<ReadonlyArray<Session>>;
  readonly remove: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly setActive: (id: string) => Effect.Effect<void, SessionNotFoundError>;
  readonly getActive: Effect.Effect<Session | null>;
}
```

`Session`: `{ id, name, workingDirectory, createdAt, model? }`.

## WebSocketService

```ts
interface WebSocketService {
  readonly connect: (url: string) => Effect.Effect<void, WebSocketConnectionError>;
  readonly disconnect: Effect.Effect<void, WebSocketError>;
  readonly send: (message: WsMessage) => Effect.Effect<void, WebSocketError>;
  readonly messages: Stream.Stream<WsMessage, WebSocketError>;
  readonly isConnected: Effect.Effect<boolean>;
}
```

```ts
import { Effect, Stream } from 'effect';
import { WebSocketService } from '@ybouhjira/hyperkit';

const program = Effect.gen(function* () {
  const ws = yield* WebSocketService;
  yield* ws.connect('wss://api.example.com/ws');
  yield* Stream.runForEach(ws.messages, (msg) => handleMessage(msg));
});
```

## FileSystemService

```ts
interface FileSystemService {
  readonly listDirectory: (
    path: string
  ) => Effect.Effect<ReadonlyArray<FileEntry>, FileSystemError | DirectoryNotFoundError>;
  readonly getParentDirectory: (path: string) => Effect.Effect<string>;
  readonly isDirectory: (path: string) => Effect.Effect<boolean, FileSystemError>;
}
```

`FileEntry`: `{ name, path, isDirectory, size?, modifiedAt? }`. This service backs [FileExplorer](../components/data/FileExplorer.mdx) and [DirectoryPicker](../components/data/DirectoryPicker.mdx).

## ClipboardService

```ts
interface ClipboardService {
  readonly copy: (text: string) => Effect.Effect<void, ClipboardError>;
  readonly paste: Effect.Effect<string, ClipboardError>;
}
```

## Bridging Effect and SolidJS

Two hooks connect Effect programs to SolidJS reactivity — see [Hooks](./hooks.md#effect-solidjs-bridge-hooks):

- `createEffectResource(effectFn)` — `{ data, error, loading, refetch }`
- `createEffectStream(stream)` — `{ items, latest, error, active, stop }`

Both fork fibers with `Effect.runFork` and interrupt them on component cleanup.
