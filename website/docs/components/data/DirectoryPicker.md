---
title: DirectoryPicker
description: Directory selection dialog.
slug: /components/data/DirectoryPicker
---

# DirectoryPicker

Directory selection dialog.

![DirectoryPicker preview](/img/components/DirectoryPicker.webp)

```tsx
import { DirectoryPicker } from '@ybouhjira/hyperkit';
```

## Examples

### Loading

```tsx
<DirectoryPicker items={[]} currentPath="/home" loading />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `FileItem[]` | — | — |
| `currentPath` * | `string` | — | — |
| `onNavigate` | `(path: string) => void` | — | — |
| `onBack` | `() => void` | — | — |
| `onSelect` | `(path: string) => void` | — | — |
| `loading` | `boolean` | — | — |
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.
