# SlashCommandMenu

> Component

## Props

| Prop            | Type                              | Required | Default | Description |
| --------------- | --------------------------------- | -------- | ------- | ----------- |
| `show`          | `boolean`                         | Yes      | -       | -           |
| `commands`      | `SlashCommand[]`                  | Yes      | -       | -           |
| `selectedIndex` | `number`                          | Yes      | -       | -           |
| `onSelect`      | `(command: SlashCommand) => void` | Yes      | -       | -           |
| `onHover`       | `(index: number) => void`         | Yes      | -       | -           |

## Examples

### Basic Usage

```tsx
import { SlashCommandMenu } from '@ybouhjira/hyperkit';

<SlashCommandMenu>Content</SlashCommandMenu>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
