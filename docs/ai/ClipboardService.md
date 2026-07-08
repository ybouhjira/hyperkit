# ClipboardService

**Kind:** service | **Category:** Effect Services

## Interface

| Method  | Type                                                    | Description |
| ------- | ------------------------------------------------------- | ----------- |
| `copy`  | `(text: string) => Effect.Effect<void, ClipboardError>` | -           |
| `paste` | `Effect.Effect<string, ClipboardError>`                 | -           |

## Import

```ts
import { ClipboardService } from '@ybouhjira/hyperkit';
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
