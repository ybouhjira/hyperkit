---
title: Timeline
description: Vertical event timeline.
slug: /components/display/Timeline
---

# Timeline

Vertical event timeline.

![Timeline preview](/img/components/Timeline.webp)

```tsx
import { Timeline } from '@ybouhjira/hyperkit';
```

## Examples

### All Completed

```tsx
<Timeline
  steps={[
      { title: 'Step 1', status: 'completed' },
      { title: 'Step 2', status: 'completed' },
      { title: 'Step 3', status: 'completed' },
      { title: 'Step 4', status: 'completed' }
    ]}
/>
```

### Horizontal

```tsx
<Timeline
  steps={[
      { title: 'Order placed', status: 'completed' },
      { title: 'Processing', status: 'active' },
      { title: 'Shipped', status: 'pending' },
      { title: 'Delivered', status: 'pending' }
    ]}
  orientation="horizontal"
/>
```

### With Meta

```tsx
<Timeline
  steps={[
      {
        title: 'Account created',
        status: 'completed',
        meta: 'Jan 1, 2024'
      },
      {
        title: 'Email verified',
        status: 'completed',
        meta: 'Jan 2, 2024'
      },
      {
        title: 'Profile completed',
        status: 'active',
        meta: 'Just now'
      },
      { title: 'Start using app', status: 'pending' }
    ]}
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `steps` * | `TimelineStep[]` | — | Array of timeline steps. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Timeline orientation. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-muted`, `--sk-bg-tertiary`, `--sk-border`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
