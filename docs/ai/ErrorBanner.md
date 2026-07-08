# ErrorBanner

> Component

## Props

| Prop            | Type                 | Required | Default | Description |
| --------------- | -------------------- | -------- | ------- | ----------- |
| `message`       | `string`             | Yes      | -       | -           |
| `onDismiss`     | `() => void`         | No       | -       | -           |
| `variant`       | `ErrorBannerVariant` | No       | -       | -           |
| `class`         | `string`             | No       | -       | -           |
| `autoDismissMs` | `number`             | No       | -       | -           |
| `action`        | `ErrorBannerAction`  | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ErrorBanner } from '@ybouhjira/hyperkit';

<ErrorBanner>Content</ErrorBanner>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
