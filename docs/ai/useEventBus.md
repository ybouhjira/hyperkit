# useEventBus

**Kind:** hook | **Category:** Hooks

## Signature

```ts
<Events extends Record<string, unknown>>(bus: EventBus<Events>) => { emit: <K extends keyof Events & string>(event: K, payload: Events[K]) => void; on: <K extends keyof Events & string>(event: K, handler: EventHandler<...>) => void; }
```

## Import

```ts
import { useEventBus } from '@ybouhjira/hyperkit';
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
