---
title: RecordButton
description: Pulsing record/stop button.
slug: /components/input/RecordButton
---

# RecordButton

Pulsing record/stop button.

```tsx
import { RecordButton } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<RecordButton recording={false} />
```

### Recording

```tsx
<RecordButton recording />
```

### Disabled

```tsx
<RecordButton disabled />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `recording` | `boolean` | `false` | Whether recording is currently active. |
| `onToggle` | `(recording: boolean) => void` | — | Callback when recording state is toggled. |
| `disabled` | `boolean` | `false` | Disable the button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `import('solid-js').JSX.CSSProperties` | — | Inline styles. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-error`, `--sk-text-muted`
