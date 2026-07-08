# WebSocketService

**Kind:** service | **Category:** Effect Services

## Interface

| Method        | Type                                                             | Description |
| ------------- | ---------------------------------------------------------------- | ----------- |
| `connect`     | `(url: string) => Effect.Effect<void, WebSocketConnectionError>` | -           |
| `disconnect`  | `Effect.Effect<void, WebSocketError>`                            | -           |
| `send`        | `(message: WsMessage) => Effect.Effect<void, WebSocketError>`    | -           |
| `messages`    | `Stream.Stream<WsMessage, WebSocketError>`                       | -           |
| `isConnected` | `Effect.Effect<boolean>`                                         | -           |

## Import

```ts
import { WebSocketService } from '@ybouhjira/hyperkit';
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
