---
title: ImageInput
description: Image upload with preview.
slug: /components/input/ImageInput
---

# ImageInput

Image upload with preview.

![ImageInput preview](/img/components/ImageInput.webp)

```tsx
import { ImageInput } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `File \| File[] \| null` | — | Currently selected image file(s). |
| `onChange` * | `(files: File \| File[] \| null) => void` | — | Callback when images are selected or removed. |
| `mode` | `'single' \| 'multiple'` | `'single'` | Selection mode: 'single' for one image, 'multiple' for many. |
| `accept` | `string` | `'image/*'` | Accepted MIME types. |
| `maxSize` | `number` | — | Maximum file size in bytes. |
| `placeholder` | `string` | `'Select image'` | Placeholder text shown when no images are selected. |
| `previewSize` | `number` | `80` | Preview thumbnail size in pixels. |
| `disabled` | `boolean` | `false` | Disable image selection. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |
| `onError` | `(error: { type: 'validation' \| 'format' \| 'size' \| 'corrupt'; message: string; file?: File; }) => void` | — | Callback when a file validation or processing error occurs. |
| `error` | `string` | — | Error message to display (controlled). When set, shows error state. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-subtle`, `--sk-bg-secondary`, `--sk-border`, `--sk-color-danger`, `--sk-color-danger-bg`, `--sk-font-size-sm`, `--sk-image-input-bg`, `--sk-image-input-border`, `--sk-image-input-preview-size`, `--sk-image-input-radius`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-space-xl`, `--sk-text-muted`
