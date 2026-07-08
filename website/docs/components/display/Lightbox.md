---
title: Lightbox
description: Fullscreen media lightbox.
slug: /components/display/Lightbox
---

# Lightbox

Fullscreen media lightbox.

```tsx
import { Lightbox } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `Accessor<boolean> \| boolean` | — | Whether the lightbox is open. |
| `onClose` * | `() => void` | — | Called when the lightbox should close. |
| `images` * | `LightboxImage[]` | — | Array of images to display. |
| `initialIndex` | `number` | `0` | Index of the initially displayed image. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-duration-fast`, `--sk-font-code`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-space-2xl`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-z-modal`
