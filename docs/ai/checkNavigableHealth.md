# checkNavigableHealth

> Derives a per-navigable health report from the action history ring buffer. Computes error rate and last-activity age, then labels each navigable `healthy` / `degraded` / `unresponsive`. Pure function — all inputs are already in-memory.

## Import

```ts
import { checkNavigableHealth } from '@ybouhjira/hyperkit';
import type { NavigableHealth, HealthStatus, HealthCheckOptions } from '@ybouhjira/hyperkit';
```

## Signature

```ts
function checkNavigableHealth(options?: HealthCheckOptions): NavigableHealth[];

type HealthStatus = 'healthy' | 'degraded' | 'unresponsive';

interface NavigableHealth {
  id: string;
  label: string;
  status: HealthStatus;
  actionCount: number; // dispatches seen in the ring buffer for this target
  errorCount: number; // of those, how many had ok=false
  errorRate: number; // 0..1, 0 when actionCount=0
  lastActionTimestamp: number | null;
}

interface HealthCheckOptions {
  errorRateThreshold?: number; // default 0.1  → above this = 'degraded'
  inactivityThreshold?: number; // default 60_000 ms → older than this = 'unresponsive'
}
```

## Status rules

Applied in order, last rule wins:

1. Start with `healthy`.
2. If `errorRate > errorRateThreshold` → `degraded`.
3. If `actionCount > 0` **and** `now - lastActionTimestamp > inactivityThreshold` → `unresponsive`.

Navigables with `actionCount === 0` never become `unresponsive` (there's no baseline to compare against). Freshly-mounted navigables that have never been invoked always read as `healthy`.

## Data source

The action counts come from the in-memory ring buffer in `ActionEventStream` (capacity **100** events). For navigables receiving high action volume, old events are evicted — so `actionCount` is **at most 100** and reflects recent activity, not lifetime totals. If you need long-horizon stats, attach the analytics middleware.

## Example — DevTools panel

```tsx
const [health, setHealth] = createSignal<NavigableHealth[]>([]);
const timer = setInterval(() => setHealth(checkNavigableHealth()), 2000);
onCleanup(() => clearInterval(timer));

<For each={health()}>
  {(h) => (
    <Flex>
      <StatusDot status={h.status} />
      <Text>{h.label}</Text>
      <Badge>{(h.errorRate * 100).toFixed(0)}% err</Badge>
    </Flex>
  )}
</For>;
```

## Example — tuned thresholds

```ts
// Stricter: flag degraded at 5% errors, unresponsive after 10s idle
checkNavigableHealth({ errorRateThreshold: 0.05, inactivityThreshold: 10_000 });
```

## Related

- [`dispatchAction`](./dispatchAction.md) — feeds the history this reads.
- [`getActionHistory`](./getActionHistory.md) — raw ring buffer.
- [`createAnalyticsMiddleware`](./createAnalyticsMiddleware.md) — persistent counters beyond the 100-event window.
- [`inspectNavigables`](./inspectNavigables.md) — pair with this to build a "registry + health" overview.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
