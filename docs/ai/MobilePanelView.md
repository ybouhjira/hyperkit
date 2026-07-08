# MobilePanelView

> Component

## Props

| Prop          | Type                   | Required | Default | Description |
| ------------- | ---------------------- | -------- | ------- | ----------- |
| `tabs`        | `MobilePanelTab[]`     | Yes      | -       | -           |
| `activeId`    | `string`               | No       | -       | -           |
| `defaultId`   | `string`               | No       | -       | -           |
| `onTabChange` | `(id: string) => void` | No       | -       | -           |
| `class`       | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { MobilePanelView } from '@ybouhjira/hyperkit';

<MobilePanelView>Content</MobilePanelView>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
