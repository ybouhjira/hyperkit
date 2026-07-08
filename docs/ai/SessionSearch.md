# SessionSearch

> Composite component — command-palette-style fuzzy search across open sessions **and** their message content. Controlled open state, debounced query, keyboard-navigable results. Rendered in a `Portal` so it overlays the app.

## Import

```ts
import { SessionSearch, type SessionData, type SessionSearchResult } from '@ybouhjira/hyperkit';
```

## Props (`SessionSearchProps`)

| Prop           | Type                                    | Required | Default              | Description                                                                                                   |
| -------------- | --------------------------------------- | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `sessions`     | `SessionData[]`                         | Yes      | —                    | Haystack. Searched by session `name` and every `messages[].content`.                                          |
| `onSelect`     | `(result: SessionSearchResult) => void` | Yes      | —                    | Called on Enter or click. Component does **not** close itself — call `onOpenChange(false)` from your handler. |
| `open`         | `boolean`                               | Yes      | —                    | Controlled visibility.                                                                                        |
| `onOpenChange` | `(open: boolean) => void`               | Yes      | —                    | Fired on Escape, backdrop click, or result selection if you wire it there.                                    |
| `placeholder`  | `string`                                | No       | `'Search sessions…'` | Passed through to the underlying `SearchInput`.                                                               |
| `emptyMessage` | `string`                                | No       | `'No results found'` | Shown when query is non-empty but no matches.                                                                 |
| `debounceMs`   | `number`                                | No       | `300`                | Query debounce window.                                                                                        |
| `class`        | `string`                                | No       | —                    | Extra class on the overlay container.                                                                         |

## Types

```ts
interface SessionData {
  id: string;
  name: string;
  messages: Array<{
    id: string;
    content: string;
  }>;
}

interface SessionSearchResult {
  sessionId: string;
  sessionName: string;
  messageId?: string; // present only when matchType === 'content'
  messageContent?: string;
  matchType: 'name' | 'content';
}
```

## Search behavior

- Query is lowercased + `trim()`-ed before matching. Empty query → empty result list (no "show all").
- Session **name** matches emit one result with `matchType: 'name'` and no `messageId`.
- Session **message** matches emit one result per matching message with `matchType: 'content'`, `messageId`, and `messageContent` (the full raw content — truncate for display yourself).
- Results are emitted in the order sessions are iterated, then by message order within a session. There is no ranking/scoring beyond substring match.

## Keyboard

| Key       | Action                                   |
| --------- | ---------------------------------------- |
| `↑` / `↓` | Move `selectedIndex` within results.     |
| `Enter`   | Fire `onSelect(results[selectedIndex])`. |
| `Esc`     | Fire `onOpenChange(false)`.              |

## Example

```tsx
import { createSignal, Show } from 'solid-js';
import { SessionSearch } from '@ybouhjira/hyperkit';

const [open, setOpen] = createSignal(false);

<Show when={open()}>
  <SessionSearch
    sessions={sessions()}
    open={open()}
    onOpenChange={setOpen}
    onSelect={(r) => {
      router.push(`/chat/${r.sessionId}${r.messageId ? `#${r.messageId}` : ''}`);
      setOpen(false);
    }}
    debounceMs={200}
    placeholder="Search sessions and messages (⌘K)…"
  />
</Show>;
```

## Integration tip — feeding from JSONL

If your source is Claude CLI JSONL transcripts , map each parsed session to a `SessionData`:

```ts
const toSessionData = (s: ParsedJsonlSession): SessionData => ({
  id: s.sessionId,
  name: s.summary ?? s.firstUserMessage.slice(0, 60),
  messages: s.entries
    .filter((e) => e.role === 'user' || e.role === 'assistant')
    .map((e) => ({
      id: e.uuid,
      content:
        typeof e.message.content === 'string'
          ? e.message.content
          : JSON.stringify(e.message.content),
    })),
});
```

## Related

- [`SessionManager`](./SessionManager.md) — full panel; often paired with this palette.
- [`CommandPalette`](./CommandPalette.md) — generic ⌘K palette; use this for session-specific UX.

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
