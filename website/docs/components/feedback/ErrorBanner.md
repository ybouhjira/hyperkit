---
title: ErrorBanner
description: Error, warning, and info banners.
slug: /components/feedback/ErrorBanner
---

# ErrorBanner

Error, warning, and info banners.

![ErrorBanner preview](/img/components/ErrorBanner.webp)

```tsx
import { ErrorBanner } from '@ybouhjira/hyperkit';
```

## Examples

### No Dismiss

```tsx
<ErrorBanner message="This banner cannot be dismissed." variant="error" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `message` * | `string` | — | Message text to display. |
| `onDismiss` | `() => void` | — | Callback when the dismiss button is clicked. |
| `variant` | `ErrorBannerVariant` | `'error'` | Visual style variant. |
| `class` | `string` | — | Additional CSS classes. |
| `autoDismissMs` | `number` | — | Auto-dismiss after timeout in milliseconds. 0 or undefined means no auto-dismiss. |
| `action` | `ErrorBannerAction` | — | Optional action button (e.g. "Retry"). |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-duration-fast`, `--sk-duration-slow`, `--sk-error`, `--sk-icon-lg`, `--sk-info`, `--sk-radius-lg`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-md`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-sm`, `--sk-warning`
