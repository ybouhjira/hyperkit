# Avatar

> Note: Avatar is not yet a standalone component in @ybouhjira/hyperkit (v2.5.0).

For avatar-like displays, compose existing components:

## Composing an Avatar

```tsx
import { Flex, Text, Badge } from "@ybouhjira/hyperkit";

// Initials avatar
<div
  style={{
    width: "40px",
    height: "40px",
    "border-radius": "50%",
    background: "var(--sk-accent)",
    color: "white",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "font-size": "var(--sk-font-size-sm)",
    "font-weight": "600",
  }}
>
  JD
</div>

// Avatar with image
<img
  src="/avatar.jpg"
  alt="John Doe"
  style={{
    width: "40px",
    height: "40px",
    "border-radius": "50%",
    "object-fit": "cover",
    border: "2px solid var(--sk-border)",
  }}
/>

// Avatar with online status badge
<div style={{ position: "relative", display: "inline-flex" }}>
  <img src="/avatar.jpg" alt="User" style={{ width: "40px", height: "40px", "border-radius": "50%" }} />
  <Badge
    type="dot"
    variant="success"
    style={{ position: "absolute", bottom: "0", right: "0", border: "2px solid var(--sk-bg-primary)" }}
  />
</div>
```

## Avatar Group Pattern

```tsx
import { Flex, Tooltip, Text } from '@ybouhjira/hyperkit';

// Overlapping avatar group
<Flex style={{ position: 'relative' }}>
  <For each={users().slice(0, 4)}>
    {(user, i) => (
      <Tooltip content={user.name}>
        <div
          style={{
            width: '32px',
            height: '32px',
            'border-radius': '50%',
            background: 'var(--sk-accent)',
            color: 'white',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-size': 'var(--sk-font-size-xs)',
            border: '2px solid var(--sk-bg-primary)',
            'margin-left': i() > 0 ? '-8px' : '0',
            position: 'relative',
            'z-index': i(),
          }}
        >
          {user.initials}
        </div>
      </Tooltip>
    )}
  </For>
  <Show when={users().length > 4}>
    <div
      style={{
        /* same style */ 'margin-left': '-8px',
        background: 'var(--sk-bg-tertiary)',
        color: 'var(--sk-text-secondary)',
      }}
    >
      +{users().length - 4}
    </div>
  </Show>
</Flex>;
```

## Related Components

- **Badge** — for status dots on avatars
- **Tooltip** — for showing full name on hover
- **Text** — for name/initials labels

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
