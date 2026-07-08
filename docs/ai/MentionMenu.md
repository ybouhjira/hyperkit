# MentionMenu

> Component

## Props

| Prop            | Type                             | Required | Default | Description |
| --------------- | -------------------------------- | -------- | ------- | ----------- |
| `show`          | `boolean`                        | Yes      | -       | -           |
| `mentions`      | `MentionItem[]`                  | Yes      | -       | -           |
| `selectedIndex` | `number`                         | Yes      | -       | -           |
| `onSelect`      | `(mention: MentionItem) => void` | Yes      | -       | -           |
| `onHover`       | `(index: number) => void`        | Yes      | -       | -           |

## Examples

### Basic Usage

```tsx
import { MentionMenu } from '@ybouhjira/hyperkit';

<MentionMenu>Content</MentionMenu>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
