# CommandPalette

> Component

## Props

| Prop            | Type                      | Required | Default | Description |
| --------------- | ------------------------- | -------- | ------- | ----------- |
| `open`          | `boolean`                 | Yes      | -       | -           |
| `onOpenChange`  | `(open: boolean) => void` | Yes      | -       | -           |
| `actions`       | `CommandAction[]`         | Yes      | -       | -           |
| `autoDiscover`  | `boolean`                 | No       | -       | -           |
| `extraCommands` | `CommandAction[]`         | No       | -       | -           |
| `placeholder`   | `string`                  | No       | -       | -           |
| `emptyMessage`  | `string`                  | No       | -       | -           |
| `class`         | `string`                  | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { CommandPalette } from '@ybouhjira/hyperkit';

<CommandPalette>Content</CommandPalette>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
