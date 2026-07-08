---
title: ImagePreview
description: Image with zoom and overlay.
slug: /components/display/ImagePreview
---

# ImagePreview

Image with zoom and overlay.

![ImagePreview preview](/img/components/ImagePreview.webp)

```tsx
import { ImagePreview } from '@ybouhjira/hyperkit';
```

## Examples

### Empty State

```tsx
<ImagePreview images={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `images` * | `ImagePreviewItem[]` | — | Array of images to preview. |
| `onRemove` | `(id: string) => void` | — | Callback when remove button is clicked. |
| `maxVisible` | `number` | — | Maximum number of images to display. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border-default`, `--sk-border-muted`, `--sk-border-strong`, `--sk-border-width`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-focus-ring`, `--sk-icon-lg`, `--sk-icon-sm`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-secondary`
