---
title: SessionManager
description: Session CRUD panel.
slug: /components/chat-ai/SessionManager
---

# SessionManager

Session CRUD panel.

```tsx
import { SessionManager } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `sessions` * | `readonly SessionInfo[]` | — | — |
| `onViewChat` | `(sessionId: string) => void` | — | — |
| `onPause` | `(sessionId: string) => void` | — | — |
| `onResume` | `(sessionId: string) => void` | — | — |
| `onStop` | `(sessionId: string) => void` | — | — |
| `groupBy` | `'project' \| 'status' \| 'model'` | — | — |

`*` required prop.
