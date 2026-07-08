# FilterChip

> Component

## Props

| Prop       | Type                          | Required | Default | Description |
| ---------- | ----------------------------- | -------- | ------- | ----------- | --- |
| `label`    | `string`                      | Yes      | -       | -           |
| `selected` | `boolean`                     | No       | -       | -           |
| `onToggle` | `(selected: boolean) => void` | No       | -       | -           |
| `color`    | `string`                      | No       | -       | -           |
| `icon`     | `JSX.Element`                 | No       | -       | -           |
| `disabled` | `boolean`                     | No       | -       | -           |
| `size`     | `'sm'                         | 'md'`    | No      | -           | -   |
| `class`    | `string`                      | No       | -       | -           |
| `style`    | `JSX.CSSProperties`           | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { FilterChip } from '@ybouhjira/hyperkit';

<FilterChip>Content</FilterChip>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
