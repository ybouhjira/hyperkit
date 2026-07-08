# SessionTabs

> Composite component — horizontal tab strip for switching between open chat sessions. Each tab shows a status dot (idle / streaming / error), name, optional unread count, and an inline close affordance. Optional trailing "+" button triggers `onNewTab`.

## Import

```ts
import { SessionTabs, type SessionTab, type TabSessionStatus } from '@ybouhjira/hyperkit';
```

## Props (`SessionTabsProps`)

| Prop          | Type                   | Required | Default | Description                                                                                         |
| ------------- | ---------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| `tabs`        | `SessionTab[]`         | Yes      | —       | Rendered left-to-right in array order.                                                              |
| `activeTabId` | `string`               | No       | —       | Tab matching this id gets `.sk-session-tab--active` + `data-active="true"`.                         |
| `onTabSelect` | `(id: string) => void` | No       | —       | Fires on tab body click. **Not** fired when the close affordance is clicked (it stops propagation). |
| `onTabClose`  | `(id: string) => void` | No       | —       | When provided, an `×` close element is rendered on every tab. Omit to hide closing.                 |
| `onNewTab`    | `() => void`           | No       | —       | When provided, a trailing `+` ghost `Button` is rendered. Omit to hide the new-tab affordance.      |
| `class`       | `string`               | No       | —       | Extra class on the root element.                                                                    |

## Types

```ts
type TabSessionStatus = 'idle' | 'streaming' | 'error';

interface SessionTab {
  id: string;
  name: string;
  status: TabSessionStatus;
  unreadCount?: number; // 0 or missing → badge hidden
}
```

## DOM / testing hooks

| Element          | Selector / attribute                             |
| ---------------- | ------------------------------------------------ |
| Root             | `[data-testid="session-tabs"]`                   |
| Tab button       | `[data-testid="session-tab"]`, `[data-active]`   |
| Status dot       | `.sk-session-tab__dot--{idle\|streaming\|error}` |
| Unread count     | Kobalte `Badge` variant `info`, `type="count"`   |
| Close affordance | `[data-testid="tab-close"]`, `role="button"`     |
| New tab button   | `[data-testid="new-tab-button"]`                 |

## Behavior notes

- The close `×` is a `<span role="button">`, not a nested `<button>`, to avoid nested interactive elements. It calls `e.stopPropagation()` before `onTabClose`.
- `unreadCount ?? 0` guards the badge — `undefined`, `null`, or `0` all hide it.
- The new-tab `+` uses `<Button variant="ghost" size="sm">` and only appears when `onNewTab` is defined.

## Examples

### Minimal

```tsx
<SessionTabs
  tabs={[{ id: '1', name: 'my-project', status: 'idle' }]}
  activeTabId="1"
  onTabSelect={setActive}
/>
```

### Full feature set

```tsx
<SessionTabs
  tabs={[
    { id: 'a', name: 'UI cleanup', status: 'streaming', unreadCount: 3 },
    { id: 'b', name: 'docs sweep', status: 'idle' },
    { id: 'c', name: 'autopilot', status: 'error' },
  ]}
  activeTabId={activeId()}
  onTabSelect={setActiveId}
  onTabClose={(id) => sessions.remove(id)}
  onNewTab={() => sessions.create({ name: 'New session', workingDirectory: cwd() })}
/>
```

## Related

- [`SessionIndicator`](./SessionIndicator.md) — single-session status pill (shares the dot/unread affordance).
- [`SessionManager`](./SessionManager.md) — full panel with grouped cards.
- [`SessionService`](./SessionService.md) — backing Effect service.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
