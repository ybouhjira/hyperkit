---
title: AnnotationLayer
description: Overlay layer for annotating content.
slug: /components/display/AnnotationLayer
---

# AnnotationLayer

Overlay layer for annotating content.

```tsx
import { AnnotationLayer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `annotations` * | `AnnotationLayerItem[]` | — | — |
| `enabled` | `boolean` | — | Whether annotation mode is active (crosshair cursor + click-to-annotate). |
| `onAnnotationCreate` | `(annotation: Omit<AnnotationLayerItem, 'id' \| 'timestamp'>) => void` | — | — |
| `onAnnotationReply` | `(annotationId: string, text: string) => void` | — | — |
| `onAnnotationResolve` | `(annotationId: string) => void` | — | — |
| `onAnnotationDelete` | `(annotationId: string) => void` | — | — |
| `showResolved` | `boolean` | `true` | Whether to show resolved annotations. |
| `children` * | `JSX.Element` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-bg-elevated`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-ease-out`, `--sk-error`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-2xs`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
