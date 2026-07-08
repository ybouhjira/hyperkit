# MobileNav

> Component

## Props

| Prop              | Type                   | Required | Default | Description |
| ----------------- | ---------------------- | -------- | ------- | ----------- |
| `sessions`        | `MobileNavSession[]`   | Yes      | -       | -           |
| `activeSessionId` | `string`               | No       | -       | -           |
| `onSessionSelect` | `(id: string) => void` | No       | -       | -           |
| `hideAbove`       | `Breakpoint`           | No       | -       | -           |
| `class`           | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { MobileNav } from '@ybouhjira/hyperkit';

<MobileNav>Content</MobileNav>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
